import { LanguageCode } from "@/enums/site-config";
import { TypingTest, TypingSession, TypingMode, DifficultyLevel } from "../entities/typing";
import { KeyboardLayout } from "../entities/keyboard-layout";
import { User, UserPreferences, UserStatistics } from "../entities/user";

export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  getCompetitionEntries(competitionId: string): Promise<TypingTest[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences | null>;
  updateStatistics(userId: string, statistics: Partial<UserStatistics>): Promise<void>;
  getStatistics(userId: string): Promise<UserStatistics | null>;
}

export interface ISessionRepository {
  findById(sessionId: string): Promise<TypingSession | null>;
  save(session: TypingSession): Promise<void>;
  delete(sessionId: string): Promise<void>;
  findActiveByUser(userId: string): Promise<TypingSession | null>;
}

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
  deleteCustomLayout(layoutId: string, userId: string): Promise<void>;
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;
}

// Supporting types
export interface TestFilters {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface LeaderboardFilters {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  bestWpm: number;
  bestAccuracy: number;
  totalTests: number;
  language: LanguageCode;
  layoutId: string;
  rank: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}