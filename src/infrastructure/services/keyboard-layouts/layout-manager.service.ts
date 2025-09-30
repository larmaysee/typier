import {
  ILayoutManagerService,
  ILayoutProvider,
  ValidationResult,
  CompatibilityInfo,
  LayoutSearchCriteria
} from "@/domain/interfaces";
import { KeyboardLayout } from "@/domain/entities";
import { EnglishLayoutsService } from "./english-layouts.service";
import { LisuLayoutsService } from "./lisu-layouts.service";
import { MyanmarLayoutsService } from "./myanmar-layouts.service";
import { LanguageCode } from "@/domain";

/**
 * Central keyboard layout management service
 */
export class LayoutManagerService implements ILayoutManagerService {
  private layoutCache = new Map<string, KeyboardLayout[]>();
  private layoutProviders = new Map<LanguageCode, ILayoutProvider>();
  private activeLayouts = new Map<string, string>(); // sessionId -> layoutId

  constructor() {
    this.initializeLayoutProviders();
  }

  private initializeLayoutProviders(): void {
    this.layoutProviders.set(LanguageCode.EN, new EnglishLayoutsService());
    this.layoutProviders.set(LanguageCode.LI, new LisuLayoutsService());
    this.layoutProviders.set(LanguageCode.MY, new MyanmarLayoutsService());
  }

