/**
 * Myanmar (Burmese) language characters for typing practice
 * Based on the Myanmar Unicode block (U+1000–U+109F)
 */

export const MYANMAR_CHARACTERS = {
  // Basic Myanmar consonants (34 characters)
  consonants: [
    "က",
    "ခ",
    "ဂ",
    "ဃ",
    "င",
    "စ",
    "ဆ",
    "ဇ",
    "ဈ",
    "ဉ",
    "ည",
    "တ",
    "ထ",
    "ဒ",
    "ဓ",
    "န",
    "ပ",
    "ဖ",
    "ဗ",
    "ဘ",
    "မ",
    "ယ",
    "ရ",
    "လ",
    "ဝ",
    "သ",
    "ဟ",
    "ဠ",
    "အ",
  ],

  // Myanmar vowels and diacritics
  vowels: ["ါ", "ာ", "ိ", "ီ", "ု", "ူ", "ေ", "း", "ံ", "ံ့", "ော", "ေါ", "ေါ်"],

  // Myanmar medial consonants
  medials: ["ျ", "ြ", "ွ", "ှ"],

  // Myanmar tone marks and signs
  toneMarks: ["့", "်", "္", "်", "ံ", "း"],

  // Myanmar digits
  digits: ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"],

  // Basic punctuation used with Myanmar
  punctuation: ["။", ",", "!", "?", ";", ":", " ", "၊", "၍", "၎"],

  // Standard digits (also used)
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

// Most common Myanmar characters for beginners
export const COMMON_MYANMAR_CHARACTERS = [
  // Essential consonants
  "က",
  "ခ",
  "ဂ",
  "င",
  "စ",
  "ဆ",
  "ဇ",
  "ည",
  "တ",
  "ထ",
  "ဒ",
  "န",
  "ပ",
  "ဖ",
  "ဗ",
  "မ",
  "ယ",
  "ရ",
  "လ",
  "ဝ",
  "သ",
  "ဟ",
  "အ",
  // Essential vowels
  "ါ",
  "ာ",
  "ိ",
  "ီ",
  "ု",
  "ူ",
  "ေ",
  "း",
  // Space
  " ",
];

// Character sets organized by difficulty
export const MYANMAR_CHARACTER_SETS_BY_DIFFICULTY = {
  easy: [
    // Start with most common consonants
    "က",
    "ခ",
    "ဂ",
    "င",
    "စ",
    "ဆ",
    "ည",
    "တ",
    "န",
    "မ",
    // Basic vowels
    "ါ",
    "ာ",
    "ိ",
    "ု",
    "ေ",
    // Space
    " ",
  ],

  medium: [
    // More consonants
    ...COMMON_MYANMAR_CHARACTERS.slice(0, 20),
    // More vowels and basic medials
    "ါ",
    "ာ",
    "ိ",
    "ီ",
    "ု",
    "ူ",
    "ေ",
    "း",
    "ံ",
    "ျ",
    "ြ",
    // Basic punctuation
    "။",
    ",",
    // Myanmar digits
    "၀",
    "၁",
    "၂",
    "၃",
    "၄",
    " ",
  ],

  hard: [
    // All Myanmar characters
    ...MYANMAR_CHARACTERS.consonants,
    ...MYANMAR_CHARACTERS.vowels,
    ...MYANMAR_CHARACTERS.medials,
    ...MYANMAR_CHARACTERS.toneMarks,
    ...MYANMAR_CHARACTERS.digits,
    ...MYANMAR_CHARACTERS.punctuation,
    ...MYANMAR_CHARACTERS.numbers,
  ],
};

// Common Myanmar syllable patterns for practice
export const MYANMAR_SYLLABLE_PATTERNS = [
  // Simple CV patterns
  "က",
  "ကာ",
  "ကါ",
  "ကိ",
  "ကီ",
  "ကု",
  "ကူ",
  "ကေ",
  "ကော",
  "ခ",
  "ခါ",
  "ခာ",
  "ခိ",
  "ခီ",
  "ခု",
  "ခူ",
  "ခေ",
  "ခေါ",
  "ဂ",
  "ဂါ",
  "ဂာ",
  "ဂိ",
  "ဂီ",
  "ဂု",
  "ဂူ",
  "ဂေ",
  "ဂေါ",

  // With medials
  "ကျ",
  "ကျါ",
  "ကျာ",
  "ကျိ",
  "ကျီ",
  "ကျု",
  "ကျူ",
  "ကြ",
  "ကြါ",
  "ကြာ",
  "ကြိ",
  "ကြီ",
  "ကြု",
  "ကြူ",
  "ကွ",
  "ကွါ",
  "ကွာ",
  "ကွိ",
  "ကွီ",
  "ကွု",
  "ကွူ",
];

// Common Myanmar word components
export const MYANMAR_WORD_COMPONENTS = {
  // Common prefixes
  prefixes: ["က", "တ", "န", "ပ", "မ", "သ", "အ"],

  // Common suffixes
  suffixes: ["း", "ံ", "့", "်", "ါ", "ေါ်"],

  // Common medial combinations
  medialCombos: ["ျ", "ြ", "ွ", "ှ", "ျွ", "ြွ"],
};
