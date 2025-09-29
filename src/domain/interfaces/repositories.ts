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
}
/**
 * Domain repository interfaces following the repository pattern
 * These define the contracts for data access without implementation details
 */

import { LanguageCode } from '../enums/languages';
import { TypingMode, DifficultyLevel } from '../enums/typing-mode';
import { CompetitionType, CompetitionStatus } from '../enums/competition-types';

// Forward declarations of entities (will be defined in entities files)
export interface TypingTest {
  id: string;
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayout: string;
  textContent: string;
  results: TypingResults;
  timestamp: number;
  competitionId?: string;
}

export interface TypingResults {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  duration: number;
  charactersTyped: number;
  errors: number;
  consistency: number;
  fingerUtilization: Record<string, number>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  displayName?: string;
  avatar?: string;
  bio?: string;
  totalTests: number;
  bestWPM: number;
  averageAccuracy: number;
}

export interface UserPreferences {
  defaultLanguage: LanguageCode;
  preferredLayouts: Record<LanguageCode, string>;
  theme: string;
  soundEnabled: boolean;
  showKeyboard: boolean;
  difficulty: DifficultyLevel;
}

export interface KeyboardLayout {
  id: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: string;
  variant: string;
  keyMappings: KeyMapping[];
  metadata: LayoutMetadata;
  isCustom: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface KeyMapping {
  key: string;
  character: string;
  shiftCharacter?: string;
  altCharacter?: string;
  ctrlCharacter?: string;
  position: KeyPosition;
}

export interface KeyPosition {
  row: number;
  column: number;
  finger: string;
  hand: 'left' | 'right';
}

export interface LayoutMetadata {
  description: string;
  author: string;
  version: string;
  compatibility: string[];
  tags: string[];
  difficulty: DifficultyLevel;
  popularity: number;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: CompetitionType;
  status: CompetitionStatus;
  startDate: number;
  endDate: number;
  language: LanguageCode;
  textContent: string;
  requiredLayout?: string;
  maxParticipants?: number;
  prizeTiers: PrizeTier[];
  rules: CompetitionRules;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  userId: string;
  username: string;
  results: TypingResults;
  rank?: number;
  submittedAt: number;
}

export interface PrizeTier {
  position: number;
  description: string;
  value?: string;
}

export interface CompetitionRules {
  timeLimit: number;
  attemptsAllowed: number;
  layoutLocked: boolean;
  retakeAllowed: boolean;
}

export interface TypingStatistics {
  userId: string;
  language: LanguageCode;
  mode: TypingMode;
  totalTests: number;
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeTyped: number;
  improvementRate: number;
  lastUpdated: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  bestWPM: number;
  averageAccuracy: number;
  language: LanguageCode;
  mode: TypingMode;
  rank: number;
  lastImproved: number;
}

// Filters and query objects
export interface TestFilters {
  language?: LanguageCode;
  mode?: TypingMode;
  difficulty?: DifficultyLevel;
  dateFrom?: number;
  dateTo?: number;
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
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface CompetitionFilters {
  type?: CompetitionType;
  status?: CompetitionStatus;
  language?: LanguageCode;
  dateFrom?: number;
  dateTo?: number;
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

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences>;
  updateProfile(userId: string, profile: UserProfile): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

export interface ICompetitionRepository {
  findActive(): Promise<Competition[]>;
  findById(id: string): Promise<Competition | null>;
  save(competition: Competition): Promise<void>;
  getEntries(competitionId: string): Promise<CompetitionEntry[]>;
  submitEntry(entry: CompetitionEntry): Promise<void>;
  updateRankings(competitionId: string): Promise<void>;
  findByFilters(filters: CompetitionFilters): Promise<Competition[]>;
  deleteCompetition(id: string): Promise<void>;
}

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
  deleteCustomLayout(layoutId: string, userId: string): Promise<void>;
  getPopularLayouts(language: LanguageCode, limit?: number): Promise<KeyboardLayout[]>;
}

export interface IStatisticsRepository {
  getUserStatistics(userId: string, language?: LanguageCode, mode?: TypingMode): Promise<TypingStatistics[]>;
  updateStatistics(userId: string, testResult: TypingResults, language: LanguageCode, mode: TypingMode): Promise<void>;
  getGlobalStatistics(): Promise<Record<string, number>>;
  getUserRank(userId: string, language: LanguageCode, mode: TypingMode): Promise<number>;
}