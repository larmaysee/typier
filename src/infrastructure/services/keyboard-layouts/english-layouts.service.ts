import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { KeyboardLayout } from "@/domain/entities";
import { LanguageCode, LayoutType, LayoutVariant, InputMethod } from "@/domain/enums";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { createKeyMapping, createSystemLayoutMetadata } from "./layout-helpers";

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
      m.character, m.shiftCharacter || '', m.altCharacter || '', m.ctrlCharacter || ''
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
    const keyMappings = [
      // Number row
      createKeyMapping('1', '1', '!'),
      createKeyMapping('2', '2', '@'),
      createKeyMapping('3', '3', '#'),
      createKeyMapping('4', '4', '$'),
      createKeyMapping('5', '5', '%'),
      createKeyMapping('6', '6', '^'),
      createKeyMapping('7', '7', '&'),
      createKeyMapping('8', '8', '*'),
      createKeyMapping('9', '9', '('),
      createKeyMapping('0', '0', ')'),
      createKeyMapping('-', '-', '_'),
      createKeyMapping('=', '=', '+'),

      // Top row
      createKeyMapping('q', 'q', 'Q'),
      createKeyMapping('w', 'w', 'W'),
      createKeyMapping('e', 'e', 'E'),
      createKeyMapping('r', 'r', 'R'),
      createKeyMapping('t', 't', 'T'),
      createKeyMapping('y', 'y', 'Y'),
      createKeyMapping('u', 'u', 'U'),
      createKeyMapping('i', 'i', 'I'),
      createKeyMapping('o', 'o', 'O'),
      createKeyMapping('p', 'p', 'P'),
      createKeyMapping('[', '[', '{'),
      createKeyMapping(']', ']', '}'),
      createKeyMapping('\\', '\\', '|'),

      // Home row
      createKeyMapping('a', 'a', 'A'),
      createKeyMapping('s', 's', 'S'),
      createKeyMapping('d', 'd', 'D'),
      createKeyMapping('f', 'f', 'F'),
      createKeyMapping('g', 'g', 'G'),
      createKeyMapping('h', 'h', 'H'),
      createKeyMapping('j', 'j', 'J'),
      createKeyMapping('k', 'k', 'K'),
      createKeyMapping('l', 'l', 'L'),
      createKeyMapping(';', ';', ':'),
      createKeyMapping("'", "'", '"'),

      // Bottom row
      createKeyMapping('z', 'z', 'Z'),
      createKeyMapping('x', 'x', 'X'),
      createKeyMapping('c', 'c', 'C'),
      createKeyMapping('v', 'v', 'V'),
      createKeyMapping('b', 'b', 'B'),
      createKeyMapping('n', 'n', 'N'),
      createKeyMapping('m', 'm', 'M'),
      createKeyMapping(',', ',', '<'),
      createKeyMapping('.', '.', '>'),
      createKeyMapping('/', '/', '?'),

      // Space
      createKeyMapping(' ', ' ', ' '),
    ];

    return KeyboardLayout.create({
      id: 'en-qwerty-us',
      name: 'QWERTY US',
      displayName: 'English (QWERTY US)',
      language: LanguageCode.EN,
      layoutType: LayoutType.QWERTY,
      variant: LayoutVariant.US,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Standard US QWERTY keyboard layout',
        'System',
        DifficultyLevel.EASY
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createQwertyUKLayout(): KeyboardLayout {
    const usLayout = this.createQwertyUSLayout();

    // UK-specific key differences
    const ukMappings = usLayout.keyMappings.map(m => {
      if (m.key === '2') return createKeyMapping('2', '2', '"');
      if (m.key === '3') return createKeyMapping('3', '3', '£');
      if (m.key === "'") return createKeyMapping("'", "'", '@');
      return m;
    });

    return KeyboardLayout.create({
      id: 'en-qwerty-uk',
      name: 'QWERTY UK',
      displayName: 'English (QWERTY UK)',
      language: LanguageCode.EN,
      layoutType: LayoutType.QWERTY,
      variant: LayoutVariant.UK,
      inputMethod: InputMethod.DIRECT,
      keyMappings: ukMappings,
      metadata: createSystemLayoutMetadata(
        'UK QWERTY keyboard layout',
        'System',
        DifficultyLevel.EASY
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createDvorakLayout(): KeyboardLayout {
    const keyMappings = [
      // Number row (same as QWERTY)
      createKeyMapping('1', '1', '!'),
      createKeyMapping('2', '2', '@'),
      createKeyMapping('3', '3', '#'),
      createKeyMapping('4', '4', '$'),
      createKeyMapping('5', '5', '%'),
      createKeyMapping('6', '6', '^'),
      createKeyMapping('7', '7', '&'),
      createKeyMapping('8', '8', '*'),
      createKeyMapping('9', '9', '('),
      createKeyMapping('0', '0', ')'),
      createKeyMapping('[', '[', '{'),
      createKeyMapping(']', ']', '}'),

      // Top row - Dvorak layout
      createKeyMapping("'", "'", '"'),
      createKeyMapping(',', ',', '<'),
      createKeyMapping('.', '.', '>'),
      createKeyMapping('p', 'p', 'P'),
      createKeyMapping('y', 'y', 'Y'),
      createKeyMapping('f', 'f', 'F'),
      createKeyMapping('g', 'g', 'G'),
      createKeyMapping('c', 'c', 'C'),
      createKeyMapping('r', 'r', 'R'),
      createKeyMapping('l', 'l', 'L'),
      createKeyMapping('/', '/', '?'),
      createKeyMapping('=', '=', '+'),

      // Home row
      createKeyMapping('a', 'a', 'A'),
      createKeyMapping('o', 'o', 'O'),
      createKeyMapping('e', 'e', 'E'),
      createKeyMapping('u', 'u', 'U'),
      createKeyMapping('i', 'i', 'I'),
      createKeyMapping('d', 'd', 'D'),
      createKeyMapping('h', 'h', 'H'),
      createKeyMapping('t', 't', 'T'),
      createKeyMapping('n', 'n', 'N'),
      createKeyMapping('s', 's', 'S'),
      createKeyMapping('-', '-', '_'),

      // Bottom row
      createKeyMapping(';', ';', ':'),
      createKeyMapping('q', 'q', 'Q'),
      createKeyMapping('j', 'j', 'J'),
      createKeyMapping('k', 'k', 'K'),
      createKeyMapping('x', 'x', 'X'),
      createKeyMapping('b', 'b', 'B'),
      createKeyMapping('m', 'm', 'M'),
      createKeyMapping('w', 'w', 'W'),
      createKeyMapping('v', 'v', 'V'),
      createKeyMapping('z', 'z', 'Z'),

      // Space
      createKeyMapping(' ', ' ', ' '),
    ];

    return KeyboardLayout.create({
      id: 'en-dvorak',
      name: 'Dvorak',
      displayName: 'English (Dvorak)',
      language: LanguageCode.EN,
      layoutType: LayoutType.DVORAK,
      variant: LayoutVariant.INTERNATIONAL,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Dvorak keyboard layout - optimized for English typing efficiency',
        'System',
        DifficultyLevel.MEDIUM
      ),
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  private createColemakLayout(): KeyboardLayout {
    const keyMappings = [
      // Number row (same as QWERTY)
      createKeyMapping('1', '1', '!'),
      createKeyMapping('2', '2', '@'),
      createKeyMapping('3', '3', '#'),
      createKeyMapping('4', '4', '$'),
      createKeyMapping('5', '5', '%'),
      createKeyMapping('6', '6', '^'),
      createKeyMapping('7', '7', '&'),
      createKeyMapping('8', '8', '*'),
      createKeyMapping('9', '9', '('),
      createKeyMapping('0', '0', ')'),
      createKeyMapping('-', '-', '_'),
      createKeyMapping('=', '=', '+'),

      // Top row - Colemak layout
      createKeyMapping('q', 'q', 'Q'),
      createKeyMapping('w', 'w', 'W'),
      createKeyMapping('f', 'f', 'F'),
      createKeyMapping('p', 'p', 'P'),
      createKeyMapping('g', 'g', 'G'),
      createKeyMapping('j', 'j', 'J'),
      createKeyMapping('l', 'l', 'L'),
      createKeyMapping('u', 'u', 'U'),
      createKeyMapping('y', 'y', 'Y'),
      createKeyMapping(';', ';', ':'),
      createKeyMapping('[', '[', '{'),
      createKeyMapping(']', ']', '}'),
      createKeyMapping('\\', '\\', '|'),

      // Home row
      createKeyMapping('a', 'a', 'A'),
      createKeyMapping('r', 'r', 'R'),
      createKeyMapping('s', 's', 'S'),
      createKeyMapping('t', 't', 'T'),
      createKeyMapping('d', 'd', 'D'),
      createKeyMapping('h', 'h', 'H'),
      createKeyMapping('n', 'n', 'N'),
      createKeyMapping('e', 'e', 'E'),
      createKeyMapping('i', 'i', 'I'),
      createKeyMapping('o', 'o', 'O'),
      createKeyMapping("'", "'", '"'),

      // Bottom row
      createKeyMapping('z', 'z', 'Z'),
      createKeyMapping('x', 'x', 'X'),
      createKeyMapping('c', 'c', 'C'),
      createKeyMapping('v', 'v', 'V'),
      createKeyMapping('b', 'b', 'B'),
      createKeyMapping('k', 'k', 'K'),
      createKeyMapping('m', 'm', 'M'),
      createKeyMapping(',', ',', '<'),
      createKeyMapping('.', '.', '>'),
      createKeyMapping('/', '/', '?'),

      // Space
      createKeyMapping(' ', ' ', ' '),
    ];

    return KeyboardLayout.create({
      id: 'en-colemak',
      name: 'Colemak',
      displayName: 'English (Colemak)',
      language: LanguageCode.EN,
      layoutType: LayoutType.COLEMAK,
      variant: LayoutVariant.INTERNATIONAL,
      inputMethod: InputMethod.DIRECT,
      keyMappings,
      metadata: createSystemLayoutMetadata(
        'Colemak keyboard layout - designed for efficient and comfortable typing',
        'System',
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