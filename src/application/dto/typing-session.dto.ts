import { TypingMode, DifficultyLevel, SessionStatus, TextType } from '@/domain/entities/typing';
import { LanguageCode } from '@/enums/site-config';
import { KeyboardLayout } from '@/domain/entities/keyboard-layout';

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
  cursorPosition: {
    index: number;
    wordIndex: number;
    charIndex: number;
  };
  liveStats: {
    currentWPM: number;
    currentAccuracy: number;
    errorsCount: number;
    timeElapsed: number;
  };
  mistakes: Array<{
    position: number;
    expectedChar: string;
    actualChar: string;
    timestamp: number;
  }>;
}

export interface CreateSessionDto {
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId?: string;
  duration: number;
  textType: TextType;
}

export interface SessionInputDto {
  sessionId: string;
  input: string;
  timestamp: number;
}

export interface CompleteSessionDto {
  sessionId: string;
  finalInput: string;
  completedAt: number;
}

export interface StartSessionResponseDto {
  session: TypingSessionDto;
  textContent: string;
  activeLayout: KeyboardLayout;
}