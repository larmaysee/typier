/**
 * Mock implementation of ILayoutValidatorService for development and testing
 */

import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { ValidationResult } from "@/domain/interfaces/repositories";

export interface ILayoutValidatorService {
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;
  validateKeyMapping(key: string, output: string): Promise<boolean>;
  validateLayoutIntegrity(layout: KeyboardLayout): Promise<boolean>;
  getSupportedKeys(): string[];
}

export class MockLayoutValidatorService implements ILayoutValidatorService {
  private supportedKeys = [
    // Letters
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    // Numbers
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    // Special keys
    "space",
    "shift",
    "ctrl",
    "alt",
    "cmd",
    "tab",
    "enter",
    "backspace",
    // Punctuation
    ".",
    ",",
    ";",
    ":",
    "!",
    "?",
    '"',
    "'",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "-",
    "_",
    "+",
    "=",
    "/",
    "\\",
    "|",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
  ];

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!layout.id || layout.id.trim() === "") {
      errors.push("Layout ID is required");
    }

    if (!layout.name || layout.name.trim() === "") {
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
      const usedKeys = new Set<string>();

      for (const mapping of layout.keyMappings) {
        // Check for duplicate keys
        if (usedKeys.has(mapping.key)) {
          errors.push(`Duplicate key mapping found: ${mapping.key}`);
        }
        usedKeys.add(mapping.key);

        // Validate individual key mapping
        const mappingValid = await this.validateKeyMapping(
          mapping.key,
          mapping.character
        );
        if (!mappingValid) {
          warnings.push(
            `Questionable key mapping: ${mapping.key} -> ${mapping.character}`
          );
        }
      }

      // Check for essential keys
      const essentialKeys = ["space", "enter", "backspace"];
      for (const essentialKey of essentialKeys) {
        if (!usedKeys.has(essentialKey)) {
          warnings.push(`Missing essential key: ${essentialKey}`);
        }
      }

      // Check coverage of basic alphabet (for Latin-based layouts)
      if (layout.language === "en") {
        const letters = "abcdefghijklmnopqrstuvwxyz".split("");
        const mappedLetters = layout.keyMappings
          .map((m) => m.character.toLowerCase())
          .filter((c) => letters.includes(c));

        if (mappedLetters.length < 20) {
          warnings.push("Layout may not cover sufficient alphabet letters");
        }
      }
    }

    // Validate metadata
    if (layout.metadata) {
      if (
        layout.metadata.description &&
        layout.metadata.description.length > 500
      ) {
        warnings.push("Layout description is very long");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateKeyMapping(key: string, output: string): Promise<boolean> {
    // Check if key is supported
    if (!this.supportedKeys.includes(key.toLowerCase())) {
      return false;
    }

    // Check output validity
    if (!output || output.trim() === "") {
      return false;
    }

    // Basic character validation
    if (output.length > 4) {
      return false; // Most key outputs should be 1-4 characters
    }

    // Special key validations
    if (key === "space" && output !== " ") {
      return false;
    }

    if (key === "enter" && output !== "\n") {
      return false;
    }

    if (key === "tab" && output !== "\t") {
      return false;
    }

    return true;
  }

  async validateLayoutIntegrity(layout: KeyboardLayout): Promise<boolean> {
    const validation = await this.validateLayout(layout);
    return validation.isValid && validation.warnings.length < 5; // Allow some warnings
  }

  getSupportedKeys(): string[] {
    return [...this.supportedKeys];
  }

  // Additional utility methods
  async validateCustomLayout(layout: KeyboardLayout): Promise<{
    canSave: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const validation = await this.validateLayout(layout);
    const issues = [...validation.errors, ...validation.warnings];
    const suggestions: string[] = [];

    if (layout.keyMappings.length < 30) {
      suggestions.push(
        "Consider adding more key mappings for a complete layout"
      );
    }

    if (!layout.metadata?.description) {
      suggestions.push(
        "Add a description to help users understand the layout purpose"
      );
    }

    return {
      canSave: validation.isValid,
      issues,
      suggestions,
    };
  }

  async compareLayouts(
    layout1: KeyboardLayout,
    layout2: KeyboardLayout
  ): Promise<{
    similarity: number;
    differences: Array<{
      key: string;
      layout1Output: string;
      layout2Output: string;
    }>;
  }> {
    const map1 = new Map(layout1.keyMappings.map((m) => [m.key, m.character]));
    const map2 = new Map(layout2.keyMappings.map((m) => [m.key, m.character]));

    const allKeys = new Set([...map1.keys(), ...map2.keys()]);
    const differences: Array<{
      key: string;
      layout1Output: string;
      layout2Output: string;
    }> = [];

    let matches = 0;

    for (const key of allKeys) {
      const output1 = map1.get(key) || "";
      const output2 = map2.get(key) || "";

      if (output1 === output2) {
        matches++;
      } else {
        differences.push({
          key,
          layout1Output: output1,
          layout2Output: output2,
        });
      }
    }

    const similarity = allKeys.size > 0 ? (matches / allKeys.size) * 100 : 0;

    return {
      similarity: Math.round(similarity * 100) / 100,
      differences,
    };
  }
}
