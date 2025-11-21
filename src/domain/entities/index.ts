// Domain Entities
export { KeyboardLayout } from "./keyboard-layout";
export type { KeyMapping, KeyPosition, LayoutMetadata } from "./keyboard-layout";

export { TypingResults, TypingSession, TypingTest } from "./typing";
export type { LiveTypingStats, TypingMistake } from "./typing";

export { User } from "./user";
export type { UserPreferences, UserProfile } from "./user";

// Re-export enums for convenience
export { DifficultyLevel, TypingMode } from "../enums";
export { SessionStatus } from "../enums/session-status";
