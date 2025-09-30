/**
 * Parser for converting legacy keyboard layout files to the new standardized format
 */

import { LanguageCode } from "@/domain";
import { FingerAssignment, InputMethod, LayoutType, LayoutVariant } from "../../domain/enums/keyboard-layouts";
import {
  LanguageLayoutDefinition,
  KeyDefinition,
  LayoutRow,
  LayoutMetadata
} from "../../domain/interfaces/language-layout-definition";

export class LanguageLayoutParser {
  /**
   * Parse a legacy layout object into the new LanguageLayoutDefinition format
   */
  static parseLegacyLayout(
    legacyLayout: any,
    language: LanguageCode,
    layoutType: LayoutType = LayoutType.QWERTY,
    variant: LayoutVariant
  ): LanguageLayoutDefinition {
    // Extract default and shift layouts
    const defaultLayout = legacyLayout.default || legacyLayout.defaults || [];
    const shiftLayout = legacyLayout.shift || legacyLayout.shifts || [];

    if (!Array.isArray(defaultLayout) || defaultLayout.length === 0) {
      throw new Error(`Invalid layout format for ${language}: missing default layout`);
    }

    // Parse layout rows
    const rows = this.parseLayoutRows(defaultLayout, shiftLayout);

    // Generate metadata
    const metadata = this.generateMetadata(language, layoutType, variant);

    // Extract modifier keys
    const modifiers = this.extractModifiers(defaultLayout, shiftLayout);

    // Extract special keys
    const specialKeys = this.extractSpecialKeys(defaultLayout);

    return {
      language,
      type: layoutType,
      variant,
      inputMethod: InputMethod.DIRECT,
      metadata,
      layout: { rows },
      modifiers,
      specialKeys,
      fingerAssignments: this.generateFingerAssignments(rows),
    };
  }

  /**
   * Parse layout rows from legacy format
   */
  private static parseLayoutRows(
    defaultLayout: (string | string[])[],
    shiftLayout: (string | string[])[]
  ): LayoutRow[] {
    const rows: LayoutRow[] = [];

    for (let rowIndex = 0; rowIndex < defaultLayout.length; rowIndex++) {
      const defaultRow = this.normalizeRow(defaultLayout[rowIndex]);
      const shiftRow = shiftLayout[rowIndex] ? this.normalizeRow(shiftLayout[rowIndex]) : [];

      const keys: KeyDefinition[] = [];

      for (let keyIndex = 0; keyIndex < defaultRow.length; keyIndex++) {
        const defaultKey = defaultRow[keyIndex];
        const shiftKey = shiftRow[keyIndex] || defaultKey.toUpperCase();

        const keyDef = this.parseKeyDefinition(defaultKey, shiftKey, rowIndex, keyIndex);
        keys.push(keyDef);
      }

      rows.push({
        keys,
        properties: {
          alignment: 'left',
          spacing: 1
        }
      });
    }

    return rows;
  }

  /**
   * Normalize a row to ensure it's an array of strings
   */
  private static normalizeRow(row: string | string[]): string[] {
    if (typeof row === 'string') {
      // Split by space for Myanmar format
      return row.split(' ').filter(key => key.trim().length > 0);
    }
    return Array.isArray(row) ? row : [];
  }

  /**
   * Parse individual key definition
   */
  private static parseKeyDefinition(
    defaultChar: string,
    shiftChar: string,
    row: number,
    col: number
  ): KeyDefinition {
    // Handle special keys with braces
    if (defaultChar.startsWith('{') && defaultChar.endsWith('}')) {
      const specialKey = defaultChar.slice(1, -1);
      return this.createSpecialKeyDefinition(specialKey, row, col);
    }

    // Regular character key
    const keyId = this.generateKeyId(row, col);

    return {
      key: keyId,
      char: defaultChar,
      shiftChar: shiftChar !== defaultChar ? shiftChar : undefined,
      type: 'normal',
      width: 1
    };
  }

  /**
   * Create definition for special keys (modifiers, function keys, etc.)
   */
  private static createSpecialKeyDefinition(
    specialKey: string,
    row: number,
    col: number
  ): KeyDefinition {
    const keyId = this.generateKeyId(row, col);
    const specialKeyMap: Record<string, { char: string; type: string; width: number }> = {
      'backspace': { char: '⌫', type: 'function', width: 2 },
      'tab': { char: '⇥', type: 'function', width: 1.5 },
      'caps-lock': { char: '⇪', type: 'modifier', width: 1.75 },
      'enter': { char: '⏎', type: 'function', width: 2.25 },
      'shift': { char: '⇧', type: 'modifier', width: 2.25 },
      'ctrl': { char: 'Ctrl', type: 'modifier', width: 1.25 },
      'alt': { char: 'Alt', type: 'modifier', width: 1.25 },
      'spacebar': { char: ' ', type: 'space', width: 6.25 },
    };

    const keyInfo = specialKeyMap[specialKey] || { char: specialKey, type: 'function', width: 1 };

    return {
      key: keyId,
      char: keyInfo.char,
      type: keyInfo.type as 'modifier' | 'function' | 'space' | 'normal',
      width: keyInfo.width
    };
  }

