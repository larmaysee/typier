import { TypingTest, TypingSession } from '../entities/typing';
import { User, UserStatistics, UserPreferences, LeaderboardEntry } from '../entities/user';
import { KeyboardLayout } from '../entities/keyboard-layout';
import { LanguageCode } from '@/enums/site-config';

export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  findById(id: string): Promise<TypingTest | null>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
}

export interface ISessionRepository {
  save(session: TypingSession): Promise<void>;
  findById(id: string): Promise<TypingSession | null>;
  update(session: TypingSession): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences>;
  getStatistics(userId: string): Promise<UserStatistics | null>;
  updateStatistics(statistics: UserStatistics): Promise<void>;
}

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  findById(id: string): Promise<KeyboardLayout | null>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getCustomLayouts(userId: string): Promise<KeyboardLayout[]>;
}

export interface TestFilters {
  language?: LanguageCode;
  mode?: string;
  difficulty?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface LeaderboardFilters {
  language?: LanguageCode;
  mode?: string;
  keyboardLayout?: string;
  timeRange?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
  offset?: number;
}