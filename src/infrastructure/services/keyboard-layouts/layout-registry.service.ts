import {
  ILayoutRegistryService,
  LayoutSearchCriteria
} from "@/domain/interfaces";
import { KeyboardLayout } from "@/domain/entities";
import { LanguageCode } from "@/domain/enums";

/**
 * Dynamic keyboard layout registration service
 */
export class LayoutRegistryService implements ILayoutRegistryService {
  private registeredLayouts = new Map<string, KeyboardLayout>();
  private layoutsByLanguage = new Map<LanguageCode, Set<string>>();

  async registerLayout(layout: KeyboardLayout): Promise<void> {
    if (!layout || !layout.id) {
      throw new Error("Layout and layout ID are required");
    }

    if (this.registeredLayouts.has(layout.id)) {
      throw new Error(`Layout with ID ${layout.id} is already registered`);
    }

    // Validate the layout before registration
    this.validateLayoutForRegistration(layout);

    // Register the layout
    this.registeredLayouts.set(layout.id, { ...layout });

    // Index by language
    if (!this.layoutsByLanguage.has(layout.language)) {
      this.layoutsByLanguage.set(layout.language, new Set());
    }
    this.layoutsByLanguage.get(layout.language)!.add(layout.id);

    console.log(`Layout registered: ${layout.id} for language ${layout.language}`);
  }

  async unregisterLayout(layoutId: string): Promise<void> {
    if (!layoutId) {
      throw new Error("Layout ID is required");
    }

    const layout = this.registeredLayouts.get(layoutId);
    if (!layout) {
      throw new Error(`Layout not found: ${layoutId}`);
    }

    // Remove from main registry
    this.registeredLayouts.delete(layoutId);

    // Remove from language index
    const languageSet = this.layoutsByLanguage.get(layout.language);
    if (languageSet) {
      languageSet.delete(layoutId);
      if (languageSet.size === 0) {
        this.layoutsByLanguage.delete(layout.language);
      }
    }

    console.log(`Layout unregistered: ${layoutId}`);
  }

  async getLayoutsByLanguage(language: LanguageCode): Promise<KeyboardLayout[]> {
    const layoutIds = this.layoutsByLanguage.get(language);
    if (!layoutIds) {
      return [];
    }

    const layouts: KeyboardLayout[] = [];
    for (const layoutId of layoutIds) {
      const layout = this.registeredLayouts.get(layoutId);
      if (layout) {
        layouts.push({ ...layout }); // Return copy
      }
    }

    return layouts;
  }

  async searchLayouts(criteria: LayoutSearchCriteria): Promise<KeyboardLayout[]> {
    let layouts = Array.from(this.registeredLayouts.values());

    // Apply filters
    if (criteria.language) {
      layouts = layouts.filter(layout => layout.language === criteria.language);
    }

    if (criteria.namePattern) {
      const pattern = criteria.namePattern.toLowerCase();
      layouts = layouts.filter(layout => 
        layout.name.toLowerCase().includes(pattern) ||
        layout.displayName.toLowerCase().includes(pattern)
      );
    }

    if (criteria.layoutType) {
      layouts = layouts.filter(layout => layout.layoutType === criteria.layoutType);
    }

    if (criteria.isCustom !== undefined) {
      layouts = layouts.filter(layout => layout.isCustom === criteria.isCustom);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      // Note: This would require extending the KeyboardLayout entity to include tags
      // For now, we'll skip tag filtering
      console.warn("Tag filtering not yet implemented");
    }

    return layouts.map(layout => ({ ...layout })); // Return copies
  }

  async isLayoutRegistered(layoutId: string): Promise<boolean> {
    return this.registeredLayouts.has(layoutId);
  }

  /**
   * Get all registered layouts
   */
  getAllRegisteredLayouts(): KeyboardLayout[] {
    return Array.from(this.registeredLayouts.values()).map(layout => ({ ...layout }));
  }

  /**
   * Get layout statistics
   */
  getRegistryStatistics(): {
    totalLayouts: number;
    layoutsByLanguage: Record<string, number>;
    customLayouts: number;
  } {
    const layouts = Array.from(this.registeredLayouts.values());
    
    const layoutsByLanguage: Record<string, number> = {};
    let customLayouts = 0;

    for (const layout of layouts) {
      layoutsByLanguage[layout.language] = (layoutsByLanguage[layout.language] || 0) + 1;
      if (layout.isCustom) {
        customLayouts++;
      }
    }

    return {
      totalLayouts: layouts.length,
      layoutsByLanguage,
      customLayouts
    };
  }

  /**
   * Clear all registered layouts (for testing)
   */
  clearRegistry(): void {
    this.registeredLayouts.clear();
    this.layoutsByLanguage.clear();
  }

  /**
   * Import layouts from an external source
   */
  async importLayouts(layouts: KeyboardLayout[]): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const layout of layouts) {
      try {
        if (this.registeredLayouts.has(layout.id)) {
          skipped++;
          continue;
        }

        await this.registerLayout(layout);
        imported++;
      } catch (error) {
        errors.push(`Failed to import layout ${layout.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Export registered layouts
   */
  exportLayouts(language?: LanguageCode): KeyboardLayout[] {
    let layouts = Array.from(this.registeredLayouts.values());

    if (language) {
      layouts = layouts.filter(layout => layout.language === language);
    }

    return layouts.map(layout => ({ ...layout }));
  }

  private validateLayoutForRegistration(layout: KeyboardLayout): void {
    if (!layout.id || layout.id.trim().length === 0) {
      throw new Error("Layout must have a valid ID");
    }

    if (!layout.name || layout.name.trim().length === 0) {
      throw new Error("Layout must have a name");
    }

    if (!layout.language) {
      throw new Error("Layout must specify a language");
    }

    if (!layout.keyMappings || layout.keyMappings.length === 0) {
      throw new Error("Layout must have key mappings");
    }

    // Validate key mappings
    const keySet = new Set<string>();
    for (const mapping of layout.keyMappings) {
      if (!mapping.key) {
        throw new Error("All key mappings must have a key");
      }

      if (!mapping.normal) {
        throw new Error("All key mappings must have a normal character");
      }

      if (keySet.has(mapping.key)) {
        throw new Error(`Duplicate key mapping for key: ${mapping.key}`);
      }
      keySet.add(mapping.key);
    }

    // Ensure metadata exists
    if (!layout.metadata) {
      throw new Error("Layout must have metadata");
    }

    // Set default values for missing metadata
    if (!layout.metadata.description) {
      layout.metadata.description = `Custom ${layout.name} layout`;
    }

    if (!layout.metadata.author) {
      layout.metadata.author = 'User';
    }

    if (!layout.metadata.version) {
      layout.metadata.version = '1.0.0';
    }

    const now = new Date().toISOString().split('T')[0];
    if (!layout.metadata.createdDate) {
      layout.metadata.createdDate = now;
    }

    layout.metadata.lastModified = now;

    if (layout.metadata.inputMethods === undefined || layout.metadata.inputMethods.length === 0) {
      layout.metadata.inputMethods = ['keyboard'];
    }
  }
}