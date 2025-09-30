import { DifficultyLevel, TypingMode } from "@/domain/enums";
import { LanguageCode } from "@/domain";

export interface GetUserStatsQuery {
  userId: string;
  language?: LanguageCode;
  mode?: TypingMode;
  layoutId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface GetLeaderboardQuery {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  timeRange?: "daily" | "weekly" | "monthly" | "all-time";
  limit?: number;
  offset?: number;
}

export interface GetAvailableLayoutsQuery {
  language: LanguageCode;
  userId?: string;
  includeCustom?: boolean;
}

export interface GetLayoutCompatibilityQuery {
  layoutId: string;
  targetLanguage: LanguageCode;
  mode: TypingMode;
}

export interface TrackImprovementQuery {
  userId: string;
  language?: LanguageCode;
  analysisDepth?: "basic" | "detailed" | "comprehensive";
  timeRange?: {
    start: Date;
    end: Date;
  };
}
