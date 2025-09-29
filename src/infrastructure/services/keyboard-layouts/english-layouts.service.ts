import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { LanguageCode, LayoutType, LayoutVariant } from "@/domain/enums";

/**
 * English keyboard layouts provider (QWERTY, Dvorak, Colemak)
 */
export class EnglishLayoutsService implements ILayoutProvider {
  
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [
      this.createQwertyUSLayout(),
      this.createQwertyUKLayout(),
      this.createDvorakLayout(),
      this.createColemakLayout()
    ];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find(layout => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.EN) {
      errors.push("Layout language must be English");
    }

    // Check for English-specific requirements
    const requiredKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const mappedKeys = new Set(layout.keyMappings.map(m => m.key.toLowerCase()));
    
    for (const key of requiredKeys) {
      if (!mappedKeys.has(key)) {
        warnings.push(`Missing common key: ${key}`);
      }
    }

    // Validate English character set
    const allChars = layout.keyMappings.flatMap(m => [
      m.normal, m.shift || '', m.alt || '', m.ctrl || ''
    ]).join('');

    const englishPattern = /^[a-zA-Z0-9\s\.,;:!?\-'"()\[\]{}\/\\@#$%^&*+=_~`<>|]*$/;
    if (!englishPattern.test(allChars)) {
      warnings.push("Layout contains non-English characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  async getDefaultLayout(): Promise<KeyboardLayout> {
    return this.createQwertyUSLayout();
  }

  getSupportedLanguage(): LanguageCode {
    return LanguageCode.EN;
  }

  private createQwertyUSLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row
      { key: '1', normal: '1', shift: '!' },
      { key: '2', normal: '2', shift: '@' },
      { key: '3', normal: '3', shift: '#' },
      { key: '4', normal: '4', shift: '$' },
      { key: '5', normal: '5', shift: '%' },
      { key: '6', normal: '6', shift: '^' },
      { key: '7', normal: '7', shift: '&' },
      { key: '8', normal: '8', shift: '*' },
      { key: '9', normal: '9', shift: '(' },
      { key: '0', normal: '0', shift: ')' },
      { key: '-', normal: '-', shift: '_' },
      { key: '=', normal: '=', shift: '+' },

      // Top row
      { key: 'q', normal: 'q', shift: 'Q' },
      { key: 'w', normal: 'w', shift: 'W' },
      { key: 'e', normal: 'e', shift: 'E' },
      { key: 'r', normal: 'r', shift: 'R' },
      { key: 't', normal: 't', shift: 'T' },
      { key: 'y', normal: 'y', shift: 'Y' },
      { key: 'u', normal: 'u', shift: 'U' },
      { key: 'i', normal: 'i', shift: 'I' },
      { key: 'o', normal: 'o', shift: 'O' },
      { key: 'p', normal: 'p', shift: 'P' },
      { key: '[', normal: '[', shift: '{' },
      { key: ']', normal: ']', shift: '}' },
      { key: '\\', normal: '\\', shift: '|' },

      // Home row
      { key: 'a', normal: 'a', shift: 'A' },
      { key: 's', normal: 's', shift: 'S' },
      { key: 'd', normal: 'd', shift: 'D' },
      { key: 'f', normal: 'f', shift: 'F' },
      { key: 'g', normal: 'g', shift: 'G' },
      { key: 'h', normal: 'h', shift: 'H' },
      { key: 'j', normal: 'j', shift: 'J' },
      { key: 'k', normal: 'k', shift: 'K' },
      { key: 'l', normal: 'l', shift: 'L' },
      { key: ';', normal: ';', shift: ':' },
      { key: "'", normal: "'", shift: '"' },

      // Bottom row
      { key: 'z', normal: 'z', shift: 'Z' },
      { key: 'x', normal: 'x', shift: 'X' },
      { key: 'c', normal: 'c', shift: 'C' },
      { key: 'v', normal: 'v', shift: 'V' },
      { key: 'b', normal: 'b', shift: 'B' },
      { key: 'n', normal: 'n', shift: 'N' },
      { key: 'm', normal: 'm', shift: 'M' },
      { key: ',', normal: ',', shift: '<' },
      { key: '.', normal: '.', shift: '>' },
      { key: '/', normal: '/', shift: '?' },

      // Space
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'en-qwerty-us',
      name: 'QWERTY US',
      displayName: 'English (QWERTY US)',
      language: LanguageCode.EN,
      layoutType: LayoutType.STANDARD,
      variant: LayoutVariant.QWERTY_US,
      keyMappings,
      metadata: {
        description: 'Standard US QWERTY keyboard layout',
        author: 'System',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: true,
        inputMethods: ['keyboard']
      },
      isCustom: false
    };
  }

