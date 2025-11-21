import { LanguageCode } from "@/domain";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { DifficultyLevel, LayoutVariant } from "@/domain/enums";
import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { createKeyMapping, createSystemLayoutMetadata } from "./layout-helpers";

/**
 * Lisu keyboard layouts provider (SIL Basic, Standard, Unicode, Traditional)
 */
export class LisuLayoutsService implements ILayoutProvider {
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [this.createSILBasicLayout()];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find((layout) => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.LI) {
      errors.push("Layout language must be Lisu");
    }

    // Check for Lisu Unicode characters
    const allChars = layout.keyMappings
      .flatMap((m) => [m.character, m.shiftCharacter || "", m.altCharacter || "", m.ctrlCharacter || ""])
      .join("");

    const lisuPattern = /[\u{A4D0}-\u{A4FF}\u{02C7}\u{02CD}\u{201C}\u{201D}\s]*/u;
    const nonLisuChars = allChars.replace(lisuPattern, "");

    if (nonLisuChars.length > 0) {
      warnings.push("Layout contains characters outside Lisu Unicode block");
    }

    // Check for basic Lisu letters
    const basicLisuLetters = ["ꓐ", "ꓑ", "ꓒ", "ꓓ", "ꓔ", "ꓕ", "ꓖ", "ꓗ", "ꓘ", "ꓙ"];
    const mappedChars = new Set(allChars);

    let missingCount = 0;
    for (const letter of basicLisuLetters) {
      if (!mappedChars.has(letter)) {
        missingCount++;
      }
    }

    if (missingCount > 5) {
      warnings.push("Layout missing many basic Lisu letters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async getDefaultLayout(): Promise<KeyboardLayout> {
    return this.createSILBasicLayout();
  }

  getSupportedLanguage(): LanguageCode {
    return LanguageCode.LI;
  }

  private createSILBasicLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row with Lisu tone marks
      createKeyMapping("1", "ꓸ", "꓾"), // Tone marks
      createKeyMapping("2", "ꓹ", "꓿"),
      createKeyMapping("3", "ꓺ", "ꓼ"),
      createKeyMapping("4", "ꓻ", "ꓽ"),
      createKeyMapping("5", "ˍ", "˗"), // Diacritics
      createKeyMapping("6", '"', '"'), // Quotes
      createKeyMapping("7", "7", "&"),
      createKeyMapping("8", "8", "*"),
      createKeyMapping("9", "9", "("),
      createKeyMapping("0", "0", ")"),

      // Top row - Basic Lisu consonants
      createKeyMapping("q", "ꓤ", "ꓞ"), // Ba, Pa
      createKeyMapping("w", "ꓪ", "ꓩ"), // Ma, Wa
      createKeyMapping("e", "ꓰ", "ꓱ"), // A, I
      createKeyMapping("r", "ꓡ", "ꓠ"), // La, Ka
      createKeyMapping("t", "ꓔ", "ꓓ"), // Ta, Da
      createKeyMapping("y", "ꓨ", "ꓧ"), // Ya, Xa
      createKeyMapping("u", "ꓲ", "ꓳ"), // U, E
      createKeyMapping("i", "ꓱ", "ꓰ"), // I, A
      createKeyMapping("o", "ꓴ", "ꓵ"), // O, Ae
      createKeyMapping("p", "ꓟ", "ꓞ"), // Pha, Pa

      // Home row - More consonants and vowels
      createKeyMapping("a", "ꓐ", "ꓑ"), // Ba, Pa
      createKeyMapping("s", "ꓢ", "ꓣ"), // Sa, Za
      createKeyMapping("d", "ꓓ", "ꓔ"), // Da, Ta
      createKeyMapping("f", "ꓖ", "ꓕ"), // Fa, Tsa
      createKeyMapping("g", "ꓖ", "ꓘ"), // Ga, Nga
      createKeyMapping("h", "ꓗ", "ꓙ"), // Ha, Xa
      createKeyMapping("j", "ꓙ", "ꓚ"), // Ja, Ca
      createKeyMapping("k", "ꓚ", "ꓛ"), // Ka, Kha
      createKeyMapping("l", "ꓜ", "ꓝ"), // La, Ma
      createKeyMapping(";", "ꓷ", ":"),
      createKeyMapping("'", "'", '"'),

      // Bottom row - Additional consonants
      createKeyMapping("z", "ꓜ", "ꓝ"), // Za, Zha
      createKeyMapping("x", "ꓥ", "ꓦ"), // Xa, Va
      createKeyMapping("c", "ꓚ", "ꓛ"), // Ca, Cha
      createKeyMapping("v", "ꓦ", "ꓥ"), // Va, Fa
      createKeyMapping("b", "ꓐ", "ꓑ"), // Ba, Pa
      createKeyMapping("n", "ꓝ", "ꓬ"), // Na, Nga
      createKeyMapping("m", "ꓞ", "ꓟ"), // Ma, Mha
      createKeyMapping(",", ",", "<"),
      createKeyMapping(".", ".", ">"),
      createKeyMapping("/", "/", "?"),

      // Space
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "li-sil-basic",
      name: "SIL Basic",
      displayName: "Lisu (SIL Basic)",
      language: LanguageCode.LI,
      variant: LayoutVariant.SIL_BASIC,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        "Basic Lisu keyboard layout for beginners - simplified SIL mapping",
        "SIL International",
        DifficultyLevel.EASY
      ),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
