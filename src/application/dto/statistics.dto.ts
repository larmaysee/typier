import { DifficultyLevel, TypingMode } from "@/domain/enums/typing-mode";
import { LanguageCode } from "@/domain";

export interface UserStatisticsResponseDTO {
  userId: string;
  totalTests: number;
  totalTimeTyped: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  totalCharactersTyped: number;
  improvementRate: number;
  lastTestDate: Date;
  layoutStats: Array<{
    layoutId: string;
    layoutName: string;
    testsCount: number;
    averageWpm: number;
    averageAccuracy: number;
  }>;
  recentTests: Array<{
    date: Date;
    wpm: number;
    accuracy: number;
    mode: TypingMode;
    language: LanguageCode;
  }>;
}

export interface LeaderboardResponseDTO {
  entries: Array<{
    userId: string;
    username: string;
    bestWpm: number;
    bestAccuracy: number;
    totalTests: number;
    language: LanguageCode;
    layoutId: string;
    layoutName: string;
    rank: number;
  }>;
  totalCount: number;
  currentUserRank?: number;
  filters: {
    language?: LanguageCode;
    mode?: TypingMode;
    difficulty?: DifficultyLevel;
    layoutId?: string;
    timeRange?: string;
  };
}

export interface ImprovementTrackingResponseDTO {
  userId: string;
  overallTrend: "improving" | "stable" | "declining";
  wpmProgress: Array<{
    date: Date;
    value: number;
  }>;
  accuracyProgress: Array<{
    date: Date;
    value: number;
  }>;
  consistencyProgress: Array<{
    date: Date;
    value: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: number;
  }>;
  nextMilestones: Array<{
    metric: "wpm" | "accuracy" | "consistency";
    currentValue: number;
    targetValue: number;
    estimatedTimeToReach: number;
  }>;
}
