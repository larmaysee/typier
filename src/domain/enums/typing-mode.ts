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
  STARTED = "started",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}