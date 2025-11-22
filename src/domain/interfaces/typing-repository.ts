import { LanguageCode } from "@/domain";
import { TypingTest } from "../entities";
import { LeaderboardEntry } from "../entities/statistics";

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
  timeFrame?: "day" | "week" | "month" | "all";
  duration?: number; // Test duration in seconds (15, 30, 60, 120, etc.)
  limit?: number;
}

export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  getCompetitionEntries(competitionId: string): Promise<TypingTest[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
  deleteUserTest(userId: string, testId: string): Promise<void>;
}
