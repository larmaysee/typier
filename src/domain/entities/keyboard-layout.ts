/**
 * Domain entities for keyboard layout system
 * Contains layout definitions, key mappings, and layout management logic
 */

import { LanguageCode } from "@/enums/site-config";
import {
  FingerAssignment,
  InputMethod,
  LayoutType,
  LayoutVariant,
} from "../enums/keyboard-layouts";
import { DifficultyLevel } from "../enums/typing-mode";

export interface KeyPosition {
  readonly row: number;
  readonly column: number;
  readonly finger: FingerAssignment;
  readonly hand: "left" | "right";
}

export interface KeyMapping {
  readonly key: string; // Physical key identifier (e.g., 'q', 'w', 'e')
  readonly character: string; // Primary output character
  readonly shiftCharacter?: string; // Character with Shift modifier
  readonly altCharacter?: string; // Character with Alt/Option modifier
  readonly ctrlCharacter?: string; // Character with Ctrl modifier
  readonly position: KeyPosition;
}

export interface LayoutMetadata {
  readonly description: string;
  readonly author: string;
  readonly version: string;
  readonly compatibility: string[]; // Compatible systems/platforms
  readonly tags: string[];
  readonly difficulty: DifficultyLevel;
  readonly popularity: number; // Usage score
  readonly dateCreated: number;
  readonly lastModified: number;
  readonly optimizedFor?: string[]; // What this layout is optimized for (e.g., 'speed', 'accuracy', 'comfort')
}

