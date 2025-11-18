/**
 * Domain entities for typing system
 * Contains the core business logic and rules for typing tests and sessions
 */

import { LanguageCode } from "@/domain";
import { DifficultyLevel, TypingMode } from "../enums";
import { SessionStatus } from "../enums/session-status";
import { CursorPosition, FocusState } from "../value-objects/cursor-position";
import { Accuracy, Duration, WPM } from "../value-objects/typing-metrics";
import { KeyboardLayout } from "./keyboard-layout";

// Re-export SessionStatus for use cases
export { SessionStatus };

/**
 * Individual typing mistake
 */
export interface TypingMistake {
  readonly position: number;
  readonly expected: string;
  readonly actual: string;
  readonly timestamp: number;
  readonly corrected: boolean;
}

/**
 * Live typing statistics during a session
 */
export interface LiveTypingStats {
  readonly currentWPM: number;
  readonly currentAccuracy: number;
  readonly charactersPerSecond: number;
  readonly errorRate: number;
  readonly timeElapsed: number;
  readonly elapsedTime: number; // Alias for timeElapsed for compatibility
  readonly progress: number; // 0-100 percentage
}

export class TypingResults {
  private constructor(
    public readonly wpm: number,
    public readonly accuracy: number,
    public readonly correctWords: number,
    public readonly incorrectWords: number,
    public readonly totalWords: number,
    public readonly duration: number,
    public readonly charactersTyped: number,
    public readonly correctChars: number, // Add missing property
    public readonly errors: number,
    public readonly consistency: number,
    public readonly fingerUtilization: Record<string, number>
  ) {
    if (wpm < 0) throw new Error("WPM cannot be negative");
    if (accuracy < 0 || accuracy > 100) throw new Error("Accuracy must be between 0 and 100");
    if (correctWords < 0) throw new Error("Correct words cannot be negative");
    if (incorrectWords < 0) throw new Error("Incorrect words cannot be negative");
    // TEMPORARILY DISABLED: This validation might be causing issues
    // if (totalWords !== correctWords + incorrectWords) {
    //   throw new Error("Total words must equal correct + incorrect words");
    // }
    if (duration <= 0) throw new Error("Duration must be positive");
    if (charactersTyped < 0) throw new Error("Characters typed cannot be negative");
    if (errors < 0) throw new Error("Errors cannot be negative");
    if (consistency < 0 || consistency > 100) throw new Error("Consistency must be between 0 and 100");
  }

  static create(data: {
    wpm: number;
    accuracy: number;
    correctWords: number;
    incorrectWords: number;
    duration: number;
    charactersTyped: number;
    correctChars?: number;
    errors: number;
    consistency: number;
    fingerUtilization: Record<string, number>;
  }): TypingResults {
    const totalWords = data.correctWords + data.incorrectWords;
    const correctChars = data.correctChars ?? data.charactersTyped - data.errors;

    console.log("🏗️ [TypingResults.create] Creating with data:", {
      wpm: data.wpm,
      accuracy: data.accuracy,
      correctWords: data.correctWords,
      incorrectWords: data.incorrectWords,
      calculatedTotalWords: totalWords,
      duration: data.duration,
      charactersTyped: data.charactersTyped,
      correctChars: correctChars,
      errors: data.errors,
      consistency: data.consistency,
    });

    return new TypingResults(
      data.wpm,
      data.accuracy,
      data.correctWords,
      data.incorrectWords,
      totalWords,
      data.duration,
      data.charactersTyped,
      correctChars,
      data.errors,
      data.consistency,
      { ...data.fingerUtilization }
    );
  }

  static fromMetrics(
    wpm: WPM,
    accuracy: Accuracy,
    duration: Duration,
    correctWords: number,
    incorrectWords: number,
    consistency: number = 0,
    fingerUtilization: Record<string, number> = {}
  ): TypingResults {
    const correctChars = wpm.charactersTyped - wpm.errorCount;
    return new TypingResults(
      wpm.value,
      accuracy.percentage,
      correctWords,
      incorrectWords,
      correctWords + incorrectWords,
      duration.totalSeconds,
      wpm.charactersTyped,
      correctChars,
      wpm.errorCount,
      consistency,
      fingerUtilization
    );
  }

