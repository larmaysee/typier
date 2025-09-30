/**
 * Commands for typing-related operations
 * Commands represent user intentions and carry all necessary data
 */

import { DifficultyLevel, TypingMode, TextType } from "@/domain/enums/typing-mode";
import { LanguageCode } from "@/domain";

export interface StartSessionCommand {
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId?: string;
  duration: number;
  textType: TextType;
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

export interface SwitchLayoutCommand {
  sessionId?: string;
  layoutId: string;
  userId?: string;
  previousLayoutId?: string;
}