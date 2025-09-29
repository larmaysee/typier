import { LanguageCode } from "@/enums/site-config";
import { KeyboardLayout } from "./keyboard-layout";

export enum TypingMode {
  PRACTICE = "practice",
  NORMAL = "normal", 
  COMPETITION = "competition"
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  AUTO = "auto"
}

export enum SessionStatus {
  IDLE = "idle",
  ACTIVE = "active", 
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface TypingMistake {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
}

export interface LiveTypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  elapsedTime: number;
}

export interface TypingResults {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  duration: number;
  mistakes: TypingMistake[];
  consistency: number;
  peak_wpm: number;
}

export interface CursorPosition {
  line: number;
  column: number;
  charIndex: number;
}

export interface FocusState {
  isFocused: boolean;
  lastFocusTime: number;
  focusLostDuration: number;
}

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

export interface TypingSession {
  id: string;
  test: TypingTest;
  currentInput: string;
  startTime: number | null;
  timeLeft: number;
  status: SessionStatus;
  cursorPosition: CursorPosition;
  focusState: FocusState;
  mistakes: TypingMistake[];
  liveStats: LiveTypingStats;
  activeLayout: KeyboardLayout;
  created_at: Date;
  updated_at: Date;
}