import { DifficultyLevel, TypingMode } from "@/domain/enums/typing-mode";
import { LanguageCode } from "@/domain";
import { SessionStatus } from "@/domain/entities/typing";

export interface StartSessionCommandDTO {
  userId?: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  duration: number;
  layoutId?: string;
  customText?: string;
  competitionId?: string;
}

export interface ProcessInputCommandDTO {
  sessionId: string;
  input: string;
  timestamp: number;
  cursorPosition: {
    line: number;
    column: number;
    charIndex: number;
  };
}

export interface CompleteSessionCommandDTO {
  sessionId: string;
  finalInput: string;
  completionTime: number;
  isManualCompletion?: boolean;
}

export interface PauseResumeSessionCommandDTO {
  sessionId: string;
  action: "pause" | "resume";
  timestamp: number;
}

export interface SwitchLayoutCommandDTO {
  sessionId?: string;
  layoutId: string;
  userId?: string;
  previousLayoutId?: string;
}

// Response DTOs
export interface TypingInputResult {
  sessionId: string;
  isValid: boolean;
  currentWPM: number;
  currentAccuracy: number;
  progress: number;
  mistakes: TypingMistakeDto[];
  timeRemaining: number;
  isComplete: boolean;
}

export interface TypingMistakeDto {
  position: number;
  expected: string;
  actual: string;
  timestamp: number;
  corrected: boolean;
}

export interface TypingSessionDto {
  id: string;
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId: string;
  textContent: string;
  currentInput: string;
  startTime: number | null;
  timeLeft: number;
  status: SessionStatus;
  currentWPM: number;
  currentAccuracy: number;
  progress: number;
  mistakes: TypingMistakeDto[];
  isActive: boolean;
}

export interface StartSessionResponseDto {
  session: TypingSessionDto;
  textContent: string;
  activeLayout: {
    id: string;
    name: string;
    displayName: string;
  };
}
