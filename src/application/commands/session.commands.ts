import { LanguageCode } from "@/domain";
import { DifficultyLevel, TextType, TypingMode } from "@/domain/enums/typing-mode";

export interface StartSessionCommand {
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId?: string;
  duration: number;
  textType: TextType;
  contentLength?: number; // Number of words/chars to generate (optional, defaults to duration-based estimate)
}

export interface ProcessInputCommand {
  sessionId: string;
  input: string;
  timestamp: number;
}

export interface CompleteSessionCommand {
  sessionId: string;
  finalInput: string;
  completedAt: number;
}

export interface PauseSessionCommand {
  sessionId: string;
  pausedAt: number;
}

export interface ResumeSessionCommand {
  sessionId: string;
  resumedAt: number;
}
