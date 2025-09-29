/**
 * Domain enums for typing test modes and session management
 */

export enum TypingMode {
  PRACTICE = "practice",  // No DB recording, enhanced feedback
  NORMAL = "normal",      // DB recording, leaderboard integration  
  COMPETITION = "competition" // Daily challenges, standardized layouts
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export enum SessionStatus {
  IDLE = "idle",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum TextType {
  CHARS = "chars",      // Individual character practice
  SENTENCES = "sentences" // Full text passages
}