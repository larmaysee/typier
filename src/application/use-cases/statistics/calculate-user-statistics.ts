import { LanguageStatistics, LayoutStatistics } from '@/domain/entities/user';
import { TypingTest } from '@/domain/entities/typing';
import { IUserRepository, ITypingRepository } from '@/domain/interfaces/repositories';
import { GetUserStatsQuery } from '@/application/queries/typing.queries';
import { UserStatisticsDto } from '@/application/dto/statistics.dto';

export class CalculateUserStatisticsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private typingRepository: ITypingRepository
  ) {}

  async execute(query: GetUserStatsQuery): Promise<UserStatisticsDto> {
    const { userId, timeRange, language, layoutId } = query;

    // 1. Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 2. Get typing tests based on filters
    const tests = await this.getFilteredTests(userId, timeRange, language, layoutId);

    if (tests.length === 0) {
      return this.createEmptyStatistics(userId);
    }

    // 3. Calculate overall statistics
    const overallStats = this.calculateOverallStatistics(tests);

    // 4. Calculate language breakdown
    const languageBreakdown = this.calculateLanguageBreakdown(tests);

    // 5. Calculate layout breakdown
    const layoutBreakdown = this.calculateLayoutBreakdown(tests);

    // 6. Calculate improvement trends
    const improvementTrend = this.calculateImprovementTrend(tests);

    return {
      userId,
      totalTests: tests.length,
      bestWPM: overallStats.bestWPM,
      averageWPM: overallStats.averageWPM,
      averageAccuracy: overallStats.averageAccuracy,
      totalTimeTyped: overallStats.totalTimeTyped,
      improvementTrend,
      languageBreakdown,
      layoutBreakdown
    };
  }

  private async getFilteredTests(
    userId: string, 
    timeRange?: string, 
    language?: string, 
    layoutId?: string
  ): Promise<TypingTest[]> {
    const filters: Record<string, any> = {
      limit: 1000 // Get enough data for meaningful statistics
    };

    if (language) {
      filters.language = language;
    }

    if (timeRange) {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      filters.startDate = startDate;
    }

    const tests = await this.typingRepository.getUserTests(userId, filters);

    // Apply layout filter if specified
    if (layoutId) {
      return tests.filter(test => test.keyboardLayout === layoutId);
    }

    return tests;
  }

  private calculateOverallStatistics(tests: TypingTest[]) {
    const bestWPM = Math.max(...tests.map(t => t.results.wpm));
    const averageWPM = tests.reduce((sum, t) => sum + t.results.wpm, 0) / tests.length;
    const averageAccuracy = tests.reduce((sum, t) => sum + t.results.accuracy, 0) / tests.length;
    const totalTimeTyped = tests.reduce((sum, t) => sum + t.results.duration, 0);

    return {
      bestWPM: Math.round(bestWPM),
      averageWPM: Math.round(averageWPM),
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalTimeTyped
    };
  }

  private calculateLanguageBreakdown(tests: TypingTest[]) {
    const languageMap = new Map();

    for (const test of tests) {
      if (!languageMap.has(test.language)) {
        languageMap.set(test.language, []);
      }
      languageMap.get(test.language).push(test);
    }

    const breakdown = [];
    for (const [language, languageTests] of languageMap) {
      const stats = this.calculateLanguageStatistics(languageTests);
      breakdown.push({
        language,
        testsCompleted: languageTests.length,
        bestWPM: stats.bestWPM,
        averageWPM: stats.averageWPM,
        averageAccuracy: stats.averageAccuracy
      });
    }

    return breakdown.sort((a, b) => b.testsCompleted - a.testsCompleted);
  }

  private calculateLayoutBreakdown(tests: TypingTest[]) {
    const layoutMap = new Map();

    for (const test of tests) {
      if (!layoutMap.has(test.keyboardLayout)) {
        layoutMap.set(test.keyboardLayout, []);
      }
      layoutMap.get(test.keyboardLayout).push(test);
    }

    const breakdown = [];
    for (const [layoutId, layoutTests] of layoutMap) {
      const stats = this.calculateLayoutStatistics(layoutTests);
      const errorPatterns = this.analyzeErrorPatterns(layoutTests);

      breakdown.push({
        layoutId,
        layoutName: this.getLayoutDisplayName(layoutId),
        testsCompleted: layoutTests.length,
        bestWPM: stats.bestWPM,
        averageWPM: stats.averageWPM,
        averageAccuracy: stats.averageAccuracy,
        errorPatterns
      });
    }

    return breakdown.sort((a, b) => b.testsCompleted - a.testsCompleted);
  }

  private calculateImprovementTrend(tests: TypingTest[]) {
    if (tests.length < 2) {
      return {
        wpmTrend: 0,
        accuracyTrend: 0,
        consistencyScore: 0
      };
    }

    // Sort tests by timestamp
    const sortedTests = tests.sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate trends using linear regression
    const wpmTrend = this.calculateTrend(sortedTests.map(t => t.results.wpm));
    const accuracyTrend = this.calculateTrend(sortedTests.map(t => t.results.accuracy));
    
    // Calculate consistency score (inverse of coefficient of variation)
    const wpmValues = sortedTests.map(t => t.results.wpm);
    const wpmMean = wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length;
    const wpmStdDev = Math.sqrt(
      wpmValues.reduce((sum, val) => sum + Math.pow(val - wpmMean, 2), 0) / wpmValues.length
    );
    const consistencyScore = wpmMean > 0 ? Math.max(0, 100 - (wpmStdDev / wpmMean) * 100) : 0;

    return {
      wpmTrend: Math.round(wpmTrend * 100) / 100,
      accuracyTrend: Math.round(accuracyTrend * 100) / 100,
      consistencyScore: Math.round(consistencyScore)
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private calculateLanguageStatistics(tests: TypingTest[]): LanguageStatistics {
    return {
      testsCompleted: tests.length,
      bestWPM: Math.max(...tests.map(t => t.results.wpm)),
      averageWPM: Math.round(tests.reduce((sum, t) => sum + t.results.wpm, 0) / tests.length),
      averageAccuracy: Math.round((tests.reduce((sum, t) => sum + t.results.accuracy, 0) / tests.length) * 100) / 100,
      totalTimeTyped: tests.reduce((sum, t) => sum + t.results.duration, 0)
    };
  }

  private calculateLayoutStatistics(tests: TypingTest[]): LayoutStatistics {
    const layoutId = tests[0]?.keyboardLayout || '';
    
    return {
      layoutId,
      testsCompleted: tests.length,
      bestWPM: Math.max(...tests.map(t => t.results.wpm)),
      averageWPM: Math.round(tests.reduce((sum, t) => sum + t.results.wpm, 0) / tests.length),
      averageAccuracy: Math.round((tests.reduce((sum, t) => sum + t.results.accuracy, 0) / tests.length) * 100) / 100,
      totalTimeTyped: tests.reduce((sum, t) => sum + t.results.duration, 0),
      errorPatterns: {}
    };
  }

  private analyzeErrorPatterns(_tests: TypingTest[]): Array<{ character: string; errorCount: number }> {
    // This is a simplified implementation - in practice, you'd need mistake data from sessions
    // For now, return empty patterns
    return [];
  }

  private getLayoutDisplayName(layoutId: string): string {
    // Simple mapping - in practice, you'd look this up from the layout repository
    const names: Record<string, string> = {
      'qwerty-us': 'QWERTY US',
      'dvorak': 'Dvorak',
      'colemak': 'Colemak',
      'lisu-sil-basic': 'Lisu SIL Basic',
      'myanmar3': 'Myanmar3'
    };
    
    return names[layoutId] || layoutId;
  }

  private createEmptyStatistics(userId: string): UserStatisticsDto {
    return {
      userId,
      totalTests: 0,
      bestWPM: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      totalTimeTyped: 0,
      improvementTrend: {
        wpmTrend: 0,
        accuracyTrend: 0,
        consistencyScore: 0
      },
      languageBreakdown: [],
      layoutBreakdown: []
    };
  }
}