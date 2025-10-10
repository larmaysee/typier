/**
 * Lisu language characters for typing practice
 * Based on the Lisu Unicode block (U+A4D0–U+A4FF)
 */

export const LISU_CHARACTERS = {
  // Basic Lisu consonants
  consonants: [
    "ꓐ",
    "ꓑ",
    "ꓒ",
    "ꓓ",
    "ꓔ",
    "ꓕ",
    "ꓖ",
    "ꓗ",
    "ꓘ",
    "ꓙ",
    "ꓚ",
    "ꓛ",
    "ꓜ",
    "ꓝ",
    "ꓞ",
    "ꓟ",
    "ꓠ",
    "ꓡ",
    "ꓢ",
    "ꓣ",
    "ꓤ",
    "ꓥ",
    "ꓦ",
    "ꓧ",
    "ꓨ",
    "ꓩ",
    "ꓪ",
    "ꓫ",
    "ꓬ",
    "ꓭ",
    "ꓮ",
    "ꓯ",
    "ꓰ",
    "ꓱ",
    "ꓲ",
    "ꓳ",
    "ꓴ",
    "ꓵ",
    "ꓶ",
    "ꓷ",
    "ꓸ",
    "ꓹ",
    "ꓺ",
    "ꓻ",
  ],

  // Lisu vowels
  vowels: ["ꓼ", "ꓽ", "꓾", "꓿", "ꔀ", "ꔁ"],

  // Lisu tone marks
  toneMarks: ["꓾", "꓿", "ꔀ", "ꔁ"],

  // Basic punctuation used with Lisu
  punctuation: [".", ",", "!", "?", ";", ":", " "],

  // Numbers (using standard digits with Lisu)
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

// Most common Lisu characters for beginners
export const COMMON_LISU_CHARACTERS = [
  "ꓐ",
  "ꓑ",
  "ꓒ",
  "ꓓ",
  "ꓔ",
  "ꓕ",
  "ꓖ",
  "ꓗ",
  "ꓘ",
  "ꓙ",
  "ꓚ",
  "ꓛ",
  "ꓜ",
  "ꓝ",
  "ꓞ",
  "ꓟ",
  "ꓠ",
  "ꓡ",
  "ꓢ",
  "ꓣ",
  "ꓼ",
  "ꓽ",
  "꓾",
  "꓿",
  " ",
];

// Character sets organized by difficulty
export const LISU_CHARACTER_SETS_BY_DIFFICULTY = {
  easy: [
    // Start with most common consonants and basic vowels
    ...COMMON_LISU_CHARACTERS.slice(0, 10), // First 10 consonants
    ...LISU_CHARACTERS.vowels.slice(0, 2), // First 2 vowels
    " ", // Space for word separation
  ],

  medium: [
    // Add more consonants and all vowels
    ...COMMON_LISU_CHARACTERS,
    ...LISU_CHARACTERS.vowels,
    ...LISU_CHARACTERS.numbers.slice(0, 5), // First 5 numbers
    ".",
    ",",
  ],

  hard: [
    // All Lisu characters
    ...LISU_CHARACTERS.consonants,
    ...LISU_CHARACTERS.vowels,
    ...LISU_CHARACTERS.toneMarks,
    ...LISU_CHARACTERS.numbers,
    ...LISU_CHARACTERS.punctuation,
  ],
};

// Commonly used Lisu syllable patterns for practice
export const LISU_SYLLABLE_PATTERNS = [
  "ꓐꓼ",
  "ꓑꓽ",
  "ꓒ꓾",
  "ꓓ꓿",
  "ꓔꔀ",
  "ꓕꔁ",
  "ꓖꓼ",
  "ꓗꓽ",
  "ꓘ꓾",
  "ꓙ꓿",
  "ꓚꔀ",
  "ꓛꔁ",
  "ꓜꓼ",
  "ꓝꓽ",
  "ꓞ꓾",
  "ꓟ꓿",
  "ꓠꔀ",
  "ꓡꔁ",
];
