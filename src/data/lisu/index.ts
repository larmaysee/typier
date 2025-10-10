/**
 * Main Lisu data index file
 * Exports all Lisu typing practice data
 */

export {
  COMMON_LISU_CHARACTERS,
  LISU_CHARACTER_SETS_BY_DIFFICULTY,
  LISU_CHARACTERS,
  LISU_SYLLABLE_PATTERNS,
} from "./characters";

export { COMMON_LISU_PATTERNS, LISU_WORDS, LISU_WORDS_BY_DIFFICULTY } from "./words";

export { LISU_PUNCTUATION_PATTERNS, LISU_SENTENCES, LISU_SENTENCES_BY_DIFFICULTY } from "./sentences";

// Text generation configurations for Lisu
export const LISU_TEXT_CONFIG = {
  // Character practice settings
  characters: {
    minLength: 30,
    maxLength: 150,
    repeatPattern: 3, // How many times to repeat each character/syllable
  },

  // Word practice settings
  words: {
    minWords: 8,
    maxWords: 40,
    wordSeparator: " ",
  },

  // Sentence practice settings
  sentences: {
    minSentences: 2,
    maxSentences: 6,
    sentenceSeparator: " ",
  },

  // Paragraph practice settings
  paragraphs: {
    minParagraphs: 1,
    maxParagraphs: 3,
    sentencesPerParagraph: { min: 2, max: 5 },
    paragraphSeparator: "\n\n",
  },
};

// Text types available for Lisu
export const LISU_TEXT_TYPES = {
  CHARACTERS: "characters",
  SYLLABLES: "syllables",
  WORDS: "words",
  SENTENCES: "sentences",
  PARAGRAPHS: "paragraphs",
  PUNCTUATION: "punctuation",
} as const;

export type LisuTextType = (typeof LISU_TEXT_TYPES)[keyof typeof LISU_TEXT_TYPES];
