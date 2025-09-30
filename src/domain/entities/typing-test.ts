import { LanguageCode } from "@/domain";
import { TypingMode, DifficultyLevel } from "../enums";

export interface TypingTest {
  id: string;
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId: string;
  textContent: string;
  results: TypingResults;
  timestamp: number;
  competitionId?: string;
}

export interface TypingResults {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  duration: number;
  charactersTyped: number;
  errors: number;
  consistency: number;          // New metric
  fingerUtilization: Record<string, number>; // Advanced analytics
}

export interface TypingMistake {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
}