export class KeyboardLayout {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly language: LanguageCode,
    public readonly layoutType: LayoutType,
    public readonly variant: LayoutVariant,
    public readonly inputMethod: InputMethod,
    public readonly keyMappings: KeyMapping[],
    public readonly metadata: LayoutMetadata,
    public readonly isCustom: boolean,
    public readonly isPublic: boolean,
    public readonly createdBy: string,
    public readonly createdAt: number,
    public readonly updatedAt: number
  ) {
    if (!id.trim()) throw new Error("Layout ID cannot be empty");
    if (!name.trim()) throw new Error("Layout name cannot be empty");
    if (!displayName.trim()) throw new Error("Display name cannot be empty");
    if (keyMappings.length === 0)
      throw new Error("Layout must have key mappings");
    if (createdAt <= 0) throw new Error("Created timestamp must be positive");
    if (updatedAt < createdAt)
      throw new Error("Updated timestamp cannot be before created timestamp");

    this.validateKeyMappings();
    this.validateLanguageCompatibility();
  }

  static create(data: {
    id: string;
    name: string;
    displayName: string;
    language: LanguageCode;
    layoutType: LayoutType;
    variant: LayoutVariant;
    inputMethod: InputMethod;
    keyMappings: KeyMapping[];
    metadata: LayoutMetadata;
    isCustom?: boolean;
    isPublic?: boolean;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
  }): KeyboardLayout {
    const now = Date.now();

    return new KeyboardLayout(
      data.id,
      data.name,
      data.displayName,
      data.language,
      data.layoutType,
      data.variant,
      data.inputMethod,
      [...data.keyMappings], // Create a copy
      { ...data.metadata }, // Create a copy
      data.isCustom || false,
      data.isPublic || false,
      data.createdBy,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  static generateId(
    language: LanguageCode,
    layoutType: LayoutType,
    variant: LayoutVariant
  ): string {
    return `${language}_${layoutType}_${variant}`;
  }

  private validateKeyMappings(): void {
    const positions = new Set<string>();
    const keys = new Set<string>();

    for (const mapping of this.keyMappings) {
      // Check for duplicate keys
      if (keys.has(mapping.key)) {
        throw new Error(`Duplicate key mapping: ${mapping.key}`);
      }
      keys.add(mapping.key);

      // Check for duplicate positions
      const positionKey = `${mapping.position.row}-${mapping.position.column}`;
      if (positions.has(positionKey)) {
        throw new Error(
          `Duplicate position mapping: row ${mapping.position.row}, column ${mapping.position.column}`
        );
      }
      positions.add(positionKey);

      // Validate position values
      if (mapping.position.row < 0 || mapping.position.column < 0) {
        throw new Error("Key position row and column must be non-negative");
      }
    }
  }

  private validateLanguageCompatibility(): void {
    // Define expected variants for each language
    const expectedVariants: Record<LanguageCode, LayoutVariant[]> = {
      [LanguageCode.EN]: [
        LayoutVariant.US,
        LayoutVariant.UK,
        LayoutVariant.INTERNATIONAL,
      ],
      [LanguageCode.LI]: [
        LayoutVariant.SIL_BASIC,
        LayoutVariant.SIL_STANDARD,
        LayoutVariant.UNICODE_STANDARD,
        LayoutVariant.TRADITIONAL,
      ],
      [LanguageCode.MY]: [
        LayoutVariant.MYANMAR3,
        LayoutVariant.ZAWGYI,
        LayoutVariant.UNICODE_MYANMAR,
        LayoutVariant.WININNWA,
      ],
    };

    const validVariants = expectedVariants[this.language] || [];
    if (validVariants.length > 0 && !validVariants.includes(this.variant)) {
      console.warn(
        `Unexpected variant ${this.variant} for language ${this.language}`
      );
    }
  }

  getKeyMapping(key: string): KeyMapping | undefined {
    return this.keyMappings.find((mapping) => mapping.key === key);
  }

  getCharacterForKey(
    key: string,
    modifiers: { shift?: boolean; alt?: boolean; ctrl?: boolean } = {}
  ): string | undefined {
    const mapping = this.getKeyMapping(key);
    if (!mapping) return undefined;

    if (modifiers.ctrl && mapping.ctrlCharacter) return mapping.ctrlCharacter;
    if (modifiers.alt && mapping.altCharacter) return mapping.altCharacter;
    if (modifiers.shift && mapping.shiftCharacter)
      return mapping.shiftCharacter;

    return mapping.character;
  }

  getKeyForCharacter(character: string): string | undefined {
    for (const mapping of this.keyMappings) {
      if (
        mapping.character === character ||
        mapping.shiftCharacter === character ||
        mapping.altCharacter === character ||
        mapping.ctrlCharacter === character
      ) {
        return mapping.key;
      }
    }
    return undefined;
  }

  getAllCharacters(): string[] {
    const characters = new Set<string>();

    for (const mapping of this.keyMappings) {
      characters.add(mapping.character);
      if (mapping.shiftCharacter) characters.add(mapping.shiftCharacter);
      if (mapping.altCharacter) characters.add(mapping.altCharacter);
      if (mapping.ctrlCharacter) characters.add(mapping.ctrlCharacter);
    }

    return Array.from(characters);
  }

  getKeysForFinger(finger: FingerAssignment): KeyMapping[] {
    return this.keyMappings.filter(
      (mapping) => mapping.position.finger === finger
    );
  }

  getKeysForHand(hand: "left" | "right"): KeyMapping[] {
    return this.keyMappings.filter((mapping) => mapping.position.hand === hand);
  }

  getFingerUtilization(): Record<string, number> {
    const utilization: Record<string, number> = {};

    Object.values(FingerAssignment).forEach((finger) => {
      const keys = this.getKeysForFinger(finger);
      utilization[finger] = keys.length;
    });

    return utilization;
  }

  addKeyMapping(mapping: KeyMapping): KeyboardLayout {
    if (!this.isCustom) {
      throw new Error("Cannot modify non-custom layouts");
    }

    // Check for conflicts
    const existingKeyMapping = this.getKeyMapping(mapping.key);
    if (existingKeyMapping) {
      throw new Error(`Key ${mapping.key} already mapped`);
    }

    const positionConflict = this.keyMappings.find(
      (m) =>
        m.position.row === mapping.position.row &&
        m.position.column === mapping.position.column
    );
    if (positionConflict) {
      throw new Error(
        `Position ${mapping.position.row},${mapping.position.column} already occupied`
      );
    }

    const updatedMappings = [...this.keyMappings, mapping];

    return new KeyboardLayout(
      this.id,
      this.name,
      this.displayName,
      this.language,
      this.layoutType,
      this.variant,
      this.inputMethod,
      updatedMappings,
      this.metadata,
      this.isCustom,
      this.isPublic,
      this.createdBy,
      this.createdAt,
      Date.now()
    );
  }

  removeKeyMapping(key: string): KeyboardLayout {
    if (!this.isCustom) {
      throw new Error("Cannot modify non-custom layouts");
    }

    const updatedMappings = this.keyMappings.filter(
      (mapping) => mapping.key !== key
    );

    if (updatedMappings.length === this.keyMappings.length) {
      throw new Error(`Key ${key} not found in layout`);
    }

    return new KeyboardLayout(
      this.id,
      this.name,
      this.displayName,
      this.language,
      this.layoutType,
      this.variant,
      this.inputMethod,
      updatedMappings,
      this.metadata,
      this.isCustom,
      this.isPublic,
      this.createdBy,
      this.createdAt,
      Date.now()
    );
  }

  updateKeyMapping(
    key: string,
    updatedMapping: Partial<KeyMapping>
  ): KeyboardLayout {
    if (!this.isCustom) {
      throw new Error("Cannot modify non-custom layouts");
    }

    const mappingIndex = this.keyMappings.findIndex(
      (mapping) => mapping.key === key
    );
    if (mappingIndex === -1) {
      throw new Error(`Key ${key} not found in layout`);
    }

    const updatedMappings = [...this.keyMappings];
    updatedMappings[mappingIndex] = {
      ...updatedMappings[mappingIndex],
      ...updatedMapping,
    };

    return new KeyboardLayout(
      this.id,
      this.name,
      this.displayName,
      this.language,
      this.layoutType,
      this.variant,
      this.inputMethod,
      updatedMappings,
      this.metadata,
      this.isCustom,
      this.isPublic,
      this.createdBy,
      this.createdAt,
      Date.now()
    );
  }

  updateMetadata(updates: Partial<LayoutMetadata>): KeyboardLayout {
    if (!this.isCustom && this.createdBy) {
      throw new Error("Cannot modify metadata of non-custom layouts");
    }

    const updatedMetadata = {
      ...this.metadata,
      ...updates,
      lastModified: Date.now(),
    };

    return new KeyboardLayout(
      this.id,
      this.name,
      this.displayName,
      this.language,
      this.layoutType,
      this.variant,
      this.inputMethod,
      this.keyMappings,
      updatedMetadata,
      this.isCustom,
      this.isPublic,
      this.createdBy,
      this.createdAt,
      Date.now()
    );
  }

  clone(newId: string, newName: string, createdBy: string): KeyboardLayout {
    return new KeyboardLayout(
      newId,
      newName,
      `${newName} (Custom)`,
      this.language,
      this.layoutType,
      this.variant,
      this.inputMethod,
      [...this.keyMappings], // Deep copy mappings
      {
        ...this.metadata,
        description: `Custom layout based on ${this.displayName}`,
        author: createdBy,
        version: "1.0.0",
        dateCreated: Date.now(),
        lastModified: Date.now(),
      },
      true, // Mark as custom
      false, // isPublic (custom clones are private by default)
      createdBy,
      Date.now(),
      Date.now()
    );
  }

  getComplexity(): number {
    // Calculate layout complexity based on various factors
    let complexity = 0;

    // Base complexity on number of mappings
    complexity += this.keyMappings.length * 0.1;

    // Add complexity for modifier keys
    const modifierCount = this.keyMappings.filter(
      (m) => m.shiftCharacter || m.altCharacter || m.ctrlCharacter
    ).length;
    complexity += modifierCount * 0.2;

    // Add complexity for unique characters
    const uniqueChars = new Set(this.getAllCharacters());
    complexity += uniqueChars.size * 0.05;

    return Math.min(Math.round(complexity * 100) / 100, 10); // Cap at 10
  }

  supportsCharacter(character: string): boolean {
    return this.getAllCharacters().includes(character);
  }

  supportsText(text: string): boolean {
    const supportedChars = new Set(this.getAllCharacters());
    return Array.from(text).every(
      (char) => supportedChars.has(char) || /\s/.test(char)
    );
  }

  getTypingDifficulty(): DifficultyLevel {
    const complexity = this.getComplexity();

    if (complexity < 2) return DifficultyLevel.EASY;
    if (complexity < 5) return DifficultyLevel.MEDIUM;
    return DifficultyLevel.HARD;
  }

  isCompatibleWithLanguage(language: LanguageCode): boolean {
    return this.language === language;
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.name.trim().length > 0 &&
      this.displayName.trim().length > 0 &&
      this.keyMappings.length > 0 &&
      this.createdAt > 0 &&
      this.updatedAt >= this.createdAt &&
      this.keyMappings.every(
        (mapping) =>
          mapping.key.trim().length > 0 &&
          mapping.character.trim().length > 0 &&
          mapping.position.row >= 0 &&
          mapping.position.column >= 0
      )
    );
  }

  equals(other: KeyboardLayout): boolean {
    return this.id === other.id;
  }
}
