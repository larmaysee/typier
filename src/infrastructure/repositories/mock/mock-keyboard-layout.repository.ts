/**
 * Mock implementation of IKeyboardLayoutRepository for development and testing
 */

import { IKeyboardLayoutRepository, ValidationResult } from "../../../domain/interfaces/repositories";
import { KeyboardLayout } from "../../../domain/entities/keyboard-layout";
import { LayoutType, LayoutVariant, InputMethod, FingerAssignment } from "../../../domain/enums/keyboard-layouts";
import { DifficultyLevel } from "../../../domain/enums/typing-mode";
import { LanguageCode } from "@/domain";

export class MockKeyboardLayoutRepository implements IKeyboardLayoutRepository {
  private layouts: Map<string, KeyboardLayout> = new Map();
  private userPreferences: Map<string, Record<string, string>> = new Map();

  constructor() {
    this.initializeMockLayouts();
  }

  private initializeMockLayouts() {
    // English layouts
    const qwertyUS = KeyboardLayout.create({
      id: "qwerty-us",
      name: "QWERTY US",
      displayName: "QWERTY (US)",
      language: LanguageCode.EN,
      layoutType: LayoutType.QWERTY,
      variant: LayoutVariant.US,
      inputMethod: InputMethod.DIRECT,
      keyMappings: this.getQwertyUSMappings(),
      metadata: {
        description: "Standard US QWERTY keyboard layout",
        author: "Standard",
        version: "1.0",
        compatibility: ["Windows", "macOS", "Linux"],
        tags: ["qwerty", "us", "standard"],
        difficulty: DifficultyLevel.EASY,
        popularity: 95,
        dateCreated: Date.now(),
        lastModified: Date.now()
      },
      isCustom: false,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const dvorak = KeyboardLayout.create({
      id: "dvorak",
      name: "Dvorak",
      displayName: "Dvorak",
      language: LanguageCode.EN,
      layoutType: LayoutType.DVORAK,
      variant: LayoutVariant.US,
      inputMethod: InputMethod.DIRECT,
      keyMappings: this.getDvorakMappings(),
      metadata: {
        description: "Dvorak keyboard layout for improved typing efficiency",
        author: "August Dvorak",
        version: "1.0",
        compatibility: ["Windows", "macOS", "Linux"],
        tags: ["dvorak", "efficient", "alternative"],
        difficulty: DifficultyLevel.HARD,
        popularity: 15,
        dateCreated: Date.now(),
        lastModified: Date.now()
      },
      isCustom: false,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Lisu layouts
    const lisuSILBasic = KeyboardLayout.create({
      id: "lisu-sil-basic",
      name: "SIL Basic",
      displayName: "Lisu (SIL Basic)",
      language: LanguageCode.LI,
      layoutType: LayoutType.CUSTOM,
      variant: LayoutVariant.SIL_BASIC,
      inputMethod: InputMethod.DIRECT,
      keyMappings: this.getLisuSILBasicMappings(),
      metadata: {
        description: "Basic SIL keyboard layout for Lisu script",
        author: "SIL International",
        version: "1.0",
        compatibility: ["Windows", "macOS", "Linux"],
        tags: ["lisu", "sil", "basic"],
        difficulty: DifficultyLevel.MEDIUM,
        popularity: 80,
        dateCreated: Date.now(),
        lastModified: Date.now()
      },
      isCustom: false,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Myanmar layouts
    const myanmar3 = KeyboardLayout.create({
      id: "myanmar3",
      name: "Myanmar3",
      displayName: "Myanmar3",
      language: LanguageCode.MY,
      layoutType: LayoutType.CUSTOM,
      variant: LayoutVariant.MYANMAR3,
      inputMethod: InputMethod.DIRECT,
      keyMappings: this.getMyanmar3Mappings(),
      metadata: {
        description: "Myanmar3 keyboard layout for Myanmar script",
        author: "Myanmar Unicode & NLP Research Center",
        version: "1.0",
        compatibility: ["Windows", "macOS", "Linux"],
        tags: ["myanmar", "myanmar3", "unicode"],
        difficulty: DifficultyLevel.MEDIUM,
        popularity: 85,
        dateCreated: Date.now(),
        lastModified: Date.now()
      },
      isCustom: false,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    this.layouts.set(qwertyUS.id, qwertyUS);
    this.layouts.set(dvorak.id, dvorak);
    this.layouts.set(lisuSILBasic.id, lisuSILBasic);
    this.layouts.set(myanmar3.id, myanmar3);
  }

  async getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]> {
    const allLayouts = Array.from(this.layouts.values());
    return allLayouts.filter(layout => layout.language === language);
  }

  async findById(layoutId: string): Promise<KeyboardLayout | null> {
    return this.layouts.get(layoutId) || null;
  }

  async saveCustomLayout(layout: KeyboardLayout): Promise<void> {
    this.layouts.set(layout.id, layout);
  }

  async getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null> {
    const userPrefs = this.userPreferences.get(userId);
    return userPrefs?.[language] || null;
  }

  async setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void> {
    const userPrefs = this.userPreferences.get(userId) || {};
    userPrefs[language] = layoutId;
    this.userPreferences.set(userId, userPrefs);
  }

  async deleteCustomLayout(layoutId: string, userId: string): Promise<void> {
    const layout = this.layouts.get(layoutId);
    if (layout && layout.isCustom && layout.createdBy === userId) {
      this.layouts.delete(layoutId);
    }
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!layout.name.trim()) {
      errors.push("Layout name cannot be empty");
    }

    if (layout.keyMappings.length === 0) {
      errors.push("Layout must have key mappings");
    }

    // Check for duplicate key mappings
    const keys = new Set<string>();
    for (const mapping of layout.keyMappings) {
      if (keys.has(mapping.key)) {
        errors.push(`Duplicate key mapping: ${mapping.key}`);
      }
      keys.add(mapping.key);
    }

    if (layout.keyMappings.length < 26) {
      warnings.push("Layout has fewer than 26 keys, may not support full alphabet");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async getPopularLayouts(language: LanguageCode, limit: number = 5): Promise<KeyboardLayout[]> {
    const languageLayouts = await this.getAvailableLayouts(language);
    return languageLayouts
      .sort((a, b) => b.metadata.popularity - a.metadata.popularity)
      .slice(0, limit);
  }

  // Mock key mappings - simplified for demo
  private getQwertyUSMappings() {
    return [
      { key: 'q', character: 'q', shiftCharacter: 'Q', position: { row: 1, column: 1, finger: FingerAssignment.LEFT_PINKY, hand: 'left' as const } },
      { key: 'w', character: 'w', shiftCharacter: 'W', position: { row: 1, column: 2, finger: FingerAssignment.LEFT_RING, hand: 'left' as const } },
      { key: 'e', character: 'e', shiftCharacter: 'E', position: { row: 1, column: 3, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' as const } },
      { key: 'r', character: 'r', shiftCharacter: 'R', position: { row: 1, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
      { key: 't', character: 't', shiftCharacter: 'T', position: { row: 1, column: 5, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
    ];
  }

  private getDvorakMappings() {
    return [
      { key: 'q', character: "'", shiftCharacter: '"', position: { row: 1, column: 1, finger: FingerAssignment.LEFT_PINKY, hand: 'left' as const } },
      { key: 'w', character: ',', shiftCharacter: '<', position: { row: 1, column: 2, finger: FingerAssignment.LEFT_RING, hand: 'left' as const } },
      { key: 'e', character: '.', shiftCharacter: '>', position: { row: 1, column: 3, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' as const } },
      { key: 'r', character: 'p', shiftCharacter: 'P', position: { row: 1, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
      { key: 't', character: 'y', shiftCharacter: 'Y', position: { row: 1, column: 5, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
    ];
  }

  private getLisuSILBasicMappings() {
    return [
      { key: 'q', character: 'ꓕ', position: { row: 1, column: 1, finger: FingerAssignment.LEFT_PINKY, hand: 'left' as const } },
      { key: 'w', character: 'ꓪ', position: { row: 1, column: 2, finger: FingerAssignment.LEFT_RING, hand: 'left' as const } },
      { key: 'e', character: 'ꓱ', position: { row: 1, column: 3, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' as const } },
      { key: 'r', character: 'ꓣ', position: { row: 1, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
      { key: 't', character: 'ꓔ', position: { row: 1, column: 5, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
    ];
  }

  private getMyanmar3Mappings() {
    return [
      { key: 'q', character: 'ဆ', position: { row: 1, column: 1, finger: FingerAssignment.LEFT_PINKY, hand: 'left' as const } },
      { key: 'w', character: 'တ', position: { row: 1, column: 2, finger: FingerAssignment.LEFT_RING, hand: 'left' as const } },
      { key: 'e', character: 'န', position: { row: 1, column: 3, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' as const } },
      { key: 'r', character: 'မ', position: { row: 1, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
      { key: 't', character: 'အ', position: { row: 1, column: 5, finger: FingerAssignment.LEFT_INDEX, hand: 'left' as const } },
    ];
  }
}