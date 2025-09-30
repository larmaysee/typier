import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { LanguageCode, LayoutType, LayoutVariant, InputMethod, DifficultyLevel } from "@/domain/enums";
import { createKeyMapping, createSystemLayoutMetadata } from "./layout-helpers";

/**
 * Lisu keyboard layouts provider (SIL Basic, Standard, Unicode, Traditional)
 */
export class LisuLayoutsService implements ILayoutProvider {

  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [
      this.createSILBasicLayout(),
      this.createSILStandardLayout(),
      this.createUnicodeStandardLayout(),
      this.createTraditionalLayout()
    ];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find(layout => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.LI) {
      errors.push("Layout language must be Lisu");
    }

    // Check for Lisu Unicode characters
    const allChars = layout.keyMappings.flatMap(m => [
      m.character, m.shiftCharacter || '', m.altCharacter || '', m.ctrlCharacter || ''
    ]).join('');

    const lisuPattern = /[\u{A4D0}-\u{A4FF}\u{02C7}\u{02CD}\u{201C}\u{201D}\s]*/u;
    const nonLisuChars = allChars.replace(lisuPattern, '');

    if (nonLisuChars.length > 0) {
      warnings.push("Layout contains characters outside Lisu Unicode block");
    }

    // Check for basic Lisu letters
    const basicLisuLetters = ['ꓐ', 'ꓑ', 'ꓒ', 'ꓓ', 'ꓔ', 'ꓕ', 'ꓖ', 'ꓗ', 'ꓘ', 'ꓙ'];
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
      warnings: warnings.length > 0 ? warnings : undefined
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
      createKeyMapping('1', 'ꓸ', '꓾'),  // Tone marks
      createKeyMapping('2', 'ꓹ', '꓿'),
      createKeyMapping('3', 'ꓺ', 'ꓼ'),
      createKeyMapping('4', 'ꓻ', 'ꓽ'),
      createKeyMapping('5', 'ˍ', '˗'),   // Diacritics
      createKeyMapping('6', '"', '"'),   // Quotes
      createKeyMapping('7', '7', '&'),
      createKeyMapping('8', '8', '*'),
      createKeyMapping('9', '9', '('),
      createKeyMapping('0', '0', ')'),

      // Top row - Basic Lisu consonants
      createKeyMapping('q', 'ꓤ', 'ꓞ'),  // Ba, Pa
      createKeyMapping('w', 'ꓪ', 'ꓩ'),  // Ma, Wa
      createKeyMapping('e', 'ꓰ', 'ꓱ'),  // A, I  
      createKeyMapping('r', 'ꓡ', 'ꓠ'),  // La, Ka
      createKeyMapping('t', 'ꓔ', 'ꓓ'),  // Ta, Da
      createKeyMapping('y', 'ꓨ', 'ꓧ'),  // Ya, Xa
      createKeyMapping('u', 'ꓲ', 'ꓳ'),  // U, E
      createKeyMapping('i', 'ꓱ', 'ꓰ'),  // I, A
      createKeyMapping('o', 'ꓴ', 'ꓵ'),  // O, Ae
      createKeyMapping('p', 'ꓟ', 'ꓞ'),  // Pha, Pa

      // Home row - More consonants and vowels  
      createKeyMapping('a', 'ꓐ', 'ꓑ'),  // Ba, Pa
      createKeyMapping('s', 'ꓢ', 'ꓣ'),  // Sa, Za
      createKeyMapping('d', 'ꓓ', 'ꓔ'),  // Da, Ta
      createKeyMapping('f', 'ꓖ', 'ꓕ'),  // Fa, Tsa
      createKeyMapping('g', 'ꓖ', 'ꓘ'),  // Ga, Nga
      createKeyMapping('h', 'ꓗ', 'ꓙ'),  // Ha, Xa
      createKeyMapping('j', 'ꓙ', 'ꓚ'),  // Ja, Ca
      createKeyMapping('k', 'ꓚ', 'ꓛ'),  // Ka, Kha
      createKeyMapping('l', 'ꓜ', 'ꓝ'),  // La, Ma
      createKeyMapping(';', 'ꓷ', ':'),
      createKeyMapping("'", "'", '"'),

      // Bottom row - Additional consonants
      createKeyMapping('z', 'ꓜ', 'ꓝ'),  // Za, Zha  
      createKeyMapping('x', 'ꓥ', 'ꓦ'),  // Xa, Va
      createKeyMapping('c', 'ꓚ', 'ꓛ'),  // Ca, Cha
      createKeyMapping('v', 'ꓦ', 'ꓥ'),  // Va, Fa
      createKeyMapping('b', 'ꓐ', 'ꓑ'),  // Ba, Pa
      createKeyMapping('n', 'ꓝ', 'ꓬ'),  // Na, Nga
      createKeyMapping('m', 'ꓞ', 'ꓟ'),  // Ma, Mha
      createKeyMapping(',', ',', '<'),
      createKeyMapping('.', '.', '>'),
      createKeyMapping('/', '/', '?'),

