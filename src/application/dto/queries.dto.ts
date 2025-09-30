import { DifficultyLevel, TypingMode } from "@/domain/enums/typing-mode";
import { LanguageCode } from "@/enums/site-config";

export interface GetUserStatsQueryDTO {
  userId: string;
  language?: LanguageCode;
  mode?: TypingMode;
  layoutId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface GetLeaderboardQueryDTO {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  timeRange?: "daily" | "weekly" | "monthly" | "all-time";
  limit?: number;
  offset?: number;
}

export interface GetAvailableLayoutsQueryDTO {
  language: LanguageCode;
  userId?: string;
  includeCustom?: boolean;
}

export interface GetLayoutCompatibilityQueryDTO {
  layoutId: string;
  targetLanguage: LanguageCode;
  mode: TypingMode;
}

export interface TrackImprovementQueryDTO {
  userId: string;
  language?: LanguageCode;
  analysisDepth?: "basic" | "detailed" | "comprehensive";
  timeRange?: {
    start: Date;
    end: Date;
  };
}
