/**
 * Typing modes supported by the application
 */
export enum TypingMode {
  /** No database recording, enhanced visual feedback */
  PRACTICE = "practice",
  
  /** Records to database and leaderboard */
  NORMAL = "normal",
  
  /** Daily/weekly challenges with fixed content */
  COMPETITION = "competition"
}

/**
 * Difficulty levels for typing tests
 */
export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium", 
  HARD = "hard"
}

/**
 * Text content types for generation
 */
export enum TextType {
  WORDS = "words",
  SENTENCES = "sentences",
  PARAGRAPHS = "paragraphs",
  CHARS = "chars",
  CODE = "code"
}