import { GetLeaderboardQuery } from "@/application";
import { GetLeaderboardQueryDTO } from "@/application/dto/queries.dto";
import { LeaderboardResponseDTO } from "@/application/dto/statistics.dto";
import { LanguageCode, TypingMode, TypingTest } from "@/domain";
import { LeaderboardEntry } from "@/domain/entities/statistics";
import { ITypingRepository, LeaderboardFilters } from "@/domain/interfaces/repositories";

export class GetLeaderboardUseCase {
  constructor(private typingRepository: ITypingRepository) {}

  async execute(query: GetLeaderboardQueryDTO): Promise<LeaderboardResponseDTO> {
    const { language, mode, difficulty, layoutId, timeRange = "all-time", limit = 20, offset = 0 } = query;

    // 1. Build leaderboard filters
    const filters: LeaderboardFilters = {
      ...(language && { language }),
      ...(mode && { mode }),
      ...(difficulty && { difficulty }),
      ...(layoutId && { layoutId }),
      timeRange,
      limit: limit + (offset || 0), // Get extra records for pagination
    };

    // 2. Get leaderboard entries
    const leaderboardEntries = await this.typingRepository.getLeaderboard(filters);

    // 3. Apply pagination
    const paginatedEntries = leaderboardEntries.slice(offset, offset + limit);

    // 4. Enrich entries with additional information
    const enrichedEntries = await this.enrichLeaderboardEntries(paginatedEntries);

    // 5. Calculate current user rank if requested
    let currentUserRank: number | undefined;
    // Note: In a real implementation, you'd pass the current user ID and calculate their rank

    return {
      entries: enrichedEntries,
      totalCount: leaderboardEntries.length,
      currentUserRank,
      filters: {
        language,
        mode,
        difficulty,
        layoutId,
        timeRange,
      },
    };
  }

  async getGlobalLeaderboard(options: {
    category: "wpm" | "accuracy" | "consistency" | "improvement";
    timeRange: "daily" | "weekly" | "monthly" | "all-time";
    limit?: number;
  }): Promise<LeaderboardResponseDTO> {
    const { category, timeRange, limit = 50 } = options;

    // Get leaderboard based on the specified category
    const filters: LeaderboardFilters = {
      timeRange,
      limit,
    };

    const entries = await this.typingRepository.getLeaderboard(filters);

    // Sort by the requested category
    const sortedEntries = this.sortByCategory(entries, category);

    const enrichedEntries = await this.enrichLeaderboardEntries(sortedEntries);

    return {
      entries: enrichedEntries,
      totalCount: sortedEntries.length,
      filters: {
        timeRange,
      },
    };
  }

  async getUserRanking(
    userId: string,
    filters?: {
      language?: LanguageCode;
      mode?: TypingMode;
      layoutId?: string;
    }
  ): Promise<{
    globalRank: number;
    totalUsers: number;
    percentile: number;
    nearbyUsers: Array<{
      rank: number;
      userId: string;
      username: string;
      wpm: number;
      accuracy: number;
    }>;
  }> {
    // 1. Get the user's best performance
    const userTests = await this.typingRepository.getUserTests(userId, {
      ...filters,
      limit: 1, // Get the user's best test
    });

    if (userTests.length === 0) {
      return {
        globalRank: 0,
        totalUsers: 0,
        percentile: 0,
        nearbyUsers: [],
      };
    }

    const userBestWpm = Math.max(...userTests.map((test) => test.results.wpm));

    // 2. Get leaderboard to find user's ranking
    const leaderboard = await this.typingRepository.getLeaderboard({
      ...filters,
      timeRange: "all-time",
      limit: 10000, // Large limit to get all users
    });

    // 3. Find user's rank
    const userRankIndex = leaderboard.findIndex((entry) => entry.userId === userId);
    const globalRank = userRankIndex !== -1 ? userRankIndex + 1 : 0;

    // 4. Calculate percentile
    const percentile = leaderboard.length > 0 ? Math.round((1 - globalRank / leaderboard.length) * 100) : 0;

    // 5. Get nearby users (5 above and 5 below)
    const startIndex = Math.max(0, userRankIndex - 5);
    const endIndex = Math.min(leaderboard.length, userRankIndex + 6);
    const nearbyUsers = leaderboard.slice(startIndex, endIndex).map((entry, index) => ({
      rank: startIndex + index + 1,
      userId: entry.userId,
      username: entry.username,
      wpm: entry.bestWPM,
      accuracy: entry.averageAccuracy,
    }));

    return {
      globalRank,
      totalUsers: leaderboard.length,
      percentile,
      nearbyUsers,
    };
  }

  async getLanguageSpecificLeaderboards(): Promise<
    Array<{
      language: LanguageCode;
      languageName: string;
      topUsers: Array<{
        rank: number;
        userId: string;
        username: string;
        wpm: number;
        accuracy: number;
        layoutName: string;
      }>;
      totalUsers: number;
    }>
  > {
    const languages = [LanguageCode.EN, LanguageCode.LI, LanguageCode.MY];
    const results: Array<any> = [];

    for (const language of languages) {
      const leaderboard = await this.typingRepository.getLeaderboard({
        language,
        timeRange: "all-time",
        limit: 10,
      });

      const enrichedEntries = await this.enrichLeaderboardEntries(leaderboard);

      results.push({
        language,
        languageName: this.getLanguageName(language),
        topUsers: enrichedEntries.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          username: entry.username,
          wpm: entry.bestWpm,
          accuracy: entry.bestAccuracy,
          layoutName: entry.layoutName,
        })),
        totalUsers: leaderboard.length,
      });
    }

    return results;
  }

  private async enrichLeaderboardEntries(entries: any[]): Promise<
    Array<{
      userId: string;
      username: string;
      bestWpm: number;
      bestAccuracy: number;
      totalTests: number;
      language: LanguageCode;
      layoutId: string;
      layoutName: string;
      rank: number;
    }>
  > {
    return entries.map((entry, index) => ({
      userId: entry.userId,
      username: entry.username,
      bestWpm: entry.bestWpm,
      bestAccuracy: entry.bestAccuracy,
      totalTests: entry.totalTests || 0,
      language: entry.language,
      layoutId: entry.layoutId || "unknown",
      layoutName: this.getLayoutDisplayName(entry.layoutId), // In real implementation, fetch from layout repository
      rank: index + 1,
    }));
  }

  private sortByCategory(entries: any[], category: "wpm" | "accuracy" | "consistency" | "improvement"): any[] {
    switch (category) {
      case "wpm":
        return entries.sort((a, b) => b.bestWpm - a.bestWpm);
      case "accuracy":
        return entries.sort((a, b) => b.bestAccuracy - a.bestAccuracy);
      case "consistency":
        // In real implementation, calculate consistency score
        return entries.sort((a, b) => (b.consistencyScore || 0) - (a.consistencyScore || 0));
      case "improvement":
        // In real implementation, calculate improvement rate
        return entries.sort((a, b) => (b.improvementRate || 0) - (a.improvementRate || 0));
      default:
        return entries;
    }
  }

  private getLanguageName(language: LanguageCode): string {
    const names = {
      [LanguageCode.EN]: "English",
      [LanguageCode.LI]: "Lisu",
      [LanguageCode.MY]: "Myanmar",
    };
    return names[language] || "Unknown";
  }

  private getLayoutDisplayName(layoutId: string): string {
    // In a real implementation, this would fetch the layout name from the repository
    const commonLayouts: Record<string, string> = {
      qwerty_us: "QWERTY US",
      lisu_sil_basic: "Lisu SIL Basic",
      lisu_sil_standard: "Lisu SIL Standard",
      myanmar3: "Myanmar3",
      zawgyi: "Zawgyi",
    };

    return commonLayouts[layoutId] || layoutId || "Unknown";
  }
  private buildLeaderboardFilters(language?: string, mode?: string, keyboardLayout?: string, timeRange?: string) {
    const filters: Record<string, any> = {};

    if (language) {
      filters.language = language;
    }

    if (mode) {
      filters.mode = mode;
    }

    if (keyboardLayout) {
      filters.keyboardLayout = keyboardLayout;
    }

    if (timeRange && timeRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "day":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      filters.startDate = startDate;
    }

    return filters;
  }

  private processLeaderboardEntries(entries: LeaderboardEntry[], offset: number) {
    return entries.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.userId,
      username: entry.username,
      wpm: Math.round(entry.wpm),
      accuracy: Math.round(entry.accuracy * 100) / 100,
      language: entry.language,
      keyboardLayout: entry.keyboardLayout,
      timestamp: entry.timestamp,
      mode: entry.mode,
    }));
  }

  private async getTotalEntriesCount(filters: Record<string, any>): Promise<number> {
    // In a real implementation, this would be a separate repository method
    // For now, return a reasonable estimate
    const entries = await this.typingRepository.getLeaderboard({
      ...filters,
      limit: 10000, // Get a large number to estimate total
    });

    return entries.length;
  }

  // Helper method to get leaderboard for specific user context
  async getLeaderboardWithUserRank(query: GetLeaderboardQuery & { userId?: string }): Promise<LeaderboardResponseDTO> {
    const baseResult = await this.execute(query);

    if (!query.userId) {
      return baseResult;
    }

    // Calculate user's rank
    const userRank = await this.calculateUserRank(query.userId, query);

    return {
      ...baseResult,
      currentUserRank: userRank,
    };
  }

  private async calculateUserRank(userId: string, query: GetLeaderboardQuery): Promise<number | undefined> {
    try {
      // Get all entries better than user's best score
      const filters = this.buildLeaderboardFilters(query.language, query.mode, query.layoutId, query.timeRange);

      // Get user's best score
      const userTests = await this.typingRepository.getUserTests(userId, {
        ...filters,
        limit: 1,
      });

      if (userTests.length === 0) {
        return undefined;
      }

      const userBestWPM = Math.max(...userTests.map((test) => test.results.wpm));

      // Count entries with better WPM
      const allEntries = await this.typingRepository.getLeaderboard({
        ...filters,
        limit: 10000,
      });

      const betterEntries = allEntries.filter((entry) => entry.wpm > userBestWPM);

      return betterEntries.length + 1;
    } catch (error) {
      console.error("Error calculating user rank:", error);
      return undefined;
    }
  }

  // Method to get leaderboard for a specific time period with more detailed stats
  async getDetailedLeaderboard(query: GetLeaderboardQuery) {
    const baseResult = await this.execute(query);

    // Add additional statistics for each entry
    const enhancedEntries = await Promise.all(
      baseResult.entries.map(async (entry) => {
        try {
          // Get additional stats for this user
          const userTests = await this.typingRepository.getUserTests(entry.userId, {
            language: query.language,
            mode: query.mode,
            limit: 100,
          });

          const additionalStats = this.calculateAdditionalStats(userTests);

          return {
            ...entry,
            totalTests: userTests.length,
            averageWPM: additionalStats.averageWPM,
            consistencyScore: additionalStats.consistencyScore,
            recentActivity: additionalStats.recentActivity,
          };
        } catch (_error) {
          // Return basic entry if additional stats fail
          return entry;
        }
      })
    );

    return {
      ...baseResult,
      entries: enhancedEntries,
    };
  }

  private calculateAdditionalStats(tests: TypingTest[]) {
    if (tests.length === 0) {
      return {
        averageWPM: 0,
        consistencyScore: 0,
        recentActivity: false,
      };
    }

    const averageWPM = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;

    // Calculate consistency (coefficient of variation)
    const wpmValues = tests.map((test) => test.results.wpm);
    const mean = averageWPM;
    const variance = wpmValues.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmValues.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = mean > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 0;

    // Check recent activity (within last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = tests.some((test) => test.timestamp > sevenDaysAgo);

    return {
      averageWPM: Math.round(averageWPM),
      consistencyScore: Math.round(consistencyScore),
      recentActivity,
    };
  }
}
