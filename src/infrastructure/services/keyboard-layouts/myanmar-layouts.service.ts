import { LanguageCode } from "@/domain";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { DifficultyLevel, LayoutVariant } from "@/domain/enums";
import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { createKeyMapping, createSystemLayoutMetadata } from "./layout-helpers";

/**
 * Myanmar keyboard layouts provider (Myanmar3, Zawgyi, Unicode, WinInnwa)
 */
export class MyanmarLayoutsService implements ILayoutProvider {
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [
      this.createMyanmar3Layout(),
      this.createZawgyiLayout(),
      this.createUnicodeStandardLayout(),
      this.createWinInnwaLayout(),
    ];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find((layout) => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.MY) {
      errors.push("Layout language must be Myanmar");
    }

    // Check for Myanmar Unicode characters (U+1000-109F)
    const allChars = layout.keyMappings
      .flatMap((m) => [m.character, m.shiftCharacter || "", m.altCharacter || "", m.ctrlCharacter || ""])
      .join("");

    const myanmarPattern = /[\u{1000}-\u{109F}\s]*/u;
    const nonMyanmarChars = allChars.replace(myanmarPattern, "");

    if (nonMyanmarChars.length > 0) {
      warnings.push("Layout contains characters outside Myanmar Unicode block");
    }

    // Check for basic Myanmar consonants
    const basicConsonants = ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ဉ"];
    const mappedChars = new Set(allChars);

    let missingCount = 0;
    for (const consonant of basicConsonants) {
      if (!mappedChars.has(consonant)) {
        missingCount++;
      }
    }

