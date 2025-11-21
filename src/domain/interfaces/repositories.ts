/**
 * Domain repository interfaces following the repository pattern
 * These define the contracts for data access without implementation details
 */

import { LanguageCode } from "@/domain";
import { KeyboardLayout } from "../entities/keyboard-layout";
import { LeaderboardEntry, TypingStatistics } from "../entities/statistics";
import { TypingResults, TypingSession, TypingTest } from "../entities/typing";
import { User, UserPreferences, UserProfile } from "../entities/user";
import { DifficultyLevel, TypingMode } from "../enums/typing-mode";

// Filters and query objects
export interface TestFilters {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  dateFrom?: number;
  dateTo?: number;
  limit?: number;
  offset?: number;
}

export interface LeaderboardFilters {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  layoutId?: string;
  timeRange?: "daily" | "weekly" | "monthly" | "all-time";
  limit?: number;
  offset?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Repository interfaces
export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  findById(id: string): Promise<TypingTest | null>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  getCompetitionEntries(competitionId: string): Promise<TypingTest[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
  deleteTest(id: string): Promise<void>;
}

export interface ISessionRepository {
  save(session: TypingSession): Promise<void>;
  findById(id: string): Promise<TypingSession | null>;
  update(session: TypingSession): Promise<void>;
  delete(id: string): Promise<void>;
  findActiveByUser(userId: string): Promise<TypingSession | null>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences | null>;
  updateProfile(userId: string, profile: UserProfile): Promise<void>;
  deleteUser(id: string): Promise<void>;
  // Add statistics methods for use cases
  getStatistics(userId: string): Promise<TypingStatistics | null>;
  updateStatistics(userId: string, stats: Partial<TypingStatistics>): Promise<void>;
}

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  findById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
  deleteCustomLayout(layoutId: string, userId: string): Promise<void>;
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;
  getPopularLayouts(language: LanguageCode, limit?: number): Promise<KeyboardLayout[]>;
}

export interface IStatisticsRepository {
  getUserStatistics(userId: string, language?: LanguageCode, mode?: TypingMode): Promise<TypingStatistics[]>;
  updateStatistics(userId: string, testResult: TypingResults, language: LanguageCode, mode: TypingMode): Promise<void>;
  getGlobalStatistics(): Promise<Record<string, number>>;
  getUserRank(userId: string, language: LanguageCode, mode: TypingMode): Promise<number>;
}
