import {
  ITypingRepository,
  TestFilters,
  LeaderboardFilters,
} from "@/domain/interfaces";
import { TypingTest } from "@/domain/entities";
import { RepositoryError, NotFoundError } from "@/shared/errors";
import { LocalStorageClient } from "../../persistence/local-storage/storage-client";
import type { ILogger } from "@/shared/utils/logger";
import { LeaderboardEntry } from "@/domain/entities/statistics";

// Using TypingTest directly for localStorage implementation

export class LocalTypingRepository implements ITypingRepository {
  private readonly TESTS_KEY_PREFIX = 'typing_tests';
  private readonly USER_TESTS_KEY_PREFIX = 'user_tests';
  private readonly LEADERBOARD_KEY = 'leaderboard_cache';

  constructor(
    private storage: LocalStorageClient,
    private logger: ILogger
  ) { }

  async save(test: TypingTest): Promise<void> {
    try {
      // Save individual test
      await this.storage.setItem(`${this.TESTS_KEY_PREFIX}:${test.id}`, test);

      // Update user's test list
      await this.addToUserTestList(test.userId, test.id);

      // Update leaderboard cache if not practice mode
      if (test.mode !== 'practice') {
        await this.updateLeaderboardCache(test);
      }

      this.logger.info(`Saved typing test to localStorage: ${test.id}`);
    } catch (error) {
      this.logger.error('Failed to save typing test to localStorage', error as Error);
      throw new RepositoryError('Failed to save typing test', error as Error);
    }
  }