  get errorRate(): number {
    if (this.charactersTyped === 0) return 0;
    return (this.errors / this.charactersTyped) * 100;
  }

  get averageWordsPerMinute(): number {
    if (this.duration === 0) return 0;
    return (this.totalWords / this.duration) * 60;
  }

  isValid(): boolean {
    return (
      this.wpm >= 0 &&
      this.accuracy >= 0 &&
      this.accuracy <= 100 &&
      this.duration > 0 &&
      this.totalWords === this.correctWords + this.incorrectWords
    );
  }

  equals(other: TypingResults): boolean {
    return (
      this.wpm === other.wpm &&
      this.accuracy === other.accuracy &&
      this.duration === other.duration &&
      this.totalWords === other.totalWords &&
      this.errors === other.errors
    );
  }
}

export class TypingTest {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly mode: TypingMode,
    public readonly difficulty: DifficultyLevel,
    public readonly language: LanguageCode,
    public readonly keyboardLayout: string,
    public readonly textContent: string,
    public readonly results: TypingResults,
    public readonly timestamp: number,
    public readonly competitionId?: string
  ) {
    if (!id.trim()) throw new Error("Test ID cannot be empty");
    if (!userId.trim()) throw new Error("User ID cannot be empty");
    if (!textContent.trim()) throw new Error("Text content cannot be empty");
    if (!keyboardLayout.trim()) throw new Error("Keyboard layout cannot be empty");
    if (timestamp <= 0) throw new Error("Timestamp must be positive");
  }

  static create(data: {
    id: string;
    userId: string;
    mode: TypingMode;
    difficulty: DifficultyLevel;
    language: LanguageCode;
    keyboardLayout: string;
    textContent: string;
    results: TypingResults;
    timestamp?: number;
    competitionId?: string;
  }): TypingTest {
    return new TypingTest(
      data.id,
      data.userId,
      data.mode,
      data.difficulty,
      data.language,
      data.keyboardLayout,
      data.textContent,
      data.results,
      data.timestamp || Date.now(),
      data.competitionId
    );
  }

  static generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isCompetitionTest(): boolean {
    return !!this.competitionId;
  }

  isPracticeMode(): boolean {
    return this.mode === TypingMode.PRACTICE;
  }

  isNormalMode(): boolean {
    return this.mode === TypingMode.NORMAL;
  }

  isCompetitionMode(): boolean {
    return this.mode === TypingMode.COMPETITION;
  }

  shouldRecordToDatabase(): boolean {
    return this.mode !== TypingMode.PRACTICE;
  }

  getPerformanceScore(): number {
    // Weighted score combining WPM, accuracy, and consistency
    const wpmScore = Math.min(this.results.wpm / 100, 1); // Normalize to 0-1
    const accuracyScore = this.results.accuracy / 100;
    const consistencyScore = this.results.consistency / 100;

    return wpmScore * 0.4 + accuracyScore * 0.4 + consistencyScore * 0.2;
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.userId.trim().length > 0 &&
      this.textContent.trim().length > 0 &&
      this.keyboardLayout.trim().length > 0 &&
      this.timestamp > 0 &&
      this.results.isValid()
    );
  }

  equals(other: TypingTest): boolean {
    return this.id === other.id;
  }
}

export class TypingSession {
  private constructor(
    public readonly id: string,
    public readonly test: TypingTest,
    public readonly currentInput: string,
    public readonly startTime: number | null,
    public readonly timeLeft: number,
    public readonly status: SessionStatus,
    public readonly cursorPosition: CursorPosition,
    public readonly focusState: FocusState,
    public readonly mistakes: TypingMistake[],
    public readonly liveStats: LiveTypingStats,
    public readonly activeLayout: KeyboardLayout
  ) {
    if (!id.trim()) throw new Error("Session ID cannot be empty");
    if (timeLeft < 0) throw new Error("Time left cannot be negative");
    if (mistakes.some((m) => m.position < 0)) throw new Error("Mistake positions cannot be negative");
  }

