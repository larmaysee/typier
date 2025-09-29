import { LeaderboardEntry } from '@/domain/entities/user';
import { TypingTest } from '@/domain/entities/typing';
import { ITypingRepository } from '@/domain/interfaces/repositories';
import { GetLeaderboardQuery } from '@/application/queries/typing.queries';
import { LeaderboardDto } from '@/application/dto/statistics.dto';

export class GetLeaderboardUseCase {
  constructor(
    private typingRepository: ITypingRepository
  ) {}

  async execute(query: GetLeaderboardQuery): Promise<LeaderboardDto> {
    const { language, mode, keyboardLayout, timeRange = 'all', limit = 50, offset = 0 } = query;

    // 1. Build filters for leaderboard query
    const filters = this.buildLeaderboardFilters(language, mode, keyboardLayout, timeRange);

    // 2. Get leaderboard entries
    const entries = await this.typingRepository.getLeaderboard({
      ...filters,
      limit: limit + 1, // Get one extra to check if there are more entries
      offset
    });

    // 3. Process entries and add rankings
    const processedEntries = this.processLeaderboardEntries(entries.slice(0, limit), offset);

    // 4. Get user's rank if applicable (would need userId in query for this)
    const userRank = undefined; // TODO: Implement user rank calculation

    // 5. Calculate total entries count
    const totalEntries = await this.getTotalEntriesCount(filters);

    return {
      entries: processedEntries,
      userRank,
      totalEntries,
      filters: {
        language,
        mode,
        keyboardLayout,
        timeRange
      }
    };
  }

  private buildLeaderboardFilters(
    language?: string,
    mode?: string,
    keyboardLayout?: string,
    timeRange?: string
  ) {
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

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
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
      mode: entry.mode
    }));
  }

  private async getTotalEntriesCount(filters: Record<string, any>): Promise<number> {
    // In a real implementation, this would be a separate repository method
    // For now, return a reasonable estimate
    const entries = await this.typingRepository.getLeaderboard({
      ...filters,
      limit: 10000 // Get a large number to estimate total
    });
    
    return entries.length;
  }

  // Helper method to get leaderboard for specific user context
  async getLeaderboardWithUserRank(query: GetLeaderboardQuery & { userId?: string }): Promise<LeaderboardDto> {
    const baseResult = await this.execute(query);
    
    if (!query.userId) {
      return baseResult;
    }

    // Calculate user's rank
    const userRank = await this.calculateUserRank(query.userId, query);
    
    return {
      ...baseResult,
      userRank
    };
  }

  private async calculateUserRank(userId: string, query: GetLeaderboardQuery): Promise<number | undefined> {
    try {
      // Get all entries better than user's best score
      const filters = this.buildLeaderboardFilters(
        query.language, 
        query.mode, 
        query.keyboardLayout, 
        query.timeRange
      );

      // Get user's best score
      const userTests = await this.typingRepository.getUserTests(userId, {
        ...filters,
        limit: 1
      });

      if (userTests.length === 0) {
        return undefined;
      }

      const userBestWPM = Math.max(...userTests.map(test => test.results.wpm));

      // Count entries with better WPM
      const allEntries = await this.typingRepository.getLeaderboard({
        ...filters,
        limit: 10000
      });

      const betterEntries = allEntries.filter(entry => entry.wpm > userBestWPM);
      
      return betterEntries.length + 1;
    } catch (error) {
      console.error('Error calculating user rank:', error);
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
            limit: 100
          });

          const additionalStats = this.calculateAdditionalStats(userTests);
          
          return {
            ...entry,
            totalTests: userTests.length,
            averageWPM: additionalStats.averageWPM,
            consistencyScore: additionalStats.consistencyScore,
            recentActivity: additionalStats.recentActivity
          };
        } catch (_error) {
          // Return basic entry if additional stats fail
          return entry;
        }
      })
    );

    return {
      ...baseResult,
      entries: enhancedEntries
    };
  }

  private calculateAdditionalStats(tests: TypingTest[]) {
    if (tests.length === 0) {
      return {
        averageWPM: 0,
        consistencyScore: 0,
        recentActivity: false
      };
    }

    const averageWPM = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    
    // Calculate consistency (coefficient of variation)
    const wpmValues = tests.map(test => test.results.wpm);
    const mean = averageWPM;
    const variance = wpmValues.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmValues.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = mean > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 0;

    // Check recent activity (within last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity = tests.some(test => test.timestamp > sevenDaysAgo);

    return {
      averageWPM: Math.round(averageWPM),
      consistencyScore: Math.round(consistencyScore),
      recentActivity
    };
  }
}