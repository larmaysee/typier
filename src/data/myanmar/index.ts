/**
 * Main Myanmar data index file
 * Exports all Myanmar typing practice data
 */

export {
  COMMON_MYANMAR_CHARACTERS,
  MYANMAR_CHARACTER_SETS_BY_DIFFICULTY,
  MYANMAR_CHARACTERS,
  MYANMAR_SYLLABLE_PATTERNS,
  MYANMAR_WORD_COMPONENTS,
} from "./characters";

export { MYANMAR_WORDS, MYANMAR_WORDS_BY_CATEGORY, MYANMAR_WORDS_BY_DIFFICULTY } from "./words";

export {
  MYANMAR_COMMON_PHRASES,
  MYANMAR_PUNCTUATION_PATTERNS,
  MYANMAR_SENTENCES,
  MYANMAR_SENTENCES_BY_DIFFICULTY,
} from "./sentences";

// Text generation configurations for Myanmar
export const MYANMAR_TEXT_CONFIG = {
  // Character practice settings
  characters: {
    minLength: 40,
    maxLength: 180,
    repeatPattern: 3, // How many times to repeat each character/syllable
  },

  // Word practice settings
  words: {
    minWords: 8,
    maxWords: 45,
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

// Text types available for Myanmar
export const MYANMAR_TEXT_TYPES = {
  CHARACTERS: "characters",
  SYLLABLES: "syllables",
  WORDS: "words",
  SENTENCES: "sentences",
  PARAGRAPHS: "paragraphs",
  PUNCTUATION: "punctuation",
  PHRASES: "phrases",
} as const;

export type MyanmarTextType = (typeof MYANMAR_TEXT_TYPES)[keyof typeof MYANMAR_TEXT_TYPES];