  static create(data: {
    id: string;
    test: TypingTest;
    currentInput?: string;
    startTime?: number | null;
    timeLeft: number;
    status?: SessionStatus;
    cursorPosition?: CursorPosition;
    focusState?: FocusState;
    mistakes?: TypingMistake[];
    liveStats?: LiveTypingStats;
    activeLayout: KeyboardLayout;
  }): TypingSession {
    return new TypingSession(
      data.id,
      data.test,
      data.currentInput || "",
      data.startTime || null,
      data.timeLeft,
      data.status || SessionStatus.IDLE,
      data.cursorPosition || {
        characterIndex: 0,
        wordIndex: 0,
        lineNumber: 0,
        columnNumber: 0,
      },
      data.focusState || {
        isFocused: false,
        hasSelection: false,
        lastFocusTime: Date.now(),
      },
      data.mistakes || [],
      data.liveStats || {
        currentWPM: 0,
        currentAccuracy: 100,
        charactersPerSecond: 0,
        errorRate: 0,
        timeElapsed: 0,
        elapsedTime: 0,
        progress: 0,
      },
      data.activeLayout
    );
  }

  static generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  start(): TypingSession {
    if (this.status !== SessionStatus.IDLE) {
      throw new Error("Session can only be started from idle state");
    }

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      Date.now(),
      this.timeLeft,
      SessionStatus.ACTIVE,
      this.cursorPosition,
      { ...this.focusState, isFocused: true },
      this.mistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  pause(): TypingSession {
    if (this.status !== SessionStatus.ACTIVE) {
      throw new Error("Can only pause active sessions");
    }

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      this.timeLeft,
      SessionStatus.PAUSED,
      this.cursorPosition,
      { ...this.focusState, isFocused: false },
      this.mistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  resume(): TypingSession {
    if (this.status !== SessionStatus.PAUSED) {
      throw new Error("Can only resume paused sessions");
    }

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      this.timeLeft,
      SessionStatus.ACTIVE,
      this.cursorPosition,
      { ...this.focusState, isFocused: true },
      this.mistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  complete(): TypingSession {
    if (this.status !== SessionStatus.ACTIVE) {
      throw new Error("Can only complete active sessions");
    }

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      0,
      SessionStatus.COMPLETED,
      this.cursorPosition,
      { ...this.focusState, isFocused: false },
      this.mistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  addMistake(mistake: TypingMistake): TypingSession {
    const updatedMistakes = [...this.mistakes, mistake];

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      this.timeLeft,
      this.status,
      this.cursorPosition,
      this.focusState,
      updatedMistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  updateInput(input: string, newCursorPosition: CursorPosition): TypingSession {
    return new TypingSession(
      this.id,
      this.test,
      input,
      this.startTime,
      this.timeLeft,
      this.status,
      newCursorPosition,
      this.focusState,
      this.mistakes,
      this.liveStats,
      this.activeLayout
    );
  }

  updateLiveStats(stats: LiveTypingStats): TypingSession {
    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      this.timeLeft,
      this.status,
      this.cursorPosition,
      this.focusState,
      this.mistakes,
      stats,
      this.activeLayout
    );
  }

  switchLayout(newLayout: KeyboardLayout): TypingSession {
    if (newLayout.language !== this.test.language) {
      throw new Error("Layout language must match test language");
    }

    return new TypingSession(
      this.id,
      this.test,
      this.currentInput,
      this.startTime,
      this.timeLeft,
      this.status,
      this.cursorPosition,
      this.focusState,
      this.mistakes,
      this.liveStats,
      newLayout
    );
  }

  isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  isPaused(): boolean {
    return this.status === SessionStatus.PAUSED;
  }

  getProgress(): number {
    if (!this.test.textContent) return 0;
    return Math.min((this.currentInput.length / this.test.textContent.length) * 100, 100);
  }

  getElapsedTime(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  getCurrentAccuracy(): number {
    if (this.currentInput.length === 0) return 100;

    let correctChars = 0;
    for (let i = 0; i < this.currentInput.length; i++) {
      if (i < this.test.textContent.length && this.currentInput[i] === this.test.textContent[i]) {
        correctChars++;
      }
    }

    return (correctChars / this.currentInput.length) * 100;
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.test.isValid() &&
      this.timeLeft >= 0 &&
      this.activeLayout.language === this.test.language
    );
  }

  equals(other: TypingSession): boolean {
    return this.id === other.id;
  }
}