  private createQwertyUKLayout(): KeyboardLayout {
    // UK layout has some differences (£, @, ", etc.)
    const layout = this.createQwertyUSLayout();
    layout.id = 'en-qwerty-uk';
    layout.name = 'QWERTY UK';
    layout.displayName = 'English (QWERTY UK)';
    layout.variant = LayoutVariant.QWERTY_UK;
    layout.metadata.description = 'UK QWERTY keyboard layout';
    layout.metadata.isDefault = false;

    // Modify specific keys for UK layout
    const keyMappings = [...layout.keyMappings];
    const modifyKey = (key: string, normal: string, shift: string) => {
      const mapping = keyMappings.find(m => m.key === key);
      if (mapping) {
        mapping.normal = normal;
        mapping.shift = shift;
      }
    };

    modifyKey('2', '2', '"');
    modifyKey('3', '3', '£');
    modifyKey("'", "'", '@');
    
    layout.keyMappings = keyMappings;
    return layout;
  }

  private createDvorakLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row (same as QWERTY)
      { key: '1', normal: '1', shift: '!' },
      { key: '2', normal: '2', shift: '@' },
      { key: '3', normal: '3', shift: '#' },
      { key: '4', normal: '4', shift: '$' },
      { key: '5', normal: '5', shift: '%' },
      { key: '6', normal: '6', shift: '^' },
      { key: '7', normal: '7', shift: '&' },
      { key: '8', normal: '8', shift: '*' },
      { key: '9', normal: '9', shift: '(' },
      { key: '0', normal: '0', shift: ')' },
      { key: '[', normal: '[', shift: '{' },
      { key: ']', normal: ']', shift: '}' },

      // Top row (Dvorak layout)
      { key: "'", normal: "'", shift: '"' },
      { key: ',', normal: ',', shift: '<' },
      { key: '.', normal: '.', shift: '>' },
      { key: 'p', normal: 'p', shift: 'P' },
      { key: 'y', normal: 'y', shift: 'Y' },
      { key: 'f', normal: 'f', shift: 'F' },
      { key: 'g', normal: 'g', shift: 'G' },
      { key: 'c', normal: 'c', shift: 'C' },
      { key: 'r', normal: 'r', shift: 'R' },
      { key: 'l', normal: 'l', shift: 'L' },
      { key: '/', normal: '/', shift: '?' },
      { key: '=', normal: '=', shift: '+' },

      // Home row
      { key: 'a', normal: 'a', shift: 'A' },
      { key: 'o', normal: 'o', shift: 'O' },
      { key: 'e', normal: 'e', shift: 'E' },
      { key: 'u', normal: 'u', shift: 'U' },
      { key: 'i', normal: 'i', shift: 'I' },
      { key: 'd', normal: 'd', shift: 'D' },
      { key: 'h', normal: 'h', shift: 'H' },
      { key: 't', normal: 't', shift: 'T' },
      { key: 'n', normal: 'n', shift: 'N' },
      { key: 's', normal: 's', shift: 'S' },
      { key: '-', normal: '-', shift: '_' },