  /**
   * Generate a unique key ID based on position
   */
  private static generateKeyId(row: number, col: number): string {
    return `key_${row}_${col}`;
  }

  /**
   * Extract modifier keys from layout
   */
  private static extractModifiers(
    defaultLayout: (string | string[])[],
    shiftLayout: (string | string[])[]
  ) {
    const modifiers = {
      shift: [] as string[],
      alt: [] as string[],
      ctrl: [] as string[],
      capsLock: [] as string[]
    };

    // Find modifier keys in the layout
    for (let rowIndex = 0; rowIndex < defaultLayout.length; rowIndex++) {
      const row = this.normalizeRow(defaultLayout[rowIndex]);

      for (let keyIndex = 0; keyIndex < row.length; keyIndex++) {
        const key = row[keyIndex];
        const keyId = this.generateKeyId(rowIndex, keyIndex);

        if (key === '{shift}') modifiers.shift.push(keyId);
        if (key === '{alt}') modifiers.alt.push(keyId);
        if (key === '{ctrl}') modifiers.ctrl.push(keyId);
        if (key === '{caps-lock}') modifiers.capsLock.push(keyId);
      }
    }

    return modifiers;
  }

  /**
   * Extract special keys from layout
   */
  private static extractSpecialKeys(defaultLayout: (string | string[])[]) {
    const specialKeys: { [key: string]: string } = {};

    for (let rowIndex = 0; rowIndex < defaultLayout.length; rowIndex++) {
      const row = this.normalizeRow(defaultLayout[rowIndex]);

      for (let keyIndex = 0; keyIndex < row.length; keyIndex++) {
        const key = row[keyIndex];
        const keyId = this.generateKeyId(rowIndex, keyIndex);

        switch (key) {
          case '{backspace}':
            specialKeys.backspace = keyId;
            break;
          case '{enter}':
            specialKeys.enter = keyId;
            break;
          case '{tab}':
            specialKeys.tab = keyId;
            break;
          case '{spacebar}':
            specialKeys.space = keyId;
            break;
        }
      }
    }

    return specialKeys;
  }

  /**
   * Generate finger assignments for keys
   */
  private static generateFingerAssignments(rows: LayoutRow[]): { [keyPosition: string]: FingerAssignment } {
    const assignments: { [keyPosition: string]: FingerAssignment } = {};

    // Standard QWERTY finger assignments (can be customized per layout)
    const fingerMap: { [rowCol: string]: FingerAssignment } = {
      // Row 0 (numbers)
      '0,0': FingerAssignment.LEFT_PINKY, '0,1': FingerAssignment.LEFT_PINKY,
      '0,2': FingerAssignment.LEFT_RING, '0,3': FingerAssignment.LEFT_MIDDLE,
      '0,4': FingerAssignment.LEFT_INDEX, '0,5': FingerAssignment.LEFT_INDEX,
      '0,6': FingerAssignment.RIGHT_INDEX, '0,7': FingerAssignment.RIGHT_INDEX,
      '0,8': FingerAssignment.RIGHT_MIDDLE, '0,9': FingerAssignment.RIGHT_RING,
      '0,10': FingerAssignment.RIGHT_PINKY, '0,11': FingerAssignment.RIGHT_PINKY,
      '0,12': FingerAssignment.RIGHT_PINKY, '0,13': FingerAssignment.RIGHT_PINKY,

      // Row 1 (QWERTY)
      '1,0': FingerAssignment.LEFT_PINKY, '1,1': FingerAssignment.LEFT_PINKY,
      '1,2': FingerAssignment.LEFT_RING, '1,3': FingerAssignment.LEFT_MIDDLE,
      '1,4': FingerAssignment.LEFT_INDEX, '1,5': FingerAssignment.LEFT_INDEX,
      '1,6': FingerAssignment.RIGHT_INDEX, '1,7': FingerAssignment.RIGHT_INDEX,
      '1,8': FingerAssignment.RIGHT_MIDDLE, '1,9': FingerAssignment.RIGHT_RING,
      '1,10': FingerAssignment.RIGHT_PINKY, '1,11': FingerAssignment.RIGHT_PINKY,
      '1,12': FingerAssignment.RIGHT_PINKY, '1,13': FingerAssignment.RIGHT_PINKY,

      // Row 2 (ASDF)
      '2,0': FingerAssignment.LEFT_PINKY, '2,1': FingerAssignment.LEFT_PINKY,
      '2,2': FingerAssignment.LEFT_RING, '2,3': FingerAssignment.LEFT_MIDDLE,
      '2,4': FingerAssignment.LEFT_INDEX, '2,5': FingerAssignment.LEFT_INDEX,
      '2,6': FingerAssignment.RIGHT_INDEX, '2,7': FingerAssignment.RIGHT_INDEX,
      '2,8': FingerAssignment.RIGHT_MIDDLE, '2,9': FingerAssignment.RIGHT_RING,
      '2,10': FingerAssignment.RIGHT_PINKY, '2,11': FingerAssignment.RIGHT_PINKY,
      '2,12': FingerAssignment.RIGHT_PINKY,

      // Row 3 (ZXCV)
      '3,0': FingerAssignment.LEFT_PINKY, '3,1': FingerAssignment.LEFT_PINKY,
      '3,2': FingerAssignment.LEFT_RING, '3,3': FingerAssignment.LEFT_MIDDLE,
      '3,4': FingerAssignment.LEFT_INDEX, '3,5': FingerAssignment.LEFT_INDEX,
      '3,6': FingerAssignment.RIGHT_INDEX, '3,7': FingerAssignment.RIGHT_INDEX,
      '3,8': FingerAssignment.RIGHT_MIDDLE, '3,9': FingerAssignment.RIGHT_RING,
      '3,10': FingerAssignment.RIGHT_PINKY, '3,11': FingerAssignment.RIGHT_PINKY,

      // Row 4 (Space row)
      '4,0': FingerAssignment.LEFT_PINKY, '4,1': FingerAssignment.LEFT_THUMB,
      '4,2': FingerAssignment.LEFT_THUMB, '4,3': FingerAssignment.RIGHT_THUMB,
      '4,4': FingerAssignment.RIGHT_PINKY,
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      for (let keyIndex = 0; keyIndex < row.keys.length; keyIndex++) {
        const position = `${rowIndex},${keyIndex}`;
        const finger = fingerMap[position] || FingerAssignment.RIGHT_INDEX; // Default finger
        assignments[position] = finger;
      }
    }

    return assignments;
  }