    if (missingCount > 5) {
      warnings.push("Layout missing many basic Myanmar consonants");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async getDefaultLayout(): Promise<KeyboardLayout> {
    return this.createMyanmar3Layout();
  }

  getSupportedLanguage(): LanguageCode {
    return LanguageCode.MY;
  }

  private createMyanmar3Layout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row with Myanmar digits
      createKeyMapping("1", "၁", "ဍ"),
      createKeyMapping("2", "၂", "ဎ"),
      createKeyMapping("3", "၃", "ဏ"),
      createKeyMapping("4", "၄", "ဒ"),
      createKeyMapping("5", "၅", "ဓ"),
      createKeyMapping("6", "၆", "န"),
      createKeyMapping("7", "၇", "ပ"),
      createKeyMapping("8", "၈", "ဖ"),
      createKeyMapping("9", "၉", "ဗ"),
      createKeyMapping("0", "၀", "ဘ"),
      createKeyMapping("-", "-", "မ"),
      createKeyMapping("=", "=", "ယ"),

      // Top row - Consonants
      createKeyMapping("q", "ဆ", "ဈ"),
      createKeyMapping("w", "တ", "ထ"),
      createKeyMapping("e", "န", "ည"),
      createKeyMapping("r", "မ", "ံ"),
      createKeyMapping("t", "အ", "ဦ"),
      createKeyMapping("y", "ပ", "ဖ"),
      createKeyMapping("u", "က", "ခ"),
      createKeyMapping("i", "င", "င်"),
      createKeyMapping("o", "သ", "စ"),
      createKeyMapping("p", "စ", "ဆ"),
      createKeyMapping("[", "ဟ", "ှ"),
      createKeyMapping("]", "ူ", "ု"),
      createKeyMapping("\\", "ါ", "၏"),

      // Home row - Main consonants and vowels
      createKeyMapping("a", "ေ", "ေါ"),
      createKeyMapping("s", "ျ", "ြ"),
      createKeyMapping("d", "ိ", "ီ"),
      createKeyMapping("f", "်", "့"),
      createKeyMapping("g", "ါ", "ွါ"),
      createKeyMapping("h", "ြ", "ြေ"),
      createKeyMapping("j", "ု", "ူ"),
      createKeyMapping("k", "ိ", "ီ"),
      createKeyMapping("l", "ေါ", "ော"),
      createKeyMapping(";", "း", "ဿ"),
      createKeyMapping("'", "ရ", "ွေါ"),

      // Bottom row - Additional consonants
      createKeyMapping("z", "ဖ", "ဗ"),
      createKeyMapping("x", "ထ", "ဒ"),
      createKeyMapping("c", "ခ", "ဂ"),
      createKeyMapping("v", "လ", "ဠ"),
      createKeyMapping("b", "ဘ", "ဩ"),
      createKeyMapping("n", "ည", "ဲ"),
      createKeyMapping("m", "ာ", "ံ"),
      createKeyMapping(",", "ယ", "ရ"),
      createKeyMapping(".", "။", "၊"),
      createKeyMapping("/", "/", "?"),

      // Space
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "my-myanmar3",
      name: "Myanmar3",
      displayName: "Myanmar (Myanmar3)",
      language: LanguageCode.MY,
      variant: LayoutVariant.UNICODE_MYANMAR,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        "Myanmar3 keyboard layout - most widely used modern Myanmar input method",
        "Myanmar Computer Federation",
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  private createZawgyiLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Zawgyi encoding mappings (similar key positions to Myanmar3 but different encoding)
      createKeyMapping("1", "၁", "ဍ"),
      createKeyMapping("2", "၂", "ဎ"),
      createKeyMapping("3", "၃", "ဏ"),
      createKeyMapping("4", "၄", "ဒ"),
      createKeyMapping("5", "၅", "ဓ"),
      createKeyMapping("6", "၆", "န"),
      createKeyMapping("7", "၇", "ပ"),
      createKeyMapping("8", "၈", "ဖ"),
      createKeyMapping("9", "၉", "ဗ"),
      createKeyMapping("0", "၀", "ဘ"),
      createKeyMapping("q", "ဆ", "ဈ"),
      createKeyMapping("w", "တ", "ထ"),
      createKeyMapping("e", "န", "ည"),
      createKeyMapping("r", "မ", "ံ"),
      createKeyMapping("t", "အ", "ဦ"),
      createKeyMapping("y", "ပ", "ဖ"),
      createKeyMapping("u", "က", "ခ"),
      createKeyMapping("i", "င", "င်"),
      createKeyMapping("o", "သ", "စ"),
      createKeyMapping("p", "စ", "ဆ"),
      createKeyMapping("a", "ေ", "ေါ"),
      createKeyMapping("s", "ျ", "ြ"),
      createKeyMapping("d", "ိ", "ီ"),
      createKeyMapping("f", "်", "့"),
      createKeyMapping("g", "ါ", "ွါ"),
      createKeyMapping("h", "ြ", "ြေ"),
      createKeyMapping("j", "ု", "ူ"),
      createKeyMapping("k", "ိ", "ီ"),
      createKeyMapping("l", "ေါ", "ော"),
      createKeyMapping("z", "ဖ", "ဗ"),
      createKeyMapping("x", "ထ", "ဒ"),
      createKeyMapping("c", "ခ", "ဂ"),
      createKeyMapping("v", "လ", "ဠ"),
      createKeyMapping("b", "ဘ", "ဩ"),
      createKeyMapping("n", "ည", "ဲ"),
      createKeyMapping("m", "ာ", "ံ"),
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "my-zawgyi",
      name: "Zawgyi",
      displayName: "Myanmar (Zawgyi)",
      language: LanguageCode.MY,
      variant: LayoutVariant.ZAWGYI,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        "Legacy Zawgyi keyboard layout - widely used before Unicode standardization",
        "Zawgyi Team",
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  private createUnicodeStandardLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Standard Unicode Myanmar layout following official recommendations
      createKeyMapping("a", "က", "ကာ"), // U+1000
      createKeyMapping("b", "ခ", "ခါ"), // U+1001
      createKeyMapping("c", "ဂ", "ဂါ"), // U+1002
      createKeyMapping("d", "ဃ", "ဃါ"), // U+1003
      createKeyMapping("e", "င", "ငါ"), // U+1004
      createKeyMapping("f", "စ", "စာ"), // U+1005
      createKeyMapping("g", "ဆ", "ဆါ"), // U+1006
      createKeyMapping("h", "ဇ", "ဇါ"), // U+1007
      createKeyMapping("i", "ဈ", "ဈါ"), // U+1008
      createKeyMapping("j", "ဉ", "ဉါ"), // U+1009
      createKeyMapping("k", "ည", "ညါ"), // U+100A
      createKeyMapping("l", "ဋ", "ဋါ"), // U+100B
      createKeyMapping("m", "ဌ", "ဌါ"), // U+100C
      createKeyMapping("n", "တ", "တါ"), // U+1010
      createKeyMapping("o", "ထ", "ထါ"), // U+1011
      createKeyMapping("p", "ဒ", "ဒါ"), // U+1012
      // Continue with remaining characters...
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "my-unicode-standard",
      name: "Unicode Standard",
      displayName: "Myanmar (Unicode Standard)",
      language: LanguageCode.MY,
      variant: LayoutVariant.UNICODE_STANDARD,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        "Standard Unicode Myanmar keyboard layout following official specifications",
        "Unicode Consortium",
        DifficultyLevel.HARD
      ),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  private createWinInnwaLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Traditional WinInnwa mappings
      createKeyMapping("a", "အ", "အေါ"),
      createKeyMapping("s", "သ", "ဿ"),
      createKeyMapping("d", "ဒ", "ဓ"),
      createKeyMapping("f", "ဖ", "ဗ"),
      createKeyMapping("g", "ဂ", "ဃ"),
      createKeyMapping("h", "ဟ", "ှ"),
      createKeyMapping("j", "ဇ", "ဈ"),
      createKeyMapping("k", "က", "ခ"),
      createKeyMapping("l", "လ", "ဠ"),
      createKeyMapping("z", "ဇ", "ဈ"),
      createKeyMapping("x", "ထ", "ဓ"),
      createKeyMapping("c", "စ", "ဆ"),
      createKeyMapping("v", "ဝ", "ဝွ"),
      createKeyMapping("b", "ဗ", "ဘ"),
      createKeyMapping("n", "န", "ဏ"),
      createKeyMapping("m", "မ", "ံ"),
      createKeyMapping("q", "ဆ", "ဈ"),
      createKeyMapping("w", "တ", "ထ"),
      createKeyMapping("e", "ေ", "ေ"),
      createKeyMapping("r", "ရ", "ြ"),
      createKeyMapping("t", "တ", "ထ"),
      createKeyMapping("y", "ယ", "ရ"),
      createKeyMapping("u", "ု", "ူ"),
      createKeyMapping("i", "ိ", "ီ"),
      createKeyMapping("o", "ေါ", "ော"),
      createKeyMapping("p", "ပ", "ဖ"),
      createKeyMapping(" ", " ", " "),
    ];

    return KeyboardLayout.create({
      id: "my-wininnwa",
      name: "WinInnwa",
      displayName: "Myanmar (WinInnwa)",
      language: LanguageCode.MY,
      variant: LayoutVariant.WININNWA,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        "Traditional WinInnwa keyboard layout - popular legacy input method",
        "Innwa Systems",
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
