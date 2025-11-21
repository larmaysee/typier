/**
 * Factory for creating KeyboardLayout domain entities from language definitions
 */

import { KeyboardLayout, KeyMapping, KeyPosition } from "@/domain/entities/keyboard-layout";
import { FingerAssignment, LayoutVariant } from "@/domain/enums/keyboard-layouts";
import { LanguageCode } from "@/domain/enums/languages";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { LanguageLayoutDefinition, LanguageLayoutFactory } from "@/domain/interfaces/language-layout-definition";

export class KeyboardLayoutFactory implements LanguageLayoutFactory {
  /**
   * Create a KeyboardLayout domain entity from a language definition
   */
  async createFromDefinition(definition: LanguageLayoutDefinition): Promise<KeyboardLayout> {
    // Convert language definition to key mappings
    const keyMappings = this.convertToKeyMappings(definition);

    // Create metadata
    const metadata = {
      description: definition.metadata.description,
      author: definition.metadata.author,
      version: definition.metadata.version,
      compatibility: ["web", "desktop"], // Default compatibility
      tags: definition.metadata.tags,
      difficulty: this.convertDifficulty(definition.metadata.difficulty),
      popularity: 0, // Start with 0 popularity
      dateCreated: Date.parse(definition.metadata.dateCreated),
      lastModified: Date.parse(definition.metadata.lastModified),
      optimizedFor: ["typing", "accuracy"], // Default optimization
    };

    return KeyboardLayout.create({
      id: definition.metadata.id,
      name: definition.metadata.name,
      displayName: definition.metadata.displayName,
      language: definition.language,
      variant: definition.variant,
      keyMappings,
      metadata,
      isCustom: definition.metadata.isCustom,
      isPublic: definition.metadata.isPublic,
      createdBy: definition.metadata.author,
      createdAt: Date.parse(definition.metadata.dateCreated),
      updatedAt: Date.parse(definition.metadata.lastModified),
    });
  }

  /**
   * Validate a language definition
   */
  validateDefinition(definition: LanguageLayoutDefinition): boolean {
    try {
      // Basic structure validation
      if (!definition.language || !definition.variant) {
        return false;
      }

      if (!definition.metadata?.id || !definition.metadata?.name) {
        return false;
      }

      if (!definition.layout?.rows || definition.layout.rows.length === 0) {
        return false;
      }

      // Validate rows and keys
      for (const row of definition.layout.rows) {
        if (!row.keys || row.keys.length === 0) {
          return false;
        }

        for (const key of row.keys) {
          if (!key.key || !key.char) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }

  /**
   * Convert language definition to KeyMapping array
   */
  private convertToKeyMappings(definition: LanguageLayoutDefinition): KeyMapping[] {
    const keyMappings: KeyMapping[] = [];

    for (let rowIndex = 0; rowIndex < definition.layout.rows.length; rowIndex++) {
      const row = definition.layout.rows[rowIndex];

      for (let keyIndex = 0; keyIndex < row.keys.length; keyIndex++) {
        const keyDef = row.keys[keyIndex];

        // Get finger assignment
        const positionKey = `${rowIndex},${keyIndex}`;
        const fingerAssignment = definition.fingerAssignments?.[positionKey] || FingerAssignment.RIGHT_INDEX;

        // Create key position
        const position: KeyPosition = {
          row: rowIndex,
          column: keyIndex,
          finger: fingerAssignment,
          hand: this.getHandForFinger(fingerAssignment),
        };

        // Create key mapping
        const keyMapping: KeyMapping = {
          key: keyDef.key,
          character: keyDef.char,
          shiftCharacter: keyDef.shiftChar,
          altCharacter: keyDef.altChar,
          ctrlCharacter: keyDef.ctrlChar,
          position,
        };

        keyMappings.push(keyMapping);
      }
    }

    return keyMappings;
  }

  /**
   * Convert difficulty string to enum
   */
  private convertDifficulty(difficulty: string): DifficultyLevel {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return DifficultyLevel.EASY;
      case "medium":
        return DifficultyLevel.MEDIUM;
      case "hard":
        return DifficultyLevel.HARD;
      default:
        return DifficultyLevel.MEDIUM;
    }
  }

  /**
   * Determine hand for finger assignment
   */
  private getHandForFinger(finger: FingerAssignment): "left" | "right" {
    const leftFingers = [
      FingerAssignment.LEFT_PINKY,
      FingerAssignment.LEFT_RING,
      FingerAssignment.LEFT_MIDDLE,
      FingerAssignment.LEFT_INDEX,
      FingerAssignment.LEFT_THUMB,
    ];

    return leftFingers.includes(finger) ? "left" : "right";
  }

  /**
   * Create a new custom layout template
   */
  createCustomLayoutTemplate(
    language: LanguageCode,
    variant: LayoutVariant,
    name: string,
    author: string
  ): LanguageLayoutDefinition {
    return {
      language,
      variant,
      metadata: {
        id: `custom_${Date.now()}`,
        name,
        displayName: name,
        description: `Custom ${name} layout`,
        author,
        version: "1.0.0",
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: ["custom"],
        difficulty: "medium",
        isCustom: true,
        isPublic: false,
      },
      layout: {
        rows: [], // Start with empty layout
      },
      modifiers: {
        shift: [],
        alt: [],
        ctrl: [],
        capsLock: [],
      },
      specialKeys: {},
      fingerAssignments: {},
    };
  }

  /**
   * Clone an existing layout definition for customization
   */
  cloneLayoutDefinition(source: LanguageLayoutDefinition, newName: string, author: string): LanguageLayoutDefinition {
    return {
      ...source,
      metadata: {
        ...source.metadata,
        id: `custom_${Date.now()}`,
        name: newName,
        displayName: `${newName} (Custom)`,
        description: `Custom layout based on ${source.metadata.name}`,
        author,
        version: "1.0.0",
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [...source.metadata.tags, "custom"],
        isCustom: true,
        isPublic: false,
      },
      layout: {
        rows: JSON.parse(JSON.stringify(source.layout.rows)), // Deep clone
      },
      modifiers: {
        ...source.modifiers,
        shift: [...source.modifiers.shift],
        alt: [...source.modifiers.alt],
        ctrl: [...source.modifiers.ctrl],
        capsLock: [...source.modifiers.capsLock],
      },
      specialKeys: { ...source.specialKeys },
      fingerAssignments: { ...source.fingerAssignments },
    };
  }
}

// Singleton instance
export const keyboardLayoutFactory = new KeyboardLayoutFactory();
