import { LanguageCode } from "@/domain";
import { KeyboardLayout } from "@/domain/entities";
import { LayoutVariant } from "@/domain/enums";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { createKeyMapping, createSystemLayoutMetadata } from "./layout-helpers";

/**
 * English keyboard layouts provider (QWERTY, Dvorak, Colemak)
 */
export class EnglishLayoutsService implements ILayoutProvider {
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [this.createQwertyUSLayout()];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find((layout) => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.EN) {
      errors.push("Layout language must be English");
    }

    // Check for English-specific requirements
    const requiredKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    const mappedKeys = new Set(layout.keyMappings.map((m) => m.key.toLowerCase()));

    for (const key of requiredKeys) {
      if (!mappedKeys.has(key)) {
        warnings.push(`Missing common key: ${key}`);
      }
    }

    // Validate English character set
    const allChars = layout.keyMappings
      .flatMap((m) => [m.character, m.shiftCharacter || "", m.altCharacter || "", m.ctrlCharacter || ""])
      .join("");

    const englishPattern = /^[a-zA-Z0-9\s\.,;:!?\-'"()\[\]{}\/\\@#$%^&*+=_~`<>|]*$/;
    if (!englishPattern.test(allChars)) {
      warnings.push("Layout contains non-English characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async getDefaultLayout(): Promise<KeyboardLayout> {
    return this.createQwertyUSLayout();
  }

  getSupportedLanguage(): LanguageCode {
    return LanguageCode.EN;
  }

  private createQwertyUSLayout(): KeyboardLayout {
    const keyMappings = [
      // Number row
      createKeyMapping("1", "1", "!"),
      createKeyMapping("2", "2", "@"),
      createKeyMapping("3", "3", "#"),
      createKeyMapping("4", "4", "$"),
      createKeyMapping("5", "5", "%"),
      createKeyMapping("6", "6", "^"),
      createKeyMapping("7", "7", "&"),
      createKeyMapping("8", "8", "*"),
      createKeyMapping("9", "9", "("),
      createKeyMapping("0", "0", ")"),
      createKeyMapping("-", "-", "_"),
      createKeyMapping("=", "=", "+"),

      // Top row
      createKeyMapping("q", "q", "Q"),
      createKeyMapping("w", "w", "W"),
      createKeyMapping("e", "e", "E"),
      createKeyMapping("r", "r", "R"),
      createKeyMapping("t", "t", "T"),
      createKeyMapping("y", "y", "Y"),
      createKeyMapping("u", "u", "U"),
      createKeyMapping("i", "i", "I"),
      createKeyMapping("o", "o", "O"),
      createKeyMapping("p", "p", "P"),
      createKeyMapping("[", "[", "{"),
      createKeyMapping("]", "]", "}"),
      createKeyMapping("\\", "\\", "|"),

      // Home row
      createKeyMapping("a", "a", "A"),
      createKeyMapping("s", "s", "S"),
      createKeyMapping("d", "d", "D"),
      createKeyMapping("f", "f", "F"),
      createKeyMapping("g", "g", "G"),
      createKeyMapping("h", "h", "H"),
      createKeyMapping("j", "j", "J"),
      createKeyMapping("k", "k", "K"),
      createKeyMapping("l", "l", "L"),
      createKeyMapping(";", ";", ":"),
      createKeyMapping("'", "'", '"'),

      // Bottom row
      createKeyMapping("z", "z", "Z"),
      createKeyMapping("x", "x", "X"),
      createKeyMapping("c", "c", "C"),
      createKeyMapping("v", "v", "V"),
      createKeyMapping("b", "b", "B"),
      createKeyMapping("n", "n", "N"),
      createKeyMapping("m", "m", "M"),
      createKeyMapping(",", ",", "<"),
      createKeyMapping(".", ".", ">"),
      createKeyMapping("/", "/", "?"),

      // Space
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "en-qwerty-us",
      name: "QWERTY US",
      displayName: "English (QWERTY US)",
      language: LanguageCode.EN,
      variant: LayoutVariant.US,
      keyMappings,
      metadata: createSystemLayoutMetadata("Standard US QWERTY keyboard layout", "System", DifficultyLevel.EASY),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
