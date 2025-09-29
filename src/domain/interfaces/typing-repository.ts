import { LanguageCode } from "@/enums/site-config";
import { TypingTest } from "../entities";

export interface TestFilters {
  mode?: string;
  language?: LanguageCode;
  difficulty?: string;
  limit?: number;
  offset?: number;
  dateFrom?: number;
  dateTo?: number;
}

export interface LeaderboardFilters {
  language?: LanguageCode;
  mode?: string;
  timeFrame?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  testDate: number;
}

export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  getCompetitionEntries(competitionId: string): Promise<TypingTest[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
  deleteUserTest(userId: string, testId: string): Promise<void>;
}