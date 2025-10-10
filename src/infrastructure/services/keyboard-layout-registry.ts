/**
 * Registry for managing keyboard layouts across multiple languages
 */

import { LanguageCode } from "@/domain";
import { LayoutVariant } from "@/domain/enums/keyboard-layouts";
import { LanguageLayoutDefinition, LanguageLayoutRegistry } from "@/domain/interfaces/language-layout-definition";
import { LanguageLayoutParser } from "./language-layout-parser";

// Import layout JSON files
import englishLayout from "@/layouts/english.json";
import lisuLayout from "@/layouts/lisu.json";
import myanmarLayout from "@/layouts/myanmar.json";

export class KeyboardLayoutRegistry implements LanguageLayoutRegistry {
  private layouts: Map<string, LanguageLayoutDefinition> = new Map();
  private languageLayouts: Map<LanguageCode, LanguageLayoutDefinition[]> = new Map();
  private initialized = false;

  constructor() {
    this.initializeDefaultLayouts();
  }

  /**
   * Initialize registry with default layouts from JSON files
   */
  private async initializeDefaultLayouts(): Promise<void> {
    if (this.initialized) return;

    try {
      // English layouts - QWERTY US
      const englishUS = LanguageLayoutParser.parseLegacyLayout(englishLayout.us, LanguageCode.EN, LayoutVariant.US);
      this.register(englishUS);

      // Lisu layouts - SIL Basic
      const lisuBasic = LanguageLayoutParser.parseLegacyLayout(
        lisuLayout.sil_basic,
        LanguageCode.LI,
        LayoutVariant.SIL_BASIC
      );
      this.register(lisuBasic);

      // Myanmar layouts - Unicode Standard
      const myanmarStandard = LanguageLayoutParser.parseLegacyLayout(
        myanmarLayout.unicode_myanmar,
        LanguageCode.MY,
        LayoutVariant.UNICODE_MYANMAR
      );
      this.register(myanmarStandard);

      this.initialized = true;
      console.log(`Initialized keyboard registry with ${this.layouts.size} layouts`);
    } catch (error) {
      console.error("Failed to initialize keyboard layouts:", error);
    }
  }

  /**
   * Register a new language layout
   */
  register(definition: LanguageLayoutDefinition): void {
    // Validate the definition first
    const validation = LanguageLayoutParser.validateDefinition(definition);
    if (!validation.isValid) {
      console.warn(`Invalid layout definition for ${definition.metadata.id}:`, validation.errors);
      return;
    }

    // Store in main registry
    this.layouts.set(definition.metadata.id, definition);

    // Store in language-specific registry
    if (!this.languageLayouts.has(definition.language)) {
      this.languageLayouts.set(definition.language, []);
    }

    const languageList = this.languageLayouts.get(definition.language)!;

    // Remove existing layout with same ID if it exists
    const existingIndex = languageList.findIndex((l) => l.metadata.id === definition.metadata.id);
    if (existingIndex >= 0) {
      languageList[existingIndex] = definition;
    } else {
      languageList.push(definition);
    }

    console.log(`Registered layout: ${definition.metadata.id} for ${definition.language}`);
  }

  /**
   * Get all layouts for a specific language
   */
  getLayoutsForLanguage(language: LanguageCode): LanguageLayoutDefinition[] {
    return this.languageLayouts.get(language) || [];
  }

  /**
   * Get a specific layout by ID
   */
  getLayout(id: string): LanguageLayoutDefinition | undefined {
    return this.layouts.get(id);
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): LanguageCode[] {
    return Array.from(this.languageLayouts.keys());
  }

  /**
   * Get all available layouts
   */
  getAllLayouts(): LanguageLayoutDefinition[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Search layouts by criteria
   */
  searchLayouts(criteria: {
    language?: LanguageCode;
    variant?: LayoutVariant;
    tags?: string[];
  }): LanguageLayoutDefinition[] {
    let results = this.getAllLayouts();

    if (criteria.language) {
      results = results.filter((layout) => layout.language === criteria.language);
    }

    if (criteria.variant) {
      results = results.filter((layout) => layout.variant === criteria.variant);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((layout) => criteria.tags!.some((tag) => layout.metadata.tags.includes(tag)));
    }

    return results;
  }

  /**
   * Get default layout for a language
   */
  getDefaultLayoutForLanguage(language: LanguageCode): LanguageLayoutDefinition | undefined {
    const layouts = this.getLayoutsForLanguage(language);

    // Return the first non-custom layout, or the first layout if all are custom
    return layouts.find((l) => !l.metadata.isCustom) || layouts[0];
  }

  /**
   * Get layout statistics
   */
  getStatistics() {
    const stats = {
      totalLayouts: this.layouts.size,
      languageCount: this.languageLayouts.size,
      customLayouts: 0,
      publicLayouts: 0,
      layoutsByLanguage: {} as Record<string, number>,
      layoutsByType: {} as Record<string, number>,
    };

    for (const layout of this.layouts.values()) {
      if (layout.metadata.isCustom) stats.customLayouts++;
      if (layout.metadata.isPublic) stats.publicLayouts++;

      // Count by language
      stats.layoutsByLanguage[layout.language] = (stats.layoutsByLanguage[layout.language] || 0) + 1;

      // Count by type
      stats.layoutsByType[layout.variant] = (stats.layoutsByType[layout.variant] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export layout definition for backup/sharing
   */
  exportLayout(id: string): string | null {
    const layout = this.getLayout(id);
    if (!layout) return null;

    return JSON.stringify(layout, null, 2);
  }

  /**
   * Import layout definition from JSON
   */
  importLayout(jsonString: string): boolean {
    try {
      const definition = JSON.parse(jsonString) as LanguageLayoutDefinition;
      this.register(definition);
      return true;
    } catch (error) {
      console.error("Failed to import layout:", error);
      return false;
    }
  }

  /**
   * Remove a layout from the registry
   */
  removeLayout(id: string): boolean {
    const layout = this.layouts.get(id);
    if (!layout) return false;

    // Remove from main registry
    this.layouts.delete(id);

    // Remove from language-specific registry
    const languageList = this.languageLayouts.get(layout.language);
    if (languageList) {
      const index = languageList.findIndex((l) => l.metadata.id === id);
      if (index >= 0) {
        languageList.splice(index, 1);
      }

      // Remove language entry if no layouts remain
      if (languageList.length === 0) {
        this.languageLayouts.delete(layout.language);
      }
    }

    console.log(`Removed layout: ${id}`);
    return true;
  }

  /**
   * Clear all layouts (useful for testing)
   */
  clear(): void {
    this.layouts.clear();
    this.languageLayouts.clear();
    this.initialized = false;
  }

  /**
   * Ensure the registry is initialized
   */
  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDefaultLayouts();
    }
  }
}

// Singleton instance
export const keyboardLayoutRegistry = new KeyboardLayoutRegistry();