      // Bottom row
      { key: ';', normal: ';', shift: ':' },
      { key: 'q', normal: 'q', shift: 'Q' },
      { key: 'j', normal: 'j', shift: 'J' },
      { key: 'k', normal: 'k', shift: 'K' },
      { key: 'x', normal: 'x', shift: 'X' },
      { key: 'b', normal: 'b', shift: 'B' },
      { key: 'm', normal: 'm', shift: 'M' },
      { key: 'w', normal: 'w', shift: 'W' },
      { key: 'v', normal: 'v', shift: 'V' },
      { key: 'z', normal: 'z', shift: 'Z' },

      // Space
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'en-dvorak',
      name: 'Dvorak',
      displayName: 'English (Dvorak)',
      language: LanguageCode.EN,
      layoutType: LayoutType.STANDARD,
      variant: LayoutVariant.DVORAK,
      keyMappings,
      metadata: {
        description: 'Dvorak Simplified Keyboard layout optimized for efficiency',
        author: 'August Dvorak',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard']
      },
      isCustom: false
    };
  }

  private createColemakLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row (same as QWERTY)
      { key: '1', normal: '1', shift: '!' },
      { key: '2', normal: '2', shift: '@' },
      { key: '3', normal: '3', shift: '#' },
      { key: '4', normal: '4', shift: '$' },
      { key: '5', normal: '5', shift: '%' },
      { key: '6', normal: '6', shift: '^' },
      { key: '7', normal: '7', shift: '&' },
      { key: '8', normal: '8', shift: '*' },
      { key: '9', normal: '9', shift: '(' },
      { key: '0', normal: '0', shift: ')' },
      { key: '-', normal: '-', shift: '_' },
      { key: '=', normal: '=', shift: '+' },

      // Top row (Colemak layout)
      { key: 'q', normal: 'q', shift: 'Q' },
      { key: 'w', normal: 'w', shift: 'W' },
      { key: 'f', normal: 'f', shift: 'F' },
      { key: 'p', normal: 'p', shift: 'P' },
      { key: 'g', normal: 'g', shift: 'G' },
      { key: 'j', normal: 'j', shift: 'J' },
      { key: 'l', normal: 'l', shift: 'L' },
      { key: 'u', normal: 'u', shift: 'U' },
      { key: 'y', normal: 'y', shift: 'Y' },
      { key: ';', normal: ';', shift: ':' },
      { key: '[', normal: '[', shift: '{' },
      { key: ']', normal: ']', shift: '}' },
      { key: '\\', normal: '\\', shift: '|' },

      // Home row
      { key: 'a', normal: 'a', shift: 'A' },
      { key: 'r', normal: 'r', shift: 'R' },
      { key: 's', normal: 's', shift: 'S' },
      { key: 't', normal: 't', shift: 'T' },
      { key: 'd', normal: 'd', shift: 'D' },
      { key: 'h', normal: 'h', shift: 'H' },
      { key: 'n', normal: 'n', shift: 'N' },
      { key: 'e', normal: 'e', shift: 'E' },
      { key: 'i', normal: 'i', shift: 'I' },
      { key: 'o', normal: 'o', shift: 'O' },
      { key: "'", normal: "'", shift: '"' },

      // Bottom row
      { key: 'z', normal: 'z', shift: 'Z' },
      { key: 'x', normal: 'x', shift: 'X' },
      { key: 'c', normal: 'c', shift: 'C' },
      { key: 'v', normal: 'v', shift: 'V' },
      { key: 'b', normal: 'b', shift: 'B' },
      { key: 'k', normal: 'k', shift: 'K' },
      { key: 'm', normal: 'm', shift: 'M' },
      { key: ',', normal: ',', shift: '<' },
      { key: '.', normal: '.', shift: '>' },
      { key: '/', normal: '/', shift: '?' },

      // Space
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'en-colemak',
      name: 'Colemak',
      displayName: 'English (Colemak)',
      language: LanguageCode.EN,
      layoutType: LayoutType.STANDARD,
      variant: LayoutVariant.COLEMAK,
      keyMappings,
      metadata: {
        description: 'Colemak keyboard layout designed for efficient and comfortable touch typing',
        author: 'Shai Coleman',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard']
      },
      isCustom: false
    };
  }
}