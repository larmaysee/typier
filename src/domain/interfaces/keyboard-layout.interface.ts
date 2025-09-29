import { LanguageCode } from "../enums";
import { KeyboardLayout } from "../entities";

/**
 * Layout validation result
 */
export interface ValidationResult {
  /** Whether the layout is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Layout compatibility information
 */
export interface CompatibilityInfo {
  /** Supported platforms */
  platforms: string[];
  /** Browser compatibility */
  browsers: string[];
  /** Input method support */
  inputMethods: string[];
  /** Unicode version required */
  unicodeVersion?: string;
}

/**
 * Layout search criteria
 */
export interface LayoutSearchCriteria {
  /** Language filter */
  language?: LanguageCode;
  /** Name pattern */
  namePattern?: string;
  /** Layout type */
  layoutType?: string;
  /** Is custom layout */
  isCustom?: boolean;
  /** Tags to match */
  tags?: string[];
}

/**
 * Layout provider interface for language-specific implementations
 */
export interface ILayoutProvider {
  /**
   * Get all available layouts for this provider's language
   */
  getAvailableLayouts(): Promise<KeyboardLayout[]>;

  /**
   * Get a specific layout by ID
   */
  getLayoutById(id: string): Promise<KeyboardLayout | null>;

  /**
   * Validate a layout for this language
   */
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;

  /**
   * Get the default layout for this language
   */
  getDefaultLayout(): Promise<KeyboardLayout>;

  /**
   * Get supported language
   */
  getSupportedLanguage(): LanguageCode;
}

/**
 * Main layout manager service interface
 */
export interface ILayoutManagerService {
  /**
   * Get all layouts for a specific language
   */
  getLayoutsForLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;

  /**
   * Switch the active layout for a session
   */
  switchActiveLayout(sessionId: string, layoutId: string): Promise<void>;

  /**
   * Validate a keyboard layout
   */
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;

  /**
   * Register a custom layout
   */
  registerCustomLayout(layout: KeyboardLayout): Promise<void>;

  /**
   * Get layout compatibility information
   */
  getLayoutCompatibility(layoutId: string): Promise<CompatibilityInfo>;

  /**
   * Get a specific layout by ID
   */
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;

  /**
   * Search layouts by criteria
   */
  searchLayouts(criteria: LayoutSearchCriteria): Promise<KeyboardLayout[]>;
}

/**
 * Layout registry service for dynamic registration
 */
export interface ILayoutRegistryService {
  /**
   * Register a new layout
   */
  registerLayout(layout: KeyboardLayout): Promise<void>;

  /**
   * Unregister a layout
   */
  unregisterLayout(layoutId: string): Promise<void>;

  /**
   * Get layouts by language
   */
  getLayoutsByLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;

  /**
   * Search layouts by criteria
   */
  searchLayouts(criteria: LayoutSearchCriteria): Promise<KeyboardLayout[]>;

  /**
   * Check if a layout is registered
   */
  isLayoutRegistered(layoutId: string): Promise<boolean>;
}