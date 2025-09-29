import { LanguageCode } from '@/enums/site-config';

export interface UserStatisticsDto {
  userId: string;
  totalTests: number;
  bestWPM: number;
  averageWPM: number;
  averageAccuracy: number;
  totalTimeTyped: number;
  improvementTrend: {
    wpmTrend: number; // positive = improving, negative = declining
    accuracyTrend: number;
    consistencyScore: number;
  };
  languageBreakdown: Array<{
    language: LanguageCode;
    testsCompleted: number;
    bestWPM: number;
    averageWPM: number;
    averageAccuracy: number;
  }>;
  layoutBreakdown: Array<{
    layoutId: string;
    layoutName: string;
    testsCompleted: number;
    bestWPM: number;
    averageWPM: number;
    averageAccuracy: number;
    errorPatterns: Array<{
      character: string;
      errorCount: number;
    }>;
  }>;
}

export interface LeaderboardDto {
  entries: Array<{
    rank: number;
    userId: string;
    username: string;
    wpm: number;
    accuracy: number;
    language: LanguageCode;
    keyboardLayout: string;
    timestamp: number;
    mode: string;
  }>;
  userRank?: number;
  totalEntries: number;
  filters: {
    language?: LanguageCode;
    mode?: string;
    keyboardLayout?: string;
    timeRange?: 'day' | 'week' | 'month' | 'all';
  };
}

export interface ImprovementAnalysisDto {
  userId: string;
  timeRange: string; // Changed from union to string for flexibility
  overallTrend: {
    wpmImprovement: number;
    accuracyImprovement: number;
    consistencyImprovement: number;
  };
  recommendations: Array<{
    type: string; // Changed from union to string for flexibility
    priority: string; // Changed from union to string for flexibility
    title: string;
    description: string;
    actionItems: string[];
  }>;
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: number;
  }>;
}