  async getLayoutsForLanguage(language: LanguageCode): Promise<KeyboardLayout[]> {
    const cacheKey = `layouts_${language}`;

    if (this.layoutCache.has(cacheKey)) {
      return this.layoutCache.get(cacheKey)!;
    }

    const provider = this.layoutProviders.get(language);
    if (!provider) {
      throw new Error(`No layout provider found for language: ${language}`);
    }

    try {
      const layouts = await provider.getAvailableLayouts();
      this.layoutCache.set(cacheKey, layouts);
      return layouts;
    } catch (error) {
      throw new Error(`Failed to get layouts for ${language}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async switchActiveLayout(sessionId: string, layoutId: string): Promise<void> {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    if (!layoutId) {
      throw new Error("Layout ID is required");
    }

    // Validate that the layout exists
    const layout = await this.getLayoutById(layoutId);
    if (!layout) {
      throw new Error(`Layout not found: ${layoutId}`);
    }

    // Validate the layout before switching
    const validation = await this.validateLayout(layout);
    if (!validation.isValid) {
      throw new Error(`Cannot switch to invalid layout: ${validation.errors.join(', ')}`);
    }

    this.activeLayouts.set(sessionId, layoutId);
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!layout.id) {
      errors.push("Layout ID is required");
    }

    if (!layout.name) {
      errors.push("Layout name is required");
    }

    if (!layout.language) {
      errors.push("Layout language is required");
    }

    if (!layout.keyMappings || layout.keyMappings.length === 0) {
      errors.push("Layout must have key mappings");
    }

    // Validate key mappings
    if (layout.keyMappings) {
      const keySet = new Set<string>();
      for (const mapping of layout.keyMappings) {
        if (!mapping.key) {
          errors.push("Key mapping must have a key");
        }

        if (!mapping.character) {
          errors.push(`Key mapping for '${mapping.key}' must have a character`);
        }

        if (keySet.has(mapping.key)) {
          warnings.push(`Duplicate key mapping for '${mapping.key}'`);
        }
        keySet.add(mapping.key);
      }
    }

    // Language-specific validation
    const provider = this.layoutProviders.get(layout.language);
    if (provider) {
      const providerValidation = await provider.validateLayout(layout);
      errors.push(...providerValidation.errors);
      if (providerValidation.warnings) {
        warnings.push(...providerValidation.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  async registerCustomLayout(layout: KeyboardLayout): Promise<void> {
    if (!layout) {
      throw new Error("Layout is required");
    }

    // Validate the layout
    const validation = await this.validateLayout(layout);
    if (!validation.isValid) {
      throw new Error(`Cannot register invalid layout: ${validation.errors.join(', ')}`);
    }

    // If not already marked as custom, create new layout with isCustom = true
    let layoutToRegister = layout;
    if (!layout.isCustom) {
      layoutToRegister = KeyboardLayout.create({
        id: layout.id,
        name: layout.name,
        displayName: layout.displayName,
        language: layout.language,
        layoutType: layout.layoutType,
        variant: layout.variant,
        inputMethod: layout.inputMethod,
        keyMappings: layout.keyMappings,
        metadata: layout.metadata,
        isCustom: true,
        isPublic: layout.isPublic,
        createdBy: layout.createdBy,
        createdAt: layout.createdAt,
        updatedAt: Date.now()
      });
    }

    // Clear cache for the language to include the new layout
    const cacheKey = `layouts_${layoutToRegister.language}`;
    this.layoutCache.delete(cacheKey);

    // In a real implementation, this would persist to a repository
    console.log(`Custom layout registered: ${layoutToRegister.id}`);
  }

  async getLayoutCompatibility(layoutId: string): Promise<CompatibilityInfo> {
    const layout = await this.getLayoutById(layoutId);
    if (!layout) {
      throw new Error(`Layout not found: ${layoutId}`);
    }

    // Basic compatibility info - in a real implementation this would be more sophisticated
    return {
      platforms: ['Windows', 'macOS', 'Linux', 'Web'],
      browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      inputMethods: [layout.inputMethod],
      unicodeVersion: this.getRequiredUnicodeVersion(layout)
    };
  }

  async getLayoutById(layoutId: string): Promise<KeyboardLayout | null> {
    // Search through all cached layouts
    for (const layouts of this.layoutCache.values()) {
      const found = layouts.find(layout => layout.id === layoutId);
      if (found) {
        return found;
      }
    }

    // If not cached, search through all providers
    for (const provider of this.layoutProviders.values()) {
      const layout = await provider.getLayoutById(layoutId);
      if (layout) {
        return layout;
      }
    }

    return null;
  }

  async searchLayouts(criteria: LayoutSearchCriteria): Promise<KeyboardLayout[]> {
    let allLayouts: KeyboardLayout[] = [];

    if (criteria.language) {
      // Search specific language
      allLayouts = await this.getLayoutsForLanguage(criteria.language);
    } else {
      // Search all languages
      for (const language of this.layoutProviders.keys()) {
        const layouts = await this.getLayoutsForLanguage(language);
        allLayouts.push(...layouts);
      }
    }

    // Apply filters
    return allLayouts.filter(layout => {
      if (criteria.namePattern && !layout.name.toLowerCase().includes(criteria.namePattern.toLowerCase())) {
        return false;
      }

      if (criteria.layoutType && layout.layoutType !== criteria.layoutType) {
        return false;
      }

      if (criteria.isCustom !== undefined && layout.isCustom !== criteria.isCustom) {
        return false;
      }

      // Note: tag filtering would require extending the layout entity
      return true;
    });
  }

  /**
   * Get the active layout for a session
   */
  getActiveLayout(sessionId: string): string | undefined {
    return this.activeLayouts.get(sessionId);
  }

  /**
   * Clear layout cache for a language
   */
  clearCache(language?: LanguageCode): void {
    if (language) {
      this.layoutCache.delete(`layouts_${language}`);
    } else {
      this.layoutCache.clear();
    }
  }

  private getRequiredUnicodeVersion(layout: KeyboardLayout): string {
    // Determine Unicode version based on characters used
    const allChars = layout.keyMappings.flatMap(mapping => [
      mapping.character,
      mapping.shiftCharacter || '',
      mapping.altCharacter || '',
      mapping.ctrlCharacter || ''
    ]).join('');

    // Simple heuristics - in reality this would be more comprehensive
    if (/[\u{A4D0}-\u{A4FF}]/u.test(allChars)) {
      return '5.1'; // Lisu block
    }

    if (/[\u{1000}-\u{109F}]/u.test(allChars)) {
      return '3.0'; // Myanmar block
    }

    return '1.1'; // Basic Latin
  }
}