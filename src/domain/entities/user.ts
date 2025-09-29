import { LanguageCode } from "@/enums/site-config";
import { TypingResults } from "./typing-test";

export interface User {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  defaultLanguage: LanguageCode;
  keyboardLayouts: Record<LanguageCode, string>; // Language -> preferred layout ID
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  visualFeedback: boolean;
  autoCompleteEnabled: boolean;
}

export interface UserStatistics {
  totalTests: number;
  bestWpm: number;
  averageAccuracy: number;
  totalTimeTyped: number; // in seconds
  favoriteLanguage: LanguageCode;
  improvementTrend: number; // percentage
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  textContent: string;
  language: LanguageCode;
  allowedLayouts: string[];
  isActive: boolean;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  userId: string;
  username: string;
  results: TypingResults;
  submittedAt: number;
}

// Re-export TypingResults from typing-test
export type { TypingResults } from './typing-test';