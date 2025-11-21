import { LanguageCode } from "@/domain";
import { LayoutVariant } from "@/domain/enums/keyboard-layouts";
import { DifficultyLevel, TypingMode } from "@/domain/enums/typing-mode";

export interface CreateTypingSessionDTO {
  userId: string;
  language: LanguageCode;
  difficulty: DifficultyLevel;
  mode: TypingMode;
  layoutVariant: LayoutVariant;
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
  preferredLayouts: LayoutVariant[];
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
