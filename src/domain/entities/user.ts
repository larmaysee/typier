import { LanguageCode } from '@/enums/site-config';

export interface User {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  keyboardLayouts: Record<LanguageCode, string>; // preferred layout per language
  defaultLanguage: LanguageCode;
  defaultMode: string;
  defaultDifficulty: string;
  defaultDuration: number;
  theme: string;
}

export interface UserStatistics {
  userId: string;
  totalTests: number;
  bestWPM: number;
  averageWPM: number;
  averageAccuracy: number;
  totalTimeTyped: number;
  languageStats: Record<LanguageCode, LanguageStatistics>;
  layoutStats: Record<string, LayoutStatistics>;
}

export interface LanguageStatistics {
  testsCompleted: number;
  bestWPM: number;
  averageWPM: number;
  averageAccuracy: number;
  totalTimeTyped: number;
}

export interface LayoutStatistics {
  layoutId: string;
  testsCompleted: number;
  bestWPM: number;
  averageWPM: number;
  averageAccuracy: number;
  totalTimeTyped: number;
  errorPatterns: Record<string, number>;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  language: LanguageCode;
  keyboardLayout: string;
  timestamp: number;
  mode: string;
}