  async getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]> {
    try {
      const testIds = await this.getUserTestIds(userId);
      const tests: TypingTest[] = [];

      for (const testId of testIds) {
        const test = await this.storage.getItem<TypingTest>(`${this.TESTS_KEY_PREFIX}:${testId}`);
        if (test) {
          tests.push(test);
        }
      }

      let filteredTests = tests;

      if (filters) {
        filteredTests = tests.filter(test => {
          if (filters.mode && test.mode !== filters.mode) return false;
          if (filters.language && test.language !== filters.language) return false;
          if (filters.difficulty && test.difficulty !== filters.difficulty) return false;
          if (filters.dateFrom && test.timestamp < filters.dateFrom) return false;
          if (filters.dateTo && test.timestamp > filters.dateTo) return false;
          return true;
        });
      }

      // Sort by timestamp (most recent first)
      filteredTests.sort((a, b) => b.timestamp - a.timestamp);

      // Apply pagination
      if (filters?.offset || filters?.limit) {
        const start = filters.offset || 0;
        const end = filters.limit ? start + filters.limit : undefined;
        filteredTests = filteredTests.slice(start, end);
      }

      return filteredTests;
    } catch (error) {
      this.logger.error(`Failed to get tests for user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to get user tests', error as Error);
    }
  }

  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    try {
      // Get all test IDs from cache or scan all tests
      const leaderboardCache = await this.storage.getItem<Record<string, LeaderboardEntry>>(this.LEADERBOARD_KEY) || {};

      let entries = Object.values(leaderboardCache);

      // Apply filters
      if (filters.language || filters.mode || filters.timeFrame) {
        // For more complex filtering, we might need to scan all tests
        // This is a simplified implementation
        entries = await this.buildLeaderboardFromAllTests(filters);
      }

      // Apply time frame filtering
      if (filters.timeFrame && filters.timeFrame !== 'all') {
        const now = Date.now();
        let cutoffTime: number;

        switch (filters.timeFrame) {
          case 'day':
            cutoffTime = now - 24 * 60 * 60 * 1000;
            break;
          case 'week':
            cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
            break;
          case 'month':
            cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
            break;
          default:
            cutoffTime = 0;
        }

        entries = entries.filter(entry => (entry.timestamp || entry.lastImproved) >= cutoffTime);
      }

      // Sort by WPM descending
      entries.sort((a, b) => b.bestWPM - a.bestWPM);

      // Apply limit
      const limit = filters.limit || 100;
      return entries.slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get leaderboard from localStorage', error as Error);
      throw new RepositoryError('Failed to get leaderboard', error as Error);
    }
  }

  async getCompetitionEntries(competitionId: string): Promise<TypingTest[]> {
    try {
      const allKeys = await this.storage.getAllKeys();
      const testKeys = allKeys.filter(key => key.startsWith(this.TESTS_KEY_PREFIX));
      const competitionTests: TypingTest[] = [];

      for (const key of testKeys) {
        const test = await this.storage.getItem<TypingTest>(key);
        if (test && test.competitionId === competitionId) {
          competitionTests.push(test);
        }
      }

      // Sort by WPM descending
      competitionTests.sort((a, b) => b.results.wpm - a.results.wpm);

      return competitionTests;
    } catch (error) {
      this.logger.error(`Failed to get competition entries: ${competitionId}`, error as Error);
      throw new RepositoryError('Failed to get competition entries', error as Error);
    }
  }

  async bulkSave(tests: TypingTest[]): Promise<void> {
    try {
      for (const test of tests) {
        await this.save(test);
      }
      this.logger.info(`Bulk saved ${tests.length} typing tests to localStorage`);
    } catch (error) {
      this.logger.error('Failed to bulk save typing tests to localStorage', error as Error);
      throw new RepositoryError('Failed to bulk save typing tests', error as Error);
    }
  }

  async deleteUserTest(userId: string, testId: string): Promise<void> {
    try {
      // Verify the test exists and belongs to the user
      const test = await this.storage.getItem<TypingTest>(`${this.TESTS_KEY_PREFIX}:${testId}`);

      if (!test) {
        throw new NotFoundError(`Typing test not found: ${testId}`);
      }

      if (test.userId !== userId) {
        throw new RepositoryError('User does not have permission to delete this test');
      }

      // Remove from storage
      await this.storage.removeItem(`${this.TESTS_KEY_PREFIX}:${testId}`);

      // Remove from user's test list
      await this.removeFromUserTestList(userId, testId);

      // Update leaderboard cache
      await this.removeFromLeaderboardCache(userId, testId);

      this.logger.info(`Deleted typing test from localStorage: ${testId}`);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof RepositoryError) {
        throw error;
      }
      this.logger.error(`Failed to delete typing test: ${testId}`, error as Error);
      throw new RepositoryError('Failed to delete typing test', error as Error);
    }
  }

  private async getUserTestIds(userId: string): Promise<string[]> {
    const testIds = await this.storage.getItem<string[]>(`${this.USER_TESTS_KEY_PREFIX}:${userId}`);
    return testIds || [];
  }

  private async addToUserTestList(userId: string, testId: string): Promise<void> {
    const testIds = await this.getUserTestIds(userId);
    if (!testIds.includes(testId)) {
      testIds.push(testId);
      await this.storage.setItem(`${this.USER_TESTS_KEY_PREFIX}:${userId}`, testIds);
    }
  }

  private async removeFromUserTestList(userId: string, testId: string): Promise<void> {
    const testIds = await this.getUserTestIds(userId);
    const updatedIds = testIds.filter(id => id !== testId);
    await this.storage.setItem(`${this.USER_TESTS_KEY_PREFIX}:${userId}`, updatedIds);
  }

  private async updateLeaderboardCache(test: TypingTest): Promise<void> {
    const cache = await this.storage.getItem<Record<string, LeaderboardEntry>>(this.LEADERBOARD_KEY) || {};

    const entry = LeaderboardEntry.create({
      userId: test.userId,
      username: await this.getUsernameById(test.userId),
      bestWPM: test.results.wpm,
      averageAccuracy: test.results.accuracy,
      language: test.language,
      mode: test.mode,
      rank: 1, // Will be updated when sorting
      totalTests: 1, // Simplified
      lastImproved: test.timestamp,
      timestamp: test.timestamp
    });

    // Only update if this is better than the user's current best
    const existing = cache[test.userId];
    if (!existing || test.results.wpm > existing.wpm) {
      cache[test.userId] = entry;
      await this.storage.setItem(this.LEADERBOARD_KEY, cache);
    }
  }

  private async removeFromLeaderboardCache(userId: string, _testId: string): Promise<void> {
    const cache = await this.storage.getItem<Record<string, LeaderboardEntry>>(this.LEADERBOARD_KEY) || {};

    if (cache[userId]) {
      // We need to recalculate the user's best score
      const userTests = await this.getUserTests(userId);
      const nonPracticeTests = userTests.filter(test => test.mode !== 'practice');

      if (nonPracticeTests.length > 0) {
        const bestTest = nonPracticeTests.reduce((best, test) =>
          test.results.wpm > best.results.wpm ? test : best
        );

        cache[userId] = LeaderboardEntry.create({
          userId,
          username: await this.getUsernameById(userId),
          bestWPM: bestTest.results.wpm,
          averageAccuracy: bestTest.results.accuracy,
          language: bestTest.language,
          mode: bestTest.mode,
          rank: 1,
          totalTests: 1,
          lastImproved: bestTest.timestamp,
          timestamp: bestTest.timestamp
        });
      } else {
        delete cache[userId];
      }

      await this.storage.setItem(this.LEADERBOARD_KEY, cache);
    }
  }

  private async buildLeaderboardFromAllTests(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    const allKeys = await this.storage.getAllKeys();
    const testKeys = allKeys.filter(key => key.startsWith(this.TESTS_KEY_PREFIX));
    const userBestScores = new Map<string, LeaderboardEntry>();

    for (const key of testKeys) {
      const test = await this.storage.getItem<TypingTest>(key);
      if (!test || test.mode === 'practice') continue;

      // Apply filters
      if (filters.language && test.language !== filters.language) continue;
      if (filters.mode && test.mode !== filters.mode) continue;

      const existing = userBestScores.get(test.userId);
      if (!existing || test.results.wpm > existing.wpm) {
        userBestScores.set(test.userId, LeaderboardEntry.create({
          userId: test.userId,
          username: await this.getUsernameById(test.userId),
          bestWPM: test.results.wpm,
          averageAccuracy: test.results.accuracy,
          language: test.language,
          mode: test.mode,
          rank: 1,
          totalTests: 1,
          lastImproved: test.timestamp,
          timestamp: test.timestamp
        }));
      }
    }

    return Array.from(userBestScores.values());
  }

  private async getUsernameById(userId: string): Promise<string> {
    try {
      // Try to get username from a user cache or return a fallback
      // This is a simplified implementation
      return `User-${userId.substring(0, 8)}`;
    } catch {
      return 'Anonymous';
    }
  }
}