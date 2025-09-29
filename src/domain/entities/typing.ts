import { LanguageCode } from '@/enums/site-config';

export enum TypingMode {
  PRACTICE = 'practice',
  NORMAL = 'normal',
  COMPETITION = 'competition'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum SessionStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TextType {
  SENTENCES = 'sentences',
  WORDS = 'words',
  CHARS = 'chars'
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
  consistency: number;
  fingerUtilization: Record<string, number>;
}

export interface TypingMistake {
  position: number;
  expectedChar: string;
  actualChar: string;
  timestamp: number;
}

export interface LiveTypingStats {
  currentWPM: number;
  currentAccuracy: number;
  errorsCount: number;
  timeElapsed: number;
}

export interface CursorPosition {
  index: number;
  wordIndex: number;
  charIndex: number;
}

export interface FocusState {
  isFocused: boolean;
  lastFocusTime: number;
  focusLossCount: number;
}

export interface TypingTest {
  id: string;
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayout: string;
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
  activeLayoutId: string;
}