/**
 * Standardized interface for language layout definitions
 * This interface defines how keyboard layouts should be structured in language files
 */

import { LanguageCode } from "@/domain";
import { FingerAssignment, InputMethod, LayoutType, LayoutVariant } from "../enums/keyboard-layouts";

export interface KeyDefinition {
  /** Physical key identifier (e.g., 'q', 'w', 'e') */
  key: string;
  /** Primary character output */
  char: string;
  /** Character with Shift modifier */
  shiftChar?: string;
  /** Character with Alt/Option modifier */
  altChar?: string;
  /** Character with Ctrl modifier */
  ctrlChar?: string;
  /** Special key type (for modifier and function keys) */
  type?: 'modifier' | 'function' | 'space' | 'normal';
  /** Custom width multiplier for special keys */
  width?: number;
}

export interface LayoutRow {
  /** Array of key definitions for this row */
  keys: KeyDefinition[];
  /** Optional row-specific styling or properties */
  properties?: {
    alignment?: 'left' | 'center' | 'right';
    spacing?: number;
  };
}

export interface ModifierState {
  /** Whether shift is active */
  shift?: boolean;
  /** Whether alt/option is active */
  alt?: boolean;
  /** Whether ctrl is active */
  ctrl?: boolean;
  /** Whether caps lock is active */
  capsLock?: boolean;
}

export interface LayoutMetadata {
  /** Layout identifier */
  id: string;
  /** Display name for the layout */
  name: string;
  /** Localized display name */
  displayName: string;
  /** Layout description */
  description: string;
  /** Layout author/creator */
  author: string;
  /** Layout version */
  version: string;
  /** Creation date */
  dateCreated: string;
  /** Last modification date */
  lastModified: string;
  /** Tags for categorization */
  tags: string[];
  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Whether this is a custom user layout */
  isCustom: boolean;
  /** Whether this layout is publicly available */
  isPublic: boolean;
}

export interface LanguageLayoutDefinition {
  /** Language code */
  language: LanguageCode;
  /** Layout type (qwerty, dvorak, etc.) */
  type: LayoutType;
  /** Layout variant (us, uk, etc.) */
  variant: LayoutVariant;
  /** Input method */
  inputMethod: InputMethod;
  /** Layout metadata */
  metadata: LayoutMetadata;
  /** Physical layout structure */
  layout: {
    /** Array of keyboard rows */
    rows: LayoutRow[];
  };
  /** Modifier key mappings and behavior */
  modifiers: {
    /** Keys that act as shift */
    shift: string[];
    /** Keys that act as alt/option */
    alt: string[];
    /** Keys that act as ctrl */
    ctrl: string[];
    /** Keys that act as caps lock */
    capsLock: string[];
    /** Special modifier combinations */
    combinations?: {
      [combination: string]: string; // e.g., "ctrl+a": "select_all"
    };
  };
  /** Special keys and their behaviors */
  specialKeys?: {
    /** Backspace key identifier */
    backspace?: string;
    /** Enter key identifier */
    enter?: string;
    /** Tab key identifier */
    tab?: string;
    /** Space key identifier */
    space?: string;
    /** Escape key identifier */
    escape?: string;
  };
  /** Finger assignments for each key position */
  fingerAssignments?: {
    [keyPosition: string]: FingerAssignment; // e.g., "0,0": FingerAssignment.LEFT_PINKY
  };
  /** Alternative character mappings for different contexts */
  alternatives?: {
    [context: string]: {
      [key: string]: string;
    };
  };
}

/**
 * Factory interface for creating keyboard layouts from language definitions
 */
export interface LanguageLayoutFactory {
  /** Create a KeyboardLayout from a language definition */
  createFromDefinition(definition: LanguageLayoutDefinition): Promise<any>; // Using any to avoid circular dependency

  /** Validate a language definition */
  validateDefinition(definition: LanguageLayoutDefinition): boolean;

  /** Parse legacy layout format to new definition */
  parseLegacyLayout(legacyLayout: any, language: LanguageCode): LanguageLayoutDefinition;
}

/**
 * Registry interface for managing multiple language layouts
 */
export interface LanguageLayoutRegistry {
  /** Register a new language layout */
  register(definition: LanguageLayoutDefinition): void;

  /** Get all layouts for a specific language */
  getLayoutsForLanguage(language: LanguageCode): LanguageLayoutDefinition[];

  /** Get a specific layout by ID */
  getLayout(id: string): LanguageLayoutDefinition | undefined;

  /** Get all available languages */
  getAvailableLanguages(): LanguageCode[];

  /** Get all available layouts */
  getAllLayouts(): LanguageLayoutDefinition[];

  /** Search layouts by criteria */
  searchLayouts(criteria: {
    language?: LanguageCode;
    type?: LayoutType;
    variant?: LayoutVariant;
    tags?: string[];
  }): LanguageLayoutDefinition[];
}