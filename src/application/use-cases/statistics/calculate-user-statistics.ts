import { LanguageCode } from "@/enums/site-config";
import { TypingMode } from "../../domain/entities/typing";
import { ITypingRepository, IUserRepository, TestFilters } from "../../domain/interfaces/repositories";
import { GetUserStatsQueryDTO } from "../dto/queries.dto";
import { UserStatisticsResponseDTO } from "../dto/statistics.dto";

export class CalculateUserStatisticsUseCase {
  constructor(
    private typingRepository: ITypingRepository,
    private userRepository: IUserRepository
  ) { }

  async execute(query: GetUserStatsQueryDTO): Promise<UserStatisticsResponseDTO> {
    const { userId, language, mode, layoutId, timeRange } = query;

    // 1. Get user's basic statistics
    const userStats = await this.userRepository.getStatistics(userId);
    if (!userStats) {
      throw new Error(`User statistics not found for user: ${userId}`);
    }

    // 2. Build filters for detailed analysis
    const filters: TestFilters = {
      ...(language && { language }),
      ...(mode && { mode }),
      ...(layoutId && { layoutId }),
      ...(timeRange && { startDate: timeRange.start, endDate: timeRange.end })
    };

    // 3. Get user's typing tests for detailed analysis
    const userTests = await this.typingRepository.getUserTests(userId, filters);

    // 4. Calculate layout-specific statistics
    const layoutStats = this.calculateLayoutStats(userTests);

    // 5. Get recent tests for trend analysis
    const recentTests = userTests
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(test => ({
        date: new Date(test.timestamp),
        wpm: test.results.wpm,
        accuracy: test.results.accuracy,
        mode: test.mode,
        language: test.language
      }));

    // 6. Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(userTests);

    return {
      userId,
      totalTests: userStats.totalTests,
      totalTimeTyped: userStats.totalTimeTyped,
      bestWpm: userStats.bestWpm,
      averageWpm: userStats.averageWpm,
      bestAccuracy: userStats.bestAccuracy,
      averageAccuracy: userStats.averageAccuracy,
      totalWordsTyped: userStats.totalWordsTyped,
      totalCharactersTyped: userStats.totalCharactersTyped,
      improvementRate,
      lastTestDate: userStats.lastTestDate,
      layoutStats,
      recentTests
    };
  }

