import { LanguageCode, LayoutType, LayoutVariant } from "../enums";

/**
 * Key mapping for a specific key on the keyboard
 */
export interface KeyMapping {
  /** Physical key position */
  key: string;
  /** Default character output */
  normal: string;
  /** Shift modified character */
  shift?: string;
  /** Alt modified character */
  alt?: string;
  /** Ctrl modified character */
  ctrl?: string;
}

/**
 * Metadata about a keyboard layout
 */
export interface LayoutMetadata {
  /** Layout description */
  description: string;
  /** Author or organization */
  author: string;
  /** Version number */
  version: string;
  /** Creation date */
  createdDate: string;
  /** Last modified date */
  lastModified: string;
  /** Whether this is the default layout for the language */
  isDefault: boolean;
  /** Supported input methods */
  inputMethods: string[];
}

/**
 * Keyboard layout entity representing a specific keyboard configuration
 */
export interface KeyboardLayout {
  /** Unique identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Display name for UI */
  displayName: string;
  
  /** Language this layout belongs to */
  language: LanguageCode;
  
  /** Type of layout */
  layoutType: LayoutType;
  
  /** Specific variant */
  variant: LayoutVariant;
  
  /** Key mappings for this layout */
  keyMappings: KeyMapping[];
  
  /** Layout metadata */
  metadata: LayoutMetadata;
  
  /** Whether this is a custom user-created layout */
  isCustom: boolean;
}