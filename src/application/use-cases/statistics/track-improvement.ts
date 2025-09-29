import { TypingTest } from '@/domain/entities/typing';
import { ITypingRepository, IUserRepository } from '@/domain/interfaces/repositories';
import { GetImprovementAnalysisQuery } from '@/application/queries/typing.queries';
import { ImprovementAnalysisDto } from '@/application/dto/statistics.dto';

export class TrackImprovementUseCase {
  constructor(
    private typingRepository: ITypingRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(query: GetImprovementAnalysisQuery): Promise<ImprovementAnalysisDto> {
    const { userId, timeRange } = query;

    // 1. Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 2. Get historical data for the specified time range
    const tests = await this.getTestsForTimeRange(userId, timeRange);

    if (tests.length < 5) {
      return this.createInsufficientDataResponse(userId, timeRange);
    }

    // 3. Calculate overall improvement trends
    const overallTrend = this.calculateOverallTrends(tests);

    // 4. Generate personalized recommendations
    const recommendations = await this.generateRecommendations(userId, tests, overallTrend);

    // 5. Calculate achievements
    const achievements = this.calculateAchievements(tests, overallTrend);

    return {
      userId,
      timeRange,
      overallTrend,
      recommendations,
      achievements
    };
  }

  private async getTestsForTimeRange(userId: string, timeRange: string): Promise<TypingTest[]> {
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
        throw new Error(`Invalid time range: ${timeRange}`);
    }

    return await this.typingRepository.getUserTests(userId, {
      startDate,
      limit: 1000
    });
  }

  private calculateOverallTrends(tests: TypingTest[]) {
    // Sort tests chronologically
    const sortedTests = tests.sort((a, b) => a.timestamp - b.timestamp);

    // Split into before/after periods for comparison
    const midpoint = Math.floor(sortedTests.length / 2);
    const earlierTests = sortedTests.slice(0, midpoint);
    const laterTests = sortedTests.slice(midpoint);

    // Calculate averages for each period
    const earlierStats = this.calculatePeriodStats(earlierTests);
    const laterStats = this.calculatePeriodStats(laterTests);

    // Calculate improvements
    const wpmImprovement = laterStats.averageWPM - earlierStats.averageWPM;
    const accuracyImprovement = laterStats.averageAccuracy - earlierStats.averageAccuracy;
    
    // Calculate consistency improvement (lower variation is better)
    const consistencyImprovement = earlierStats.wpmVariation - laterStats.wpmVariation;

    return {
      wpmImprovement: Math.round(wpmImprovement * 100) / 100,
      accuracyImprovement: Math.round(accuracyImprovement * 100) / 100,
      consistencyImprovement: Math.round(consistencyImprovement * 100) / 100
    };
  }

  private calculatePeriodStats(tests: TypingTest[]) {
    if (tests.length === 0) {
      return {
        averageWPM: 0,
        averageAccuracy: 0,
        wpmVariation: 0
      };
    }

    const wpmValues = tests.map(test => test.results.wpm);
    const accuracyValues = tests.map(test => test.results.accuracy);

    const averageWPM = wpmValues.reduce((sum, wpm) => sum + wpm, 0) / wpmValues.length;
    const averageAccuracy = accuracyValues.reduce((sum, acc) => sum + acc, 0) / accuracyValues.length;

    // Calculate WPM variation (coefficient of variation)
    const wpmMean = averageWPM;
    const wpmVariance = wpmValues.reduce((sum, wpm) => sum + Math.pow(wpm - wpmMean, 2), 0) / wpmValues.length;
    const wpmVariation = wpmMean > 0 ? Math.sqrt(wpmVariance) / wpmMean : 0;

    return {
      averageWPM,
      averageAccuracy,
      wpmVariation
    };
  }

