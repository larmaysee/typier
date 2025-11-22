import { DifficultyLevel, FingerAssignment, LanguageCode, LayoutVariant } from "@/domain";
import { KeyboardLayout } from "@/domain/entities";
import type { KeyMapping } from "@/domain/entities/keyboard-layout";
import { IKeyboardLayoutRepository } from "@/domain/interfaces";
import { NotFoundError, RepositoryError } from "@/shared/errors";
import type { ILogger } from "@/shared/utils/logger";
import { LocalStorageClient } from "../../persistence/local-storage/storage-client";

export class LocalKeyboardLayoutRepository implements IKeyboardLayoutRepository {
  private readonly LAYOUTS_KEY_PREFIX = "keyboard_layouts";
  private readonly USER_PREFERENCES_KEY_PREFIX = "user_layout_preferences";
  private readonly BUILT_IN_LAYOUTS_KEY = "built_in_layouts";

  constructor(private storage: LocalStorageClient, private logger: ILogger) {
    // Initialize built-in layouts if they don't exist
    this.initializeBuiltInLayouts();
  }

  async getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]> {
    try {
      const builtInLayouts = await this.getBuiltInLayouts(language);
      const customLayouts = await this.getCustomLayouts(language);

      const allLayouts = [...builtInLayouts, ...customLayouts];
      allLayouts.sort((a, b) => a.name.localeCompare(b.name));

      return allLayouts;
    } catch (error) {
      this.logger.error(`Failed to get available layouts for language: ${language}`, error as Error);
      throw new RepositoryError("Failed to get available layouts", error as Error);
    }
  }

  async getLayoutById(layoutId: string): Promise<KeyboardLayout | null> {
    try {
      // Try custom layouts first
      const customLayout = await this.storage.getItem<KeyboardLayout>(`${this.LAYOUTS_KEY_PREFIX}:${layoutId}`);
      if (customLayout) {
        return customLayout;
      }

      // Then try built-in layouts
      const builtInLayouts = await this.getAllBuiltInLayouts();
      return builtInLayouts.find((layout) => layout.id === layoutId) || null;
    } catch (error) {
      this.logger.error(`Failed to get layout: ${layoutId}`, error as Error);
      throw new RepositoryError("Failed to get layout", error as Error);
    }
  }

  async saveCustomLayout(layout: KeyboardLayout): Promise<void> {
    try {
      if (!layout.isCustom) {
        throw new RepositoryError("Cannot save built-in layout as custom");
      }

      await this.storage.setItem(`${this.LAYOUTS_KEY_PREFIX}:${layout.id}`, layout);
      this.logger.info(`Saved custom layout: ${layout.id}`);
    } catch (error) {
      this.logger.error("Failed to save custom layout", error as Error);
      throw error instanceof RepositoryError
        ? error
        : new RepositoryError("Failed to save custom layout", error as Error);
    }
  }

  async getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null> {
    try {
      const preferences = await this.storage.getItem<Record<LanguageCode, string>>(
        `${this.USER_PREFERENCES_KEY_PREFIX}:${userId}`
      );
      return preferences?.[language] || null;
    } catch (error) {
      this.logger.error(`Failed to get user preferred layout for ${userId}, ${language}`, error as Error);
      return null; // Return null to allow fallback
    }
  }

  async setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void> {
    try {
      // Verify the layout exists
      const layout = await this.getLayoutById(layoutId);
      if (!layout) {
        throw new NotFoundError(`Layout not found: ${layoutId}`);
      }

      if (layout.language !== language) {
        throw new RepositoryError(`Layout language mismatch: expected ${language}, got ${layout.language}`);
      }

      // Get existing preferences or create new
      const preferences =
        (await this.storage.getItem<Record<LanguageCode, string>>(`${this.USER_PREFERENCES_KEY_PREFIX}:${userId}`)) ||
        ({} as Record<LanguageCode, string>);
      preferences[language] = layoutId;

      await this.storage.setItem(`${this.USER_PREFERENCES_KEY_PREFIX}:${userId}`, preferences);
      this.logger.info(`Set preferred layout for user ${userId}, language ${language}: ${layoutId}`);
    } catch (error) {
      this.logger.error("Failed to set user preferred layout", error as Error);
      throw error instanceof NotFoundError || error instanceof RepositoryError
        ? error
        : new RepositoryError("Failed to set user preferred layout", error as Error);
    }
  }

  async deleteCustomLayout(layoutId: string, userId: string): Promise<void> {
    try {
      // Verify the layout exists and belongs to the user
      const layout = await this.storage.getItem<KeyboardLayout>(`${this.LAYOUTS_KEY_PREFIX}:${layoutId}`);

      if (!layout) {
        throw new NotFoundError(`Layout not found: ${layoutId}`);
      }

      if (!layout.isCustom) {
        throw new RepositoryError("Cannot delete built-in layout");
      }

      if (layout.createdBy !== userId) {
        throw new RepositoryError("User does not have permission to delete this layout");
      }

      await this.storage.removeItem(`${this.LAYOUTS_KEY_PREFIX}:${layoutId}`);
      this.logger.info(`Deleted custom layout: ${layoutId}`);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof RepositoryError) {
        throw error;
      }
      this.logger.error(`Failed to delete custom layout: ${layoutId}`, error as Error);
      throw new RepositoryError("Failed to delete custom layout", error as Error);
    }
  }

  async getAllCustomLayouts(userId: string): Promise<KeyboardLayout[]> {
    try {
      const allKeys = await this.storage.getAllKeys();
      const layoutKeys = allKeys.filter((key) => key.startsWith(this.LAYOUTS_KEY_PREFIX));
      const customLayouts: KeyboardLayout[] = [];

      for (const key of layoutKeys) {
        const layout = await this.storage.getItem<KeyboardLayout>(key);
        if (layout && layout.isCustom && layout.createdBy === userId) {
          customLayouts.push(layout);
        }
      }

      customLayouts.sort((a, b) => a.name.localeCompare(b.name));
      return customLayouts;
    } catch (error) {
      this.logger.error(`Failed to get custom layouts for user: ${userId}`, error as Error);
      throw new RepositoryError("Failed to get custom layouts", error as Error);
    }
  }

  private async initializeBuiltInLayouts(): Promise<void> {
    try {
      const existing = await this.storage.getItem<KeyboardLayout[]>(this.BUILT_IN_LAYOUTS_KEY);
      if (!existing) {
        const builtInLayouts = this.createBuiltInLayouts();
        await this.storage.setItem(this.BUILT_IN_LAYOUTS_KEY, builtInLayouts);
        this.logger.info("Initialized built-in keyboard layouts");
      }
    } catch (error) {
      this.logger.error("Failed to initialize built-in layouts", error as Error);
    }
  }

  private async getAllBuiltInLayouts(): Promise<KeyboardLayout[]> {
    const layouts = await this.storage.getItem<KeyboardLayout[]>(this.BUILT_IN_LAYOUTS_KEY);
    return layouts || [];
  }

  private async getBuiltInLayouts(language: LanguageCode): Promise<KeyboardLayout[]> {
    const allLayouts = await this.getAllBuiltInLayouts();
    return allLayouts.filter((layout) => layout.language === language);
  }

  private async getCustomLayouts(language: LanguageCode): Promise<KeyboardLayout[]> {
    try {
      const allKeys = await this.storage.getAllKeys();
      const layoutKeys = allKeys.filter((key) => key.startsWith(this.LAYOUTS_KEY_PREFIX));
      const customLayouts: KeyboardLayout[] = [];

      for (const key of layoutKeys) {
        const layout = await this.storage.getItem<KeyboardLayout>(key);
        if (layout && layout.isCustom && layout.language === language) {
          customLayouts.push(layout);
        }
      }

      return customLayouts;
    } catch {
      return [];
    }
  }

  private createBuiltInLayouts(): KeyboardLayout[] {
    // This is a simplified set of built-in layouts
    // In a real implementation, these would be more comprehensive
    return [
      // English layouts
      KeyboardLayout.create({
        id: "en_qwerty_us",
        name: "QWERTY US",
        displayName: "QWERTY (US)",
        language: LanguageCode.EN,
        variant: "us" as LayoutVariant,
        keyMappings: this.createQwertyUSMappings(),
        metadata: {
          description: "Standard US QWERTY keyboard layout",
          author: "System",
          version: "1.0",
          dateCreated: Date.now(),
          lastModified: Date.now(),
          compatibility: ["Windows", "macOS", "Linux", "Web"],
          tags: ["standard", "qwerty", "english"],
          difficulty: "easy" as DifficultyLevel,
          popularity: 100,
        },
        isCustom: false,
        isPublic: true,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
      // Lisu layouts
      KeyboardLayout.create({
        id: "li_sil_basic",
        name: "SIL Basic",
        displayName: "SIL Basic",
        language: LanguageCode.LI,
        variant: "sil_basic" as LayoutVariant,
        keyMappings: this.createSILBasicMappings(),
        metadata: {
          description: "SIL Basic keyboard layout for Lisu",
          author: "SIL International",
          version: "1.0",
          dateCreated: Date.now(),
          lastModified: Date.now(),
          compatibility: ["Windows", "macOS", "Linux", "Web"],
          tags: ["sil", "basic", "lisu"],
          difficulty: "medium" as DifficultyLevel,
          popularity: 80,
        },
        isCustom: false,
        isPublic: true,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    ];
  }

  private createQwertyUSMappings(): KeyMapping[] {
    // Simplified mapping for demonstration
    return [
      { key: "q", character: "q", position: { row: 1, column: 1, finger: FingerAssignment.PINKY, hand: "left" } },
      { key: "w", character: "w", position: { row: 1, column: 2, finger: FingerAssignment.RING, hand: "left" } },
      // ... more mappings would be added here
    ];
  }

  private createSILBasicMappings(): KeyMapping[] {
    // Simplified mapping for demonstration
    return [
      { key: "q", character: "ꓕ", position: { row: 1, column: 1, finger: FingerAssignment.PINKY, hand: "left" } },
      { key: "w", character: "ꓪ", position: { row: 1, column: 2, finger: FingerAssignment.RING, hand: "left" } },
      // ... more mappings would be added here
    ];
  }
}
