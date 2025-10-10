/**
 * English character sets for typing practice
 */

export const ENGLISH_CHARACTERS = {
  // Basic alphabet characters (lowercase)
  basic: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ],

  // Numbers
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],

  // Basic punctuation
  basicPunctuation: [".", ",", "?", "!", ";", ":", "'", '"'],

  // Advanced punctuation and symbols
  advancedPunctuation: [
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "-",
    "_",
    "+",
    "=",
    "[",
    "]",
    "{",
    "}",
    "|",
    "\\",
    "/",
    "<",
    ">",
    "~",
    "`",
  ],

  // Common combinations for practice
  digraphs: ["th", "he", "in", "er", "an", "re", "ed", "nd", "ou", "ea", "ni", "se", "it", "al", "en", "ty"],

  // Space character
  space: [" "],
};

// Character sets by difficulty level
export const CHARACTER_SETS_BY_DIFFICULTY = {
  easy: [
    ...ENGLISH_CHARACTERS.basic.slice(0, 10), // First 10 letters: a-j
    ...ENGLISH_CHARACTERS.space,
  ],

  medium: [
    ...ENGLISH_CHARACTERS.basic,
    ...ENGLISH_CHARACTERS.numbers,
    ...ENGLISH_CHARACTERS.basicPunctuation,
    ...ENGLISH_CHARACTERS.space,
  ],

  hard: [
    ...ENGLISH_CHARACTERS.basic,
    ...ENGLISH_CHARACTERS.basic.map((c) => c.toUpperCase()), // Add uppercase
    ...ENGLISH_CHARACTERS.numbers,
    ...ENGLISH_CHARACTERS.basicPunctuation,
    ...ENGLISH_CHARACTERS.advancedPunctuation,
    ...ENGLISH_CHARACTERS.space,
  ],
};
