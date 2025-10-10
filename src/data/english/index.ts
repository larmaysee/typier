/**
 * Main English data index file
 * Exports all English typing practice data
 */

export { CHARACTER_SETS_BY_DIFFICULTY, ENGLISH_CHARACTERS } from "./characters";
export { ENGLISH_SENTENCES, PUNCTUATION_PATTERNS, SENTENCES_BY_DIFFICULTY } from "./sentences";
export { ENGLISH_WORDS, WORDS_BY_DIFFICULTY } from "./words";

// Text generation configurations
export const ENGLISH_TEXT_CONFIG = {
  // Character practice settings
  characters: {
    minLength: 50,
    maxLength: 200,
    repeatPattern: 3, // How many times to repeat each character
  },

  // Word practice settings
  words: {
    minWords: 10,
    maxWords: 50,
    wordSeparator: " ",
  },

  // Sentence practice settings
  sentences: {
    minSentences: 2,
    maxSentences: 8,
    sentenceSeparator: " ",
  },

  // Paragraph practice settings
  paragraphs: {
    minParagraphs: 1,
    maxParagraphs: 3,
    sentencesPerParagraph: { min: 3, max: 6 },
    paragraphSeparator: "\n\n",
  },
};

// Text types available for English
export const ENGLISH_TEXT_TYPES = {
  CHARACTERS: "characters",
  WORDS: "words",
  SENTENCES: "sentences",
  PARAGRAPHS: "paragraphs",
  PROGRAMMING: "programming",
  PUNCTUATION: "punctuation",
} as const;

export type EnglishTextType = (typeof ENGLISH_TEXT_TYPES)[keyof typeof ENGLISH_TEXT_TYPES];
