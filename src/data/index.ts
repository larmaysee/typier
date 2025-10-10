/**
 * Main data index file
 * Exports all language data for typing practice
 */

// Export all English data
export * from "./english";

// Export all Lisu data
export * from "./lisu";

// Export all Myanmar data
export * from "./myanmar";

// Language configuration mapping
export const LANGUAGE_DATA_CONFIG = {
  en: {
    name: "English",
    textTypes: ["characters", "words", "sentences", "paragraphs", "programming", "punctuation"],
    difficulties: ["easy", "medium", "hard"],
    specialTypes: ["programming"],
  },
  li: {
    name: "Lisu",
    textTypes: ["characters", "syllables", "words", "sentences", "paragraphs", "punctuation"],
    difficulties: ["easy", "medium", "hard"],
    specialTypes: ["syllables"],
  },
  my: {
    name: "Myanmar",
    textTypes: ["characters", "syllables", "words", "sentences", "paragraphs", "punctuation", "phrases"],
    difficulties: ["easy", "medium", "hard"],
    specialTypes: ["syllables", "phrases"],
  },
} as const;

// Supported languages
export const SUPPORTED_LANGUAGES = ["en", "li", "my"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Common text generation settings
export const GLOBAL_TEXT_CONFIG = {
  maxGenerationAttempts: 5,
  fallbackToEasy: true,
  ensureMinimumLength: true,
  preventRepeatedContent: true,
};