  /**
   * Generate metadata for a layout
   */
  private static generateMetadata(
    language: LanguageCode,
    layoutType: LayoutType,
    variant: LayoutVariant
  ): LayoutMetadata {
    const languageNames = {
      [LanguageCode.EN]: 'English',
      [LanguageCode.LI]: 'Lisu',
      [LanguageCode.MY]: 'Myanmar',
    };

    const variantNames = {
      [LayoutVariant.US]: 'US',
      [LayoutVariant.UK]: 'UK',
      [LayoutVariant.INTERNATIONAL]: 'International',
      [LayoutVariant.SIL_BASIC]: 'SIL Basic',
      [LayoutVariant.SIL_STANDARD]: 'SIL Standard',
      [LayoutVariant.UNICODE_STANDARD]: 'Unicode Standard',
      [LayoutVariant.TRADITIONAL]: 'Traditional',
      [LayoutVariant.MYANMAR3]: 'Myanmar3',
      [LayoutVariant.ZAWGYI]: 'Zawgyi',
      [LayoutVariant.UNICODE_MYANMAR]: 'Unicode Myanmar',
      [LayoutVariant.WININNWA]: 'WinInnwa',
    };

    const languageName = languageNames[language] || language;
    const variantName = variantNames[variant] || variant;

    return {
      id: `${language}_${layoutType}_${variant}`,
      name: `${languageName} ${variantName}`,
      displayName: `${languageName} (${variantName})`,
      description: `${variantName} keyboard layout for ${languageName}`,
      author: 'System',
      version: '1.0.0',
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: [language, layoutType.toString(), variant.toString()],
      difficulty: 'medium',
      isCustom: false,
      isPublic: true,
    };
  }

  /**
   * Validate a parsed layout definition
   */
  static validateDefinition(definition: LanguageLayoutDefinition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate basic structure
    if (!definition.language) errors.push('Language is required');
    if (!definition.type) errors.push('Layout type is required');
    if (!definition.variant) errors.push('Layout variant is required');
    if (!definition.metadata) errors.push('Metadata is required');
    if (!definition.layout?.rows || definition.layout.rows.length === 0) {
      errors.push('Layout must have at least one row');
    }

    // Validate metadata
    if (definition.metadata) {
      if (!definition.metadata.id) errors.push('Metadata ID is required');
      if (!definition.metadata.name) errors.push('Metadata name is required');
    }

    // Validate layout rows
    if (definition.layout?.rows) {
      for (let i = 0; i < definition.layout.rows.length; i++) {
        const row = definition.layout.rows[i];
        if (!row.keys || row.keys.length === 0) {
          errors.push(`Row ${i} must have at least one key`);
        }

        // Validate individual keys
        for (let j = 0; j < row.keys.length; j++) {
          const key = row.keys[j];
          if (!key.key) errors.push(`Key at row ${i}, column ${j} must have a key identifier`);
          if (!key.char) errors.push(`Key at row ${i}, column ${j} must have a character`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}