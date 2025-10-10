/**
 * Mock implementation of IStatisticsRepository for development and testing
 */

import { LanguageCode } from "@/domain/enums/languages";
import { TypingMode } from "@/domain/enums/typing-mode";
import { TypingStatistics } from "../../../domain/entities/statistics";
import { TypingResults } from "../../../domain/entities/typing";
import { IStatisticsRepository } from "../../../domain/interfaces/repositories";

export class MockStatisticsRepository implements IStatisticsRepository {
  private statistics: Map<string, TypingStatistics[]> = new Map();
  private globalStats: Map<string, number> = new Map();

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock statistics for test user
    const testUserStats = [
      TypingStatistics.create({
        userId: "user1",
        language: LanguageCode.EN,
        mode: TypingMode.NORMAL,
        totalTests: 45,
        averageWPM: 58,
        bestWPM: 65,
        worstWPM: 25,
        averageAccuracy: 96.5,
        bestAccuracy: 100,
        worstAccuracy: 85,
        totalTimeTyped: 3600,
        totalCharactersTyped: 25000,
        totalErrors: 150,
        improvementRate: 2.5,
        consistencyScore: 85,
        preferredTimeOfDay: 14,
        streak: 7,
        longestStreak: 14,
        performanceTrends: [],
        lastUpdated: Date.now(),
      }),
    ];

    this.statistics.set("user1", testUserStats);

    // Global statistics
    this.globalStats.set("totalUsers", 1250);
    this.globalStats.set("totalTests", 45780);
    this.globalStats.set("averageWPM", 42.3);
    this.globalStats.set("averageAccuracy", 92.8);
    this.globalStats.set("totalTimeTyped", 892000);
  }

  async getUserStatistics(
    userId: string,
    language?: LanguageCode,
    mode?: TypingMode
  ): Promise<TypingStatistics[]> {
    const userStats = this.statistics.get(userId) || [];

    // Filter by language and mode if specified
    return userStats.filter((stat) => {
      const languageMatch = !language || stat.language === language;
      const modeMatch = !mode || stat.mode === mode;
      return languageMatch && modeMatch;
    });
  }

  async updateStatistics(
    userId: string,
    testResult: TypingResults,
    language: LanguageCode,
    mode: TypingMode
  ): Promise<void> {
    const userStats = this.statistics.get(userId) || [];

    // Find existing statistics for this language and mode
    const existingStatIndex = userStats.findIndex(
      (stat) => stat.language === language && stat.mode === mode
    );

    if (existingStatIndex >= 0) {
      // Update existing statistics
      const existingStat = userStats[existingStatIndex];
      const updatedStats = this.calculateUpdatedStatistics(
        existingStat,
        testResult
      );
      userStats[existingStatIndex] = updatedStats;
    } else {
      // Create new statistics entry
      const newStats = TypingStatistics.create({
        userId,
        language,
        mode,
        totalTests: 1,
        averageWPM: testResult.wpm,
        bestWPM: testResult.wpm,
        worstWPM: testResult.wpm,
        averageAccuracy: testResult.accuracy,
        bestAccuracy: testResult.accuracy,
        worstAccuracy: testResult.accuracy,
        totalTimeTyped: testResult.duration,
        totalCharactersTyped: testResult.charactersTyped,
        totalErrors: testResult.errors,
        improvementRate: 0,
        consistencyScore: 100, // Start with perfect consistency for first test
        preferredTimeOfDay: new Date().getHours(),
        streak: 1,
        longestStreak: 1,
        performanceTrends: [],
        lastUpdated: Date.now(),
      });
      userStats.push(newStats);
    }

    this.statistics.set(userId, userStats);
  }

  private calculateUpdatedStatistics(
    existing: TypingStatistics,
    newResult: TypingResults
  ): TypingStatistics {
    const totalTests = existing.totalTests + 1;

    // Calculate running averages
    const totalWPM = existing.averageWPM * existing.totalTests + newResult.wpm;
    const averageWPM = totalWPM / totalTests;

    const totalAccuracy =
      existing.averageAccuracy * existing.totalTests + newResult.accuracy;
    const averageAccuracy = totalAccuracy / totalTests;

    // Update best/worst
    const bestWPM = Math.max(existing.bestWPM, newResult.wpm);
    const worstWPM = Math.min(existing.worstWPM, newResult.wpm);
    const bestAccuracy = Math.max(existing.bestAccuracy, newResult.accuracy);
    const worstAccuracy = Math.min(existing.worstAccuracy, newResult.accuracy);

    // Calculate improvement rate (simple linear trend)
    const improvementRate =
      existing.totalTests > 1
        ? (newResult.wpm - existing.worstWPM) / existing.totalTests
        : 0;

    // Simple consistency calculation (based on variance from average)
    const wpmVariance = Math.abs(newResult.wpm - averageWPM);
    const consistencyScore = Math.max(0, 100 - wpmVariance * 2);

    return TypingStatistics.create({
      userId: existing.userId,
      language: existing.language,
      mode: existing.mode,
      totalTests,
      averageWPM,
      bestWPM,
      worstWPM,
      averageAccuracy,
      bestAccuracy,
      worstAccuracy,
      totalTimeTyped: existing.totalTimeTyped + newResult.duration,
      totalCharactersTyped:
        existing.totalCharactersTyped + newResult.charactersTyped,
      totalErrors: existing.totalErrors + newResult.errors,
      improvementRate,
      consistencyScore,
      preferredTimeOfDay: existing.preferredTimeOfDay,
      streak: newResult.accuracy > 85 ? existing.streak + 1 : 0, // Reset streak if accuracy drops
      longestStreak: Math.max(existing.longestStreak, existing.streak + 1),
      performanceTrends: existing.performanceTrends,
      lastUpdated: Date.now(),
    });
  }

  async getGlobalStatistics(): Promise<Record<string, number>> {
    return Object.fromEntries(this.globalStats);
  }

  async getUserRank(
    userId: string,
    language: LanguageCode,
    mode: TypingMode
  ): Promise<number> {
    // Simple mock ranking - in real implementation, this would compare across all users
    const userStats = await this.getUserStatistics(userId, language, mode);
    if (userStats.length === 0) return 0;

    const stat = userStats[0];

    // Mock ranking based on WPM
    if (stat.averageWPM > 80) return Math.floor(Math.random() * 100) + 1; // Top 100
    if (stat.averageWPM > 60) return Math.floor(Math.random() * 500) + 100; // Top 600
    if (stat.averageWPM > 40) return Math.floor(Math.random() * 1000) + 600; // Top 1600
    return Math.floor(Math.random() * 5000) + 1600; // Below 1600
  }
}
