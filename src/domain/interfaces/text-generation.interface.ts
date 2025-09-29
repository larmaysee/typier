import { LanguageCode, TypingMode, DifficultyLevel, TextType } from "../enums";

/**
 * Configuration for text generation
 */
export interface TextGenerationConfig {
  /** Target language */
  language: LanguageCode;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Type of text to generate */
  textType: TextType;
  /** Desired length (words for text, characters for chars) */
  length: number;
  /** User ID for personalized content */
  userId?: string;
  /** Typing mode context */
  mode?: TypingMode;
  /** Custom word list to include */
  customWords?: string[];
  /** Words to avoid */
  excludeWords?: string[];
}

/**
 * Generated text content with metadata
 */
export interface GeneratedText {
  /** The generated text content */
  content: string;
  /** Metadata about the generation */
  metadata: {
    /** Actual word count */
    wordCount: number;
    /** Character count including spaces */
    characterCount: number;
    /** Difficulty level used */
    difficulty: DifficultyLevel;
    /** Language used */
    language: LanguageCode;
    /** Text type */
    textType: TextType;
    /** Estimated typing time in seconds */
    estimatedTime: number;
    /** Source of the text (generated, preset, etc.) */
    source: string;
  };
}

/**
 * Text generation service interface
 */
export interface ITextGenerationService {
  /**
   * Generate text content based on configuration
   */
  generate(config: TextGenerationConfig): Promise<GeneratedText>;

  /**
   * Check if the service supports a specific language
   */
  supportsLanguage(language: LanguageCode): boolean;

  /**
   * Get available text types for a language
   */
  getAvailableTextTypes(language: LanguageCode): TextType[];

  /**
   * Validate generated content
   */
  validateContent(content: string, config: TextGenerationConfig): Promise<boolean>;
}