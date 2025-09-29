import { LanguageCode } from "@/enums/site-config";
import { TypingMode, DifficultyLevel } from "../../domain/entities/typing";
import { ITypingRepository, LeaderboardFilters } from "../../domain/interfaces/repositories";
import { GetLeaderboardQueryDTO } from "../dto/queries.dto";
import { LeaderboardResponseDTO } from "../dto/statistics.dto";

export class GetLeaderboardUseCase {
  constructor(
    private typingRepository: ITypingRepository
  ) {}

  async execute(query: GetLeaderboardQueryDTO): Promise<LeaderboardResponseDTO> {
    const { 
      language, 
      mode, 
      difficulty, 
      layoutId, 
      timeRange = 'all-time', 
      limit = 20, 
      offset = 0 
    } = query;

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
        timeRange
      }
    };
  }

  async getGlobalLeaderboard(options: {
    category: 'wpm' | 'accuracy' | 'consistency' | 'improvement';
    timeRange: 'daily' | 'weekly' | 'monthly' | 'all-time';
    limit?: number;
  }): Promise<LeaderboardResponseDTO> {
    const { category, timeRange, limit = 50 } = options;

    // Get leaderboard based on the specified category
    const filters: LeaderboardFilters = {
      timeRange,
      limit
    };

    const entries = await this.typingRepository.getLeaderboard(filters);

    // Sort by the requested category
    const sortedEntries = this.sortByCategory(entries, category);

    const enrichedEntries = await this.enrichLeaderboardEntries(sortedEntries);

    return {
      entries: enrichedEntries,
      totalCount: sortedEntries.length,
      filters: {
        timeRange
      }
    };
  }

  async getUserRanking(userId: string, filters?: {
    language?: LanguageCode;
    mode?: TypingMode;
    layoutId?: string;
  }): Promise<{
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
      limit: 1 // Get the user's best test
    });

    if (userTests.length === 0) {
      return {
        globalRank: 0,
        totalUsers: 0,
        percentile: 0,
        nearbyUsers: []
      };
    }

    const userBestWpm = Math.max(...userTests.map(test => test.results.wpm));

    // 2. Get leaderboard to find user's ranking
    const leaderboard = await this.typingRepository.getLeaderboard({
      ...filters,
      timeRange: 'all-time',
      limit: 10000 // Large limit to get all users
    });

    // 3. Find user's rank
    const userRankIndex = leaderboard.findIndex(entry => entry.userId === userId);
    const globalRank = userRankIndex !== -1 ? userRankIndex + 1 : 0;

    // 4. Calculate percentile
    const percentile = leaderboard.length > 0 ? Math.round((1 - (globalRank / leaderboard.length)) * 100) : 0;

    // 5. Get nearby users (5 above and 5 below)
    const startIndex = Math.max(0, userRankIndex - 5);
    const endIndex = Math.min(leaderboard.length, userRankIndex + 6);
    const nearbyUsers = leaderboard.slice(startIndex, endIndex).map((entry, index) => ({
      rank: startIndex + index + 1,
      userId: entry.userId,
      username: entry.username,
      wpm: entry.bestWpm,
      accuracy: entry.bestAccuracy
    }));

    return {
      globalRank,
      totalUsers: leaderboard.length,
      percentile,
      nearbyUsers
    };
  }

  async getLanguageSpecificLeaderboards(): Promise<Array<{
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
  }> {
    const languages = [LanguageCode.EN, LanguageCode.LI, LanguageCode.MY];
    const results: Array<any> = [];

    for (const language of languages) {
      const leaderboard = await this.typingRepository.getLeaderboard({
        language,
        timeRange: 'all-time',
        limit: 10
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
          layoutName: entry.layoutName
        })),
        totalUsers: leaderboard.length
      });
    }

    return results;
  }

  private async enrichLeaderboardEntries(entries: any[]): Promise<Array<{
    userId: string;
    username: string;
    bestWpm: number;
    bestAccuracy: number;
    totalTests: number;
    language: LanguageCode;
    layoutId: string;
    layoutName: string;
    rank: number;
  }>> {
    return entries.map((entry, index) => ({
      userId: entry.userId,
      username: entry.username,
      bestWpm: entry.bestWpm,
      bestAccuracy: entry.bestAccuracy,
      totalTests: entry.totalTests || 0,
      language: entry.language,
      layoutId: entry.layoutId || 'unknown',
      layoutName: this.getLayoutDisplayName(entry.layoutId), // In real implementation, fetch from layout repository
      rank: index + 1
    }));
  }

  private sortByCategory(entries: any[], category: 'wpm' | 'accuracy' | 'consistency' | 'improvement'): any[] {
    switch (category) {
      case 'wpm':
        return entries.sort((a, b) => b.bestWpm - a.bestWpm);
      case 'accuracy':
        return entries.sort((a, b) => b.bestAccuracy - a.bestAccuracy);
      case 'consistency':
        // In real implementation, calculate consistency score
        return entries.sort((a, b) => (b.consistencyScore || 0) - (a.consistencyScore || 0));
      case 'improvement':
        // In real implementation, calculate improvement rate
        return entries.sort((a, b) => (b.improvementRate || 0) - (a.improvementRate || 0));
      default:
        return entries;
    }
  }

  private getLanguageName(language: LanguageCode): string {
    const names = {
      [LanguageCode.EN]: 'English',
      [LanguageCode.LI]: 'Lisu',
      [LanguageCode.MY]: 'Myanmar'
    };
    return names[language] || 'Unknown';
  }

  private getLayoutDisplayName(layoutId: string): string {
    // In a real implementation, this would fetch the layout name from the repository
    const commonLayouts: Record<string, string> = {
      'qwerty_us': 'QWERTY US',
      'qwerty_uk': 'QWERTY UK',
      'dvorak': 'Dvorak',
      'colemak': 'Colemak',
      'lisu_sil_basic': 'Lisu SIL Basic',
      'lisu_sil_standard': 'Lisu SIL Standard',
      'myanmar3': 'Myanmar3',
      'zawgyi': 'Zawgyi'
    };

    return commonLayouts[layoutId] || layoutId || 'Unknown';
  }
}