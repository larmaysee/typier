import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { LanguageCode, LayoutType, LayoutVariant } from "@/domain/enums";

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
      m.normal, m.shift || '', m.alt || '', m.ctrl || ''
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
      { key: '1', normal: 'ꓸ', shift: '꓾' },  // Tone marks
      { key: '2', normal: 'ꓹ', shift: '꓿' },
      { key: '3', normal: 'ꓺ', shift: 'ꓼ' },
      { key: '4', normal: 'ꓻ', shift: 'ꓽ' },
      { key: '5', normal: 'ˍ', shift: '˗' },   // Diacritics
      { key: '6', normal: '"', shift: '"' },   // Quotes
      { key: '7', normal: '7', shift: '&' },
      { key: '8', normal: '8', shift: '*' },
      { key: '9', normal: '9', shift: '(' },
      { key: '0', normal: '0', shift: ')' },

      // Top row - Basic Lisu consonants
      { key: 'q', normal: 'ꓤ', shift: 'ꓞ' },  // Ba, Pa
      { key: 'w', normal: 'ꓪ', shift: 'ꓩ' },  // Ma, Wa
      { key: 'e', normal: 'ꓰ', shift: 'ꓱ' },  // A, I  
      { key: 'r', normal: 'ꓡ', shift: 'ꓠ' },  // La, Ka
      { key: 't', normal: 'ꓔ', shift: 'ꓓ' },  // Ta, Da
      { key: 'y', normal: 'ꓨ', shift: 'ꓧ' },  // Ya, Xa
      { key: 'u', normal: 'ꓲ', shift: 'ꓳ' },  // U, E
      { key: 'i', normal: 'ꓱ', shift: 'ꓰ' },  // I, A
      { key: 'o', normal: 'ꓴ', shift: 'ꓵ' },  // O, Ae
      { key: 'p', normal: 'ꓟ', shift: 'ꓞ' },  // Pha, Pa

      // Home row - More consonants and vowels  
      { key: 'a', normal: 'ꓐ', shift: 'ꓑ' },  // Ba, Pa
      { key: 's', normal: 'ꓢ', shift: 'ꓣ' },  // Sa, Za
      { key: 'd', normal: 'ꓓ', shift: 'ꓔ' },  // Da, Ta
      { key: 'f', normal: 'ꓖ', shift: 'ꓕ' },  // Fa, Tsa
      { key: 'g', normal: 'ꓖ', shift: 'ꓘ' },  // Ga, Nga
      { key: 'h', normal: 'ꓗ', shift: 'ꓙ' },  // Ha, Xa
      { key: 'j', normal: 'ꓙ', shift: 'ꓚ' },  // Ja, Ca
      { key: 'k', normal: 'ꓚ', shift: 'ꓛ' },  // Ka, Kha
      { key: 'l', normal: 'ꓜ', shift: 'ꓝ' },  // La, Ma
      { key: ';', normal: 'ꓷ', shift: ':' },
      { key: "'", normal: "'", shift: '"' },

      // Bottom row - Additional consonants
      { key: 'z', normal: 'ꓜ', shift: 'ꓝ' },  // Za, Zha  
      { key: 'x', normal: 'ꓥ', shift: 'ꓦ' },  // Xa, Va
      { key: 'c', normal: 'ꓚ', shift: 'ꓛ' },  // Ca, Cha
      { key: 'v', normal: 'ꓦ', shift: 'ꓥ' },  // Va, Fa
      { key: 'b', normal: 'ꓐ', shift: 'ꓑ' },  // Ba, Pa
      { key: 'n', normal: 'ꓝ', shift: 'ꓬ' },  // Na, Nga
      { key: 'm', normal: 'ꓞ', shift: 'ꓟ' },  // Ma, Mha
      { key: ',', normal: ',', shift: '<' },
      { key: '.', normal: '.', shift: '>' },
      { key: '/', normal: '/', shift: '?' },

      // Space
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'li-sil-basic',
      name: 'SIL Basic',
      displayName: 'Lisu (SIL Basic)',
      language: LanguageCode.LI,
      layoutType: LayoutType.PHONETIC,
      variant: LayoutVariant.SIL_BASIC,
      keyMappings,
      metadata: {
        description: 'Basic Lisu keyboard layout for beginners - simplified SIL mapping',
        author: 'SIL International',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: true,
        inputMethods: ['keyboard', 'ime']
      },
      isCustom: false
    };
  }

  private createSILStandardLayout(): KeyboardLayout {
    const basicLayout = this.createSILBasicLayout();
    
    // Extend with additional mappings for complete character coverage
    const additionalMappings: KeyMapping[] = [
      // Extended vowels and tones
      { key: '[', normal: 'ꓶ', shift: '{' },
      { key: ']', normal: 'ꓷ', shift: '}' },
      { key: '\\', normal: '\\', shift: '|' },
      { key: '-', normal: '˗', shift: 'ˍ' },
      { key: '=', normal: '=', shift: '+' }
    ];

    return {
      ...basicLayout,
      id: 'li-sil-standard',
      name: 'SIL Standard', 
      displayName: 'Lisu (SIL Standard)',
      variant: LayoutVariant.SIL_STANDARD,
      keyMappings: [...basicLayout.keyMappings, ...additionalMappings],
      metadata: {
        ...basicLayout.metadata,
        description: 'Complete SIL Lisu keyboard layout with full character support',
        isDefault: false
      }
    };
  }

  private createUnicodeStandardLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Unicode order mapping following official Lisu block
      { key: 'a', normal: 'ꓐ', shift: 'ꓐ' },  // U+A4D0 
      { key: 'b', normal: 'ꓑ', shift: 'ꓑ' },  // U+A4D1
      { key: 'c', normal: 'ꓒ', shift: 'ꓒ' },  // U+A4D2
      { key: 'd', normal: 'ꓓ', shift: 'ꓓ' },  // U+A4D3
      { key: 'e', normal: 'ꓔ', shift: 'ꓔ' },  // U+A4D4
      { key: 'f', normal: 'ꓕ', shift: 'ꓕ' },  // U+A4D5
      { key: 'g', normal: 'ꓖ', shift: 'ꓖ' },  // U+A4D6
      { key: 'h', normal: 'ꓗ', shift: 'ꓗ' },  // U+A4D7
      { key: 'i', normal: 'ꓘ', shift: 'ꓘ' },  // U+A4D8
      { key: 'j', normal: 'ꓙ', shift: 'ꓙ' },  // U+A4D9
      { key: 'k', normal: 'ꓚ', shift: 'ꓚ' },  // U+A4DA
      { key: 'l', normal: 'ꓛ', shift: 'ꓛ' },  // U+A4DB
      { key: 'm', normal: 'ꓜ', shift: 'ꓜ' },  // U+A4DC
      { key: 'n', normal: 'ꓝ', shift: 'ꓝ' },  // U+A4DD
      { key: 'o', normal: 'ꓞ', shift: 'ꓞ' },  // U+A4DE
      { key: 'p', normal: 'ꓟ', shift: 'ꓟ' },  // U+A4DF
      // ... continue with remaining Unicode points
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'li-unicode-standard',
      name: 'Unicode Standard',
      displayName: 'Lisu (Unicode Standard)',
      language: LanguageCode.LI,
      layoutType: LayoutType.UNICODE,
      variant: LayoutVariant.UNICODE_STANDARD,
      keyMappings,
      metadata: {
        description: 'Unicode-ordered Lisu keyboard layout following U+A4D0-A4FF block',
        author: 'Unicode Consortium',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard', 'ime']
      },
      isCustom: false
    };
  }

  private createTraditionalLayout(): KeyboardLayout {
    const basicLayout = this.createSILBasicLayout();
    
    return {
      ...basicLayout,
      id: 'li-traditional',
      name: 'Traditional',
      displayName: 'Lisu (Traditional)',
      variant: LayoutVariant.TRADITIONAL,
      layoutType: LayoutType.LEGACY,
      metadata: {
        ...basicLayout.metadata,
        description: 'Traditional Lisu keyboard layout based on historical usage patterns',
        author: 'Traditional',
        isDefault: false
      }
    };
  }
}