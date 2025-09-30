import { DifficultyLevel, TypingMode } from "@/domain/enums/typing-mode";
import { LanguageCode } from "@/enums/site-config";

export interface StartSessionCommand {
  userId?: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  duration: number;
  layoutId?: string;
  customText?: string;
  competitionId?: string;
}

export interface ProcessInputCommand {
  sessionId: string;
  input: string;
  timestamp: number;
  cursorPosition: {
    line: number;
    column: number;
    charIndex: number;
  };
}

export interface CompleteSessionCommand {
  sessionId: string;
  finalInput: string;
  completionTime: number;
  isManualCompletion?: boolean;
}

export interface PauseResumeSessionCommand {
  sessionId: string;
  action: "pause" | "resume";
  timestamp: number;
}

export interface SwitchLayoutCommand {
  sessionId?: string;
  layoutId: string;
  userId?: string;
  previousLayoutId?: string;
}