  private async generateRecommendations(
    userId: string, 
    tests: TypingTest[], 
    trends: {
      wpmImprovement: number;
      accuracyImprovement: number;
      consistencyImprovement: number;
    }
  ): Promise<Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    actionItems: string[];
  }>> {
    const recommendations: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
      actionItems: string[];
    }> = [];

    // Analyze performance patterns
    const performanceAnalysis = this.analyzePerformancePatterns(tests);

    // WPM improvement recommendations
    if (trends.wpmImprovement <= 0) {
      recommendations.push({
        type: 'practice',
        priority: 'high',
        title: 'Speed Building Practice',
        description: 'Your typing speed needs improvement. Focus on building muscle memory and finger dexterity.',
        actionItems: [
          'Practice typing drills for 15-20 minutes daily',
          'Focus on maintaining proper finger positioning',
          'Use online typing games to make practice more engaging',
          'Gradually increase your target WPM by 2-3 words per week'
        ]
      });
    }

    // Accuracy recommendations
    if (trends.accuracyImprovement <= 0 || performanceAnalysis.averageAccuracy < 95) {
      recommendations.push({
        type: 'technique',
        priority: trends.accuracyImprovement <= -2 ? 'high' : 'medium',
        title: 'Accuracy Improvement',
        description: 'Focus on accuracy before speed. Slow down and type correctly to build better habits.',
        actionItems: [
          'Practice typing slowly with perfect accuracy',
          'Use typing exercises that focus on common mistakes',
          'Take breaks to avoid fatigue-induced errors',
          'Practice difficult letter combinations'
        ]
      });
    }

    // Consistency recommendations
    if (trends.consistencyImprovement <= 0) {
      recommendations.push({
        type: 'technique',
        priority: 'medium',
        title: 'Consistency Training',
        description: 'Your performance varies too much. Focus on maintaining steady performance.',
        actionItems: [
          'Establish a regular typing practice routine',
          'Warm up before typing sessions',
          'Maintain proper posture and ergonomics',
          'Practice at different times to build adaptability'
        ]
      });
    }

    // Layout-specific recommendations
    const layoutAnalysis = this.analyzeLayoutPerformance(tests);
    if (layoutAnalysis.shouldConsiderLayoutChange) {
      recommendations.push({
        type: 'layout',
        priority: 'low',
        title: 'Keyboard Layout Optimization',
        description: 'Consider trying different keyboard layouts that might suit your typing style better.',
        actionItems: [
          `Try practicing with ${layoutAnalysis.recommendedLayout}`,
          'Spend at least a week learning the new layout',
          'Compare your performance across different layouts',
          'Consider your language usage patterns when choosing a layout'
        ]
      });
    }

    // Advanced recommendations for consistent performers
    if (trends.wpmImprovement > 0 && performanceAnalysis.averageAccuracy > 95) {
      recommendations.push({
        type: 'practice',
        priority: 'low',
        title: 'Advanced Typing Techniques',
        description: 'You\'re performing well! Focus on advanced techniques to reach expert level.',
        actionItems: [
          'Practice touch typing with programming languages',
          'Work on typing special characters and symbols',
          'Try competitive typing challenges',
          'Focus on maintaining speed while typing complex text'
        ]
      });
    }

    return recommendations;
  }

  private analyzePerformancePatterns(tests: TypingTest[]) {
    const averageWPM = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    const averageAccuracy = tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;
    
    // Analyze error patterns (simplified - would be more complex with actual error data)
    const commonErrors = this.identifyCommonErrors(tests);
    
    return {
      averageWPM,
      averageAccuracy,
      commonErrors
    };
  }

  private analyzeLayoutPerformance(tests: TypingTest[]) {
    const layoutPerformance = new Map();
    
    for (const test of tests) {
      if (!layoutPerformance.has(test.keyboardLayout)) {
        layoutPerformance.set(test.keyboardLayout, []);
      }
      layoutPerformance.get(test.keyboardLayout).push(test.results.wpm);
    }

    let bestLayout = '';
    let bestAverage = 0;
    
    for (const [layout, wpmScores] of layoutPerformance) {
      const average = wpmScores.reduce((sum: number, wpm: number) => sum + wpm, 0) / wpmScores.length;
      if (average > bestAverage) {
        bestAverage = average;
        bestLayout = layout;
      }
    }

    return {
      shouldConsiderLayoutChange: layoutPerformance.size > 1 && bestAverage > 0,
      recommendedLayout: bestLayout || 'qwerty-us',
      layoutPerformance: Object.fromEntries(layoutPerformance)
    };
  }

  private identifyCommonErrors(tests: TypingTest[]): Array<string> {
    // Simplified implementation - in practice, you'd analyze actual mistake data
    const errorHints = [];
    
    const avgAccuracy = tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;
    
    if (avgAccuracy < 90) {
      errorHints.push('Focus on common letter combinations');
    }
    
    if (avgAccuracy < 95 && avgAccuracy >= 90) {
      errorHints.push('Pay attention to punctuation and capitalization');
    }

    return errorHints;
  }

  private calculateAchievements(tests: TypingTest[], trends: {
    wpmImprovement: number;
    accuracyImprovement: number;
    consistencyImprovement: number;
  }): Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: number;
  }> {
    const achievements = [];
    const bestWPM = Math.max(...tests.map(test => test.results.wpm));
    const bestAccuracy = Math.max(...tests.map(test => test.results.accuracy));

    // Speed milestones
    const speedMilestones = [30, 40, 50, 60, 70, 80, 90, 100];
    for (const milestone of speedMilestones) {
      if (bestWPM >= milestone) {
        const recentAchievement = tests.some(test => 
          test.results.wpm >= milestone && 
          test.timestamp > Date.now() - (30 * 24 * 60 * 60 * 1000)
        );

        if (recentAchievement) {
          achievements.push({
            type: 'speed',
            title: `Speed Demon ${milestone} WPM`,
            description: `Achieved ${milestone} words per minute!`,
            unlockedAt: Math.max(...tests.filter(t => t.results.wpm >= milestone).map(t => t.timestamp))
          });
        }
      }
    }

    // Accuracy achievements
    if (bestAccuracy >= 99) {
      achievements.push({
        type: 'accuracy',
        title: 'Precision Master',
        description: 'Achieved 99%+ accuracy!',
        unlockedAt: Math.max(...tests.filter(t => t.results.accuracy >= 99).map(t => t.timestamp))
      });
    }

    // Improvement achievements
    if (trends.wpmImprovement > 5) {
      achievements.push({
        type: 'improvement',
        title: 'Rising Star',
        description: `Improved by ${trends.wpmImprovement.toFixed(1)} WPM!`,
        unlockedAt: Date.now()
      });
    }

    // Consistency achievements
    if (trends.consistencyImprovement > 5) {
      achievements.push({
        type: 'consistency',
        title: 'Steady Performer',
        description: 'Significantly improved typing consistency!',
        unlockedAt: Date.now()
      });
    }

    return achievements.slice(-5); // Return last 5 achievements
  }

  private createInsufficientDataResponse(userId: string, timeRange: string): ImprovementAnalysisDto {
    return {
      userId,
      timeRange,
      overallTrend: {
        wpmImprovement: 0,
        accuracyImprovement: 0,
        consistencyImprovement: 0
      },
      recommendations: [{
        type: 'practice',
        priority: 'high',
        title: 'Build Your Typing History',
        description: 'Complete more typing tests to get personalized improvement analysis.',
        actionItems: [
          'Take at least 5-10 typing tests',
          'Practice regularly to build a performance history',
          'Try different difficulty levels and text types',
          'Come back in a week for detailed insights'
        ]
      }],
      achievements: []
    };
  }
}