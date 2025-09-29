import { LanguageCode, TypingMode, DifficultyLevel, SessionStatus, FocusState } from "../enums";

/**
 * Cursor position in the text
 */
export interface CursorPosition {
  /** Current character index */
  index: number;
  /** Current line number */
  line: number;
  /** Current column in the line */
  column: number;
}

/**
 * Individual typing mistake
 */
export interface TypingMistake {
  /** Position where mistake occurred */
  position: number;
  /** Expected character */
  expected: string;
  /** Actual typed character */
  actual: string;
  /** Timestamp when mistake occurred */
  timestamp: number;
}

/**
 * Live typing statistics during a session
 */
export interface LiveTypingStats {
  /** Current words per minute */
  currentWpm: number;
  /** Current accuracy percentage */
  currentAccuracy: number;
  /** Characters typed so far */
  charactersTyped: number;
  /** Correct characters */
  correctCharacters: number;
  /** Incorrect characters */
  incorrectCharacters: number;
  /** Total time elapsed in seconds */
  timeElapsed: number;
}

/**
 * Final typing test results
 */
export interface TypingResults {
  /** Words per minute achieved */
  wpm: number;
  /** Accuracy percentage */
  accuracy: number;
  /** Number of correct words */
  correctWords: number;
  /** Number of incorrect words */
  incorrectWords: number;
  /** Total words in the test */
  totalWords: number;
  /** Test duration in seconds */
  duration: number;
  /** Total characters typed */
  charactersTyped: number;
  /** Number of errors made */
  errors: number;
  /** Consistency score (0-100) */
  consistency: number;
  /** Finger utilization analysis */
  fingerUtilization: Record<string, number>;
}

/**
 * Typing test entity
 */
export interface Typing {
  /** Unique identifier */
  id: string;
  /** User ID who took the test */
  userId: string;
  /** Typing mode used */
  mode: TypingMode;
  /** Difficulty level */
  difficulty: DifficultyLevel;
  /** Language used */
  language: LanguageCode;
  /** Keyboard layout ID used */
  keyboardLayout: string;
  /** Text content that was typed */
  textContent: string;
  /** Final results */
  results: TypingResults;
  /** Test completion timestamp */
  timestamp: number;
  /** Competition ID if applicable */
  competitionId?: string;
}

/**
 * Active typing session entity
 */
export interface TypingSession {
  /** Unique session identifier */
  id: string;
  /** Associated typing test */
  test: Typing;
  /** Current user input */
  currentInput: string;
  /** Session start time */
  startTime: number | null;
  /** Time remaining in seconds */
  timeLeft: number;
  /** Current session status */
  status: SessionStatus;
  /** Current cursor position */
  cursorPosition: CursorPosition;
  /** Current focus state */
  focusState: FocusState;
  /** All mistakes made so far */
  mistakes: TypingMistake[];
  /** Live statistics */
  liveStats: LiveTypingStats;
  /** Active keyboard layout */
  activeLayout: string;
}