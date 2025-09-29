import { LanguageCode } from "@/enums/site-config";
import { TypingMode, DifficultyLevel, SessionStatus } from "../entities/typing";

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
  action: 'pause' | 'resume';
  timestamp: number;
}

export interface SwitchLayoutCommandDTO {
  sessionId?: string;
  layoutId: string;
  userId?: string;
  previousLayoutId?: string;
}