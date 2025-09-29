import { LanguageCode } from "../../domain/enums/language-code";
import { DifficultyLevel } from "../../domain/enums/difficulty-level";
import { TypingMode } from "../../domain/enums/typing-mode";
import { KeyboardLayoutVariant } from "../../domain/enums/keyboard-layout-variant";

export interface CreateTypingSessionDTO {
  userId: string;
  language: LanguageCode;
  difficulty: DifficultyLevel;
  mode: TypingMode;
  layoutVariant: KeyboardLayoutVariant;
  duration: number;
  textContent?: string;
}

export interface TypingSessionResultDTO {
  sessionId: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  mistakes: number;
  completionTime: number;
  textTyped: string;
}

export interface UserProfileDTO {
  userId: string;
  username: string;
  email: string;
  totalTests: number;
  bestWpm: number;
  averageAccuracy: number;
  preferredLanguage: LanguageCode;
  preferredLayouts: KeyboardLayoutVariant[];
}

export interface LeaderboardEntryDTO {
  rank: number;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  date: string;
  language: LanguageCode;
  mode: TypingMode;
}