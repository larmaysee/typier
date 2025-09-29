import { LanguageCode } from '@/enums/site-config';

export interface GetLayoutsQuery {
  language: LanguageCode;
  userId?: string;
}

export interface GetSessionQuery {
  sessionId: string;
}

export interface ValidateLayoutCompatibilityQuery {
  layoutId: string;
  textContent: string;
}

export interface GetUserStatsQuery {
  userId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  language?: LanguageCode;
  layoutId?: string;
}

export interface GetLeaderboardQuery {
  language?: LanguageCode;
  mode?: string;
  keyboardLayout?: string;
  timeRange?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  offset?: number;
}

export interface GetImprovementAnalysisQuery {
  userId: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}