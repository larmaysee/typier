/**
 * Mock implementation of ITypingRepository for development and testing
 */

import { LeaderboardEntry } from "@/domain/entities/statistics";
import { TypingTest } from "@/domain/entities/typing";
import { LanguageCode } from "@/domain/enums/languages";
import { TypingMode } from "@/domain/enums/typing-mode";
import { ITypingRepository, LeaderboardFilters, TestFilters } from "@/domain/interfaces/repositories";

export class MockTypingRepository implements ITypingRepository {
  private tests: Map<string, TypingTest> = new Map();

  async save(test: TypingTest): Promise<void> {
    this.tests.set(test.id, test);
  }

  async findById(id: string): Promise<TypingTest | null> {
    return this.tests.get(id) || null;
  }

  async getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]> {
    const userTests = Array.from(this.tests.values()).filter((test) => test.userId === userId);

    if (!filters) return userTests;

    return userTests.filter((test) => {
      if (filters.language && test.language !== filters.language) return false;
      if (filters.mode && test.mode !== filters.mode) return false;
      if (filters.difficulty && test.difficulty !== filters.difficulty) return false;
      if (filters.layoutId && test.keyboardLayout !== filters.layoutId) return false;
      if (filters.dateFrom && test.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && test.timestamp > filters.dateTo) return false;
      return true;
    });
  }

  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    // Mock leaderboard implementation
    const entries = [
      LeaderboardEntry.create({
        userId: "user1",
        username: "TestUser1",
        displayName: "Test User 1",
        bestWPM: 65,
        averageAccuracy: 96.5,
        language: filters.language || LanguageCode.EN,
        mode: filters.mode || TypingMode.NORMAL,
        rank: 1,
        totalTests: 45,
        lastImproved: Date.now() - 86400000, // 1 day ago
        isVerified: true,
        achievementBadges: ["speed_demon", "accuracy_master"],
      }),
      LeaderboardEntry.create({
        userId: "user2",
        username: "TestUser2",
        displayName: "Test User 2",
        bestWPM: 58,
        averageAccuracy: 94.2,
        language: filters.language || LanguageCode.EN,
        mode: filters.mode || TypingMode.NORMAL,
        rank: 2,
        totalTests: 32,
        lastImproved: Date.now() - 172800000, // 2 days ago
        isVerified: false,
        achievementBadges: ["consistent_typer"],
      }),
    ];

    return entries;
  }

  async getCompetitionEntries(competitionId: string): Promise<TypingTest[]> {
    return Array.from(this.tests.values()).filter((test) => test.competitionId === competitionId);
  }

  async bulkSave(tests: TypingTest[]): Promise<void> {
    tests.forEach((test) => this.tests.set(test.id, test));
  }

  async deleteTest(id: string): Promise<void> {
    this.tests.delete(id);
  }
}