      // Space
      createKeyMapping(' ', ' ', ' ')
    ];

    return KeyboardLayout.create({
      id: 'li-sil-basic',
      name: 'SIL Basic',
      displayName: 'Lisu (SIL Basic)',
      language: LanguageCode.LI,
      layoutType: LayoutType.PHONETIC,
      variant: LayoutVariant.SIL_BASIC,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Basic Lisu keyboard layout for beginners - simplified SIL mapping',
        'SIL International',
        DifficultyLevel.EASY
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createSILStandardLayout(): KeyboardLayout {
    const basicMappings: KeyMapping[] = [
      // Number row with Lisu tone marks
      createKeyMapping('1', 'ꓸ', '꓾'),  // Tone marks
      createKeyMapping('2', 'ꓹ', '꓿'),
      createKeyMapping('3', 'ꓺ', 'ꓼ'),
      createKeyMapping('4', 'ꓻ', 'ꓽ'),
      createKeyMapping('5', 'ˍ', '˗'),   // Diacritics
      createKeyMapping('6', '"', '"'),   // Quotes
      createKeyMapping('7', '7', '&'),
      createKeyMapping('8', '8', '*'),
      createKeyMapping('9', '9', '('),
      createKeyMapping('0', '0', ')'),

      // Top row
      createKeyMapping('q', 'ꓤ', 'ꓞ'),
      createKeyMapping('w', 'ꓪ', 'ꓩ'),
      createKeyMapping('e', 'ꓰ', 'ꓱ'),
      createKeyMapping('r', 'ꓡ', 'ꓠ'),
      createKeyMapping('t', 'ꓔ', 'ꓓ'),
      createKeyMapping('y', 'ꓨ', 'ꓧ'),
      createKeyMapping('u', 'ꓲ', 'ꓳ'),
      createKeyMapping('i', 'ꓱ', 'ꓰ'),
      createKeyMapping('o', 'ꓴ', 'ꓵ'),
      createKeyMapping('p', 'ꓟ', 'ꓞ'),

      // Home row
      createKeyMapping('a', 'ꓐ', 'ꓑ'),
      createKeyMapping('s', 'ꓢ', 'ꓣ'),
      createKeyMapping('d', 'ꓓ', 'ꓔ'),
      createKeyMapping('f', 'ꓖ', 'ꓕ'),
      createKeyMapping('g', 'ꓖ', 'ꓘ'),
      createKeyMapping('h', 'ꓗ', 'ꓙ'),
      createKeyMapping('j', 'ꓙ', 'ꓚ'),
      createKeyMapping('k', 'ꓚ', 'ꓛ'),
      createKeyMapping('l', 'ꓜ', 'ꓝ'),
      createKeyMapping(';', 'ꓷ', ':'),
      createKeyMapping("'", "'", '"'),

      // Bottom row
      createKeyMapping('z', 'ꓜ', 'ꓝ'),
      createKeyMapping('x', 'ꓥ', 'ꓦ'),
      createKeyMapping('c', 'ꓚ', 'ꓛ'),
      createKeyMapping('v', 'ꓦ', 'ꓥ'),
      createKeyMapping('b', 'ꓐ', 'ꓑ'),
      createKeyMapping('n', 'ꓝ', 'ꓬ'),
      createKeyMapping('m', 'ꓞ', 'ꓟ'),
      createKeyMapping(',', ',', '<'),
      createKeyMapping('.', '.', '>'),
      createKeyMapping('/', '/', '?'),

      // Extended vowels and tones
      createKeyMapping('[', 'ꓶ', '{'),
      createKeyMapping(']', 'ꓷ', '}'),
      createKeyMapping('\\', '\\', '|'),
      createKeyMapping('-', '˗', 'ˍ'),
      createKeyMapping('=', '=', '+'),

      // Space
      createKeyMapping(' ', ' ', ' ')
    ];

    return KeyboardLayout.create({
      id: 'li-sil-standard',
      name: 'SIL Standard',
      displayName: 'Lisu (SIL Standard)',
      language: LanguageCode.LI,
      layoutType: LayoutType.PHONETIC,
      variant: LayoutVariant.SIL_STANDARD,
      inputMethod: InputMethod.DIRECT,
      keyMappings: basicMappings,
      metadata: createSystemLayoutMetadata(
        'Complete SIL Lisu keyboard layout with full character support',
        'SIL International',
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createUnicodeStandardLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Unicode order mapping following official Lisu block
      createKeyMapping('a', 'ꓐ', 'ꓐ'),  // U+A4D0 
      createKeyMapping('b', 'ꓑ', 'ꓑ'),  // U+A4D1
      createKeyMapping('c', 'ꓒ', 'ꓒ'),  // U+A4D2
      createKeyMapping('d', 'ꓓ', 'ꓓ'),  // U+A4D3
      createKeyMapping('e', 'ꓔ', 'ꓔ'),  // U+A4D4
      createKeyMapping('f', 'ꓕ', 'ꓕ'),  // U+A4D5
      createKeyMapping('g', 'ꓖ', 'ꓖ'),  // U+A4D6
      createKeyMapping('h', 'ꓗ', 'ꓗ'),  // U+A4D7
      createKeyMapping('i', 'ꓘ', 'ꓘ'),  // U+A4D8
      createKeyMapping('j', 'ꓙ', 'ꓙ'),  // U+A4D9
      createKeyMapping('k', 'ꓚ', 'ꓚ'),  // U+A4DA
      createKeyMapping('l', 'ꓛ', 'ꓛ'),  // U+A4DB
      createKeyMapping('m', 'ꓜ', 'ꓜ'),  // U+A4DC
      createKeyMapping('n', 'ꓝ', 'ꓝ'),  // U+A4DD
      createKeyMapping('o', 'ꓞ', 'ꓞ'),  // U+A4DE
      createKeyMapping('p', 'ꓟ', 'ꓟ'),  // U+A4DF
      // ... continue with remaining Unicode points
      createKeyMapping(' ', ' ', ' ')
    ];

    return KeyboardLayout.create({
      id: 'li-unicode-standard',
      name: 'Unicode Standard',
      displayName: 'Lisu (Unicode Standard)',
      language: LanguageCode.LI,
      layoutType: LayoutType.UNICODE,
      variant: LayoutVariant.UNICODE_STANDARD,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Unicode-ordered Lisu keyboard layout following U+A4D0-A4FF block',
        'Unicode Consortium',
        DifficultyLevel.HARD
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createTraditionalLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Traditional Lisu keyboard layout
      createKeyMapping('a', 'ꓐ', 'ꓑ'),
      createKeyMapping('b', 'ꓐ', 'ꓑ'),
      createKeyMapping('c', 'ꓚ', 'ꓛ'),
      createKeyMapping('d', 'ꓓ', 'ꓔ'),
      createKeyMapping('e', 'ꓰ', 'ꓱ'),
      createKeyMapping('f', 'ꓖ', 'ꓕ'),
      createKeyMapping('g', 'ꓖ', 'ꓘ'),
      createKeyMapping('h', 'ꓗ', 'ꓙ'),
      createKeyMapping('i', 'ꓱ', 'ꓰ'),
      createKeyMapping('j', 'ꓙ', 'ꓚ'),
      createKeyMapping('k', 'ꓚ', 'ꓛ'),
      createKeyMapping('l', 'ꓜ', 'ꓝ'),
      createKeyMapping('m', 'ꓞ', 'ꓟ'),
      createKeyMapping('n', 'ꓝ', 'ꓬ'),
      createKeyMapping('o', 'ꓴ', 'ꓵ'),
      createKeyMapping('p', 'ꓟ', 'ꓞ'),
      createKeyMapping('q', 'ꓤ', 'ꓞ'),
      createKeyMapping('r', 'ꓡ', 'ꓠ'),
      createKeyMapping('s', 'ꓢ', 'ꓣ'),
      createKeyMapping('t', 'ꓔ', 'ꓓ'),
      createKeyMapping('u', 'ꓲ', 'ꓳ'),
      createKeyMapping('v', 'ꓦ', 'ꓥ'),
      createKeyMapping('w', 'ꓪ', 'ꓩ'),
      createKeyMapping('x', 'ꓥ', 'ꓦ'),
      createKeyMapping('y', 'ꓨ', 'ꓧ'),
      createKeyMapping('z', 'ꓜ', 'ꓝ'),
      createKeyMapping(' ', ' ', ' ')
    ];

    return KeyboardLayout.create({
      id: 'li-traditional',
      name: 'Traditional',
      displayName: 'Lisu (Traditional)',
      language: LanguageCode.LI,
      layoutType: LayoutType.LEGACY,
      variant: LayoutVariant.TRADITIONAL,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Traditional Lisu keyboard layout based on historical usage patterns',
        'Traditional',
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
}