  async getUserPerformanceAnalysis(userId: string, depth: 'basic' | 'detailed' | 'comprehensive' = 'basic'): Promise<{
    overallPerformance: {
      score: number;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      strengths: string[];
      weaknesses: string[];
    };
    consistencyAnalysis?: {
      consistencyScore: number;
      speedVariation: number;
      accuracyStability: number;
    };
    improvementSuggestions?: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      estimatedImpact: number;
    }>;
  }> {
    const userTests = await this.typingRepository.getUserTests(userId, { limit: 100 });

    if (userTests.length === 0) {
      return {
        overallPerformance: {
          score: 0,
          level: 'beginner',
          strengths: [],
          weaknesses: ['No typing tests completed yet']
        }
      };
    }

    // Calculate overall performance score
    const avgWpm = userTests.reduce((sum, test) => sum + test.results.wpm, 0) / userTests.length;
    const avgAccuracy = userTests.reduce((sum, test) => sum + test.results.accuracy, 0) / userTests.length;

    const overallScore = Math.round((avgWpm * 0.6) + (avgAccuracy * 0.4));
    const level = this.determineSkillLevel(avgWpm, avgAccuracy);
    const { strengths, weaknesses } = this.analyzeStrengthsWeaknesses(userTests);

    const result: any = {
      overallPerformance: {
        score: overallScore,
        level,
        strengths,
        weaknesses
      }
    };

    if (depth === 'detailed' || depth === 'comprehensive') {
      result.consistencyAnalysis = this.analyzeConsistency(userTests);
    }

    if (depth === 'comprehensive') {
      result.improvementSuggestions = this.generateImprovementSuggestions(userTests, level);
    }

    return result;
  }

  private calculateLayoutStats(tests: any[]): Array<{
    layoutId: string;
    layoutName: string;
    testsCount: number;
    averageWpm: number;
    averageAccuracy: number;
  }> {
    const layoutMap = new Map<string, {
      layoutId: string;
      layoutName: string;
      tests: any[];
    }>();

    // Group tests by layout
    tests.forEach(test => {
      const layoutId = test.keyboardLayoutId || 'unknown';
      if (!layoutMap.has(layoutId)) {
        layoutMap.set(layoutId, {
          layoutId,
          layoutName: layoutId, // In real implementation, get layout name from repository
          tests: []
        });
      }
      layoutMap.get(layoutId)!.tests.push(test);
    });

    // Calculate statistics for each layout
    return Array.from(layoutMap.values()).map(layoutData => {
      const testsCount = layoutData.tests.length;
      const totalWpm = layoutData.tests.reduce((sum, test) => sum + test.results.wpm, 0);
      const totalAccuracy = layoutData.tests.reduce((sum, test) => sum + test.results.accuracy, 0);

      return {
        layoutId: layoutData.layoutId,
        layoutName: layoutData.layoutName,
        testsCount,
        averageWpm: testsCount > 0 ? Math.round(totalWpm / testsCount) : 0,
        averageAccuracy: testsCount > 0 ? Math.round((totalAccuracy / testsCount) * 100) / 100 : 0
      };
    }).sort((a, b) => b.testsCount - a.testsCount); // Sort by test count desc
  }

  private calculateImprovementRate(tests: any[]): number {
    if (tests.length < 2) {
      return 0;
    }

    // Sort tests by timestamp
    const sortedTests = tests.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate improvement by comparing first 25% with last 25% of tests
    const quarterSize = Math.max(1, Math.floor(sortedTests.length / 4));
    const earlyTests = sortedTests.slice(0, quarterSize);
    const recentTests = sortedTests.slice(-quarterSize);

    const earlyAvgWpm = earlyTests.reduce((sum, test) => sum + test.results.wpm, 0) / earlyTests.length;
    const recentAvgWpm = recentTests.reduce((sum, test) => sum + test.results.wpm, 0) / recentTests.length;

    const improvementRate = earlyAvgWpm > 0 ? ((recentAvgWpm - earlyAvgWpm) / earlyAvgWpm) * 100 : 0;
    return Math.round(improvementRate * 100) / 100;
  }

  private determineSkillLevel(avgWpm: number, avgAccuracy: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (avgWpm < 20 || avgAccuracy < 80) return 'beginner';
    if (avgWpm < 40 || avgAccuracy < 90) return 'intermediate';
    if (avgWpm < 70 || avgAccuracy < 95) return 'advanced';
    return 'expert';
  }

  private analyzeStrengthsWeaknesses(tests: any[]): {
    strengths: string[];
    weaknesses: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const avgWpm = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    const avgAccuracy = tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;
    const avgConsistency = tests.reduce((sum, test) => sum + test.results.consistency, 0) / tests.length;

    // Analyze strengths
    if (avgWpm > 60) strengths.push('High typing speed');
    if (avgAccuracy > 95) strengths.push('Excellent accuracy');
    if (avgConsistency > 80) strengths.push('Consistent typing rhythm');

    // Analyze weaknesses  
    if (avgWpm < 30) weaknesses.push('Typing speed needs improvement');
    if (avgAccuracy < 90) weaknesses.push('Accuracy needs attention');
    if (avgConsistency < 60) weaknesses.push('Inconsistent typing rhythm');

    return { strengths, weaknesses };
  }

  private analyzeConsistency(tests: any[]): {
    consistencyScore: number;
    speedVariation: number;
    accuracyStability: number;
  } {
    if (tests.length < 3) {
      return {
        consistencyScore: 100,
        speedVariation: 0,
        accuracyStability: 100
      };
    }

    const speeds = tests.map(test => test.results.wpm);
    const accuracies = tests.map(test => test.results.accuracy);

    // Calculate coefficient of variation for speed
    const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
    const speedVariance = speeds.reduce((acc, speed) => acc + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
    const speedStdDev = Math.sqrt(speedVariance);
    const speedVariation = avgSpeed > 0 ? (speedStdDev / avgSpeed) * 100 : 0;

    // Calculate accuracy stability
    const avgAccuracy = accuracies.reduce((a, b) => a + b) / accuracies.length;
    const accuracyVariance = accuracies.reduce((acc, acc_val) => acc + Math.pow(acc_val - avgAccuracy, 2), 0) / accuracies.length;
    const accuracyStdDev = Math.sqrt(accuracyVariance);
    const accuracyStability = Math.max(0, 100 - accuracyStdDev);

    // Overall consistency score
    const consistencyScore = Math.max(0, 100 - speedVariation);

    return {
      consistencyScore: Math.round(consistencyScore),
      speedVariation: Math.round(speedVariation * 100) / 100,
      accuracyStability: Math.round(accuracyStability * 100) / 100
    };
  }

  private generateImprovementSuggestions(tests: any[], level: string): Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: number;
  }> {
    const suggestions: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      estimatedImpact: number;
    }> = [];

    const avgWpm = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    const avgAccuracy = tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;

    // Speed improvement suggestions
    if (avgWpm < 40) {
      suggestions.push({
        category: 'Speed',
        suggestion: 'Focus on increasing typing speed through regular practice with simple texts',
        priority: 'high',
        estimatedImpact: 15
      });
    }

    // Accuracy improvement suggestions
    if (avgAccuracy < 95) {
      suggestions.push({
        category: 'Accuracy',
        suggestion: 'Slow down and focus on accuracy. Use practice mode to identify problem keys',
        priority: 'high',
        estimatedImpact: 20
      });
    }

    // Layout optimization suggestions
    const layoutStats = this.calculateLayoutStats(tests);
    if (layoutStats.length > 1) {
      const bestLayout = layoutStats[0];
      suggestions.push({
        category: 'Layout',
        suggestion: `Consider using ${bestLayout.layoutName} more often as you perform better with it`,
        priority: 'medium',
        estimatedImpact: 10
      });
    }

    return suggestions;
  }
}