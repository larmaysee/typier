import { LanguageCode } from "@/enums/site-config";
import { ITypingRepository, IUserRepository } from "../../domain/interfaces/repositories";
import { IPerformanceAnalyzerService } from "../../domain/interfaces/services";
import { TrackImprovementQueryDTO } from "../dto/queries.dto";
import { ImprovementTrackingResponseDTO } from "../dto/statistics.dto";

export class TrackImprovementUseCase {
  constructor(
    private typingRepository: ITypingRepository,
    private userRepository: IUserRepository,
    private performanceAnalyzer: IPerformanceAnalyzerService
  ) {}

  async execute(query: TrackImprovementQueryDTO): Promise<ImprovementTrackingResponseDTO> {
    const { userId, language, analysisDepth = 'basic', timeRange } = query;

    // 1. Get user's typing history
    const filters = {
      ...(language && { language }),
      ...(timeRange && { startDate: timeRange.start, endDate: timeRange.end }),
      limit: 1000 // Get substantial history for analysis
    };

    const userTests = await this.typingRepository.getUserTests(userId, filters);
    
    if (userTests.length === 0) {
      throw new Error(`No typing tests found for user: ${userId}`);
    }

    // 2. Sort tests chronologically
    const sortedTests = userTests.sort((a, b) => a.timestamp - b.timestamp);

    // 3. Analyze performance trends
    const performanceAnalysis = await this.performanceAnalyzer.analyzeTypingPerformance(
      sortedTests,
      { 
        includeLayoutAnalysis: analysisDepth !== 'basic',
        includePatterAnalysis: analysisDepth === 'comprehensive',
        includeTimingAnalysis: analysisDepth === 'comprehensive',
        timeRange
      }
    );

    // 4. Calculate progress data points
    const wpmProgress = this.calculateProgressPoints(sortedTests, 'wpm');
    const accuracyProgress = this.calculateProgressPoints(sortedTests, 'accuracy');
    const consistencyProgress = this.calculateProgressPoints(sortedTests, 'consistency');

    // 5. Determine overall trend
    const overallTrend = this.determineOverallTrend(wpmProgress, accuracyProgress);

    // 6. Generate recommendations
    const recommendations = await this.performanceAnalyzer.recommendPractice(performanceAnalysis);

    // 7. Calculate next milestones
    const nextMilestones = this.calculateNextMilestones(sortedTests);

    return {
      userId,
      overallTrend,
      wpmProgress,
      accuracyProgress,
      consistencyProgress,
      recommendations: recommendations.map(rec => ({
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        estimatedImpact: rec.estimatedImpact
      })),
      nextMilestones
    };
  }

  async getDetailedImprovementReport(userId: string, options: {
    timeRange?: { start: Date; end: Date };
    compareWithPeers?: boolean;
    includeLayoutAnalysis?: boolean;
  } = {}): Promise<{
    improvementSummary: {
      overallScore: number;
      improvementRate: number;
      consistencyScore: number;
      strengthAreas: string[];
      improvementAreas: string[];
    };
    periodComparison: Array<{
      period: string;
      avgWpm: number;
      avgAccuracy: number;
      testsCount: number;
      improvement: number;
    }>;
    layoutPerformance?: Array<{
      layoutId: string;
      layoutName: string;
      progressTrend: 'improving' | 'stable' | 'declining';
      bestWpm: number;
      avgWpm: number;
      testsCount: number;
    }>;
    peerComparison?: {
      userPercentile: number;
      similarUsersAvgWpm: number;
      userAdvantage: number;
    };
  }> {
    const { timeRange, compareWithPeers = false, includeLayoutAnalysis = false } = options;

    // Get user's tests
    const userTests = await this.typingRepository.getUserTests(userId, {
      ...(timeRange && { startDate: timeRange.start, endDate: timeRange.end }),
      limit: 1000
    });

    if (userTests.length === 0) {
      throw new Error(`No typing tests found for user: ${userId}`);
    }

    const sortedTests = userTests.sort((a, b) => a.timestamp - b.timestamp);

    // 1. Calculate improvement summary
    const improvementSummary = await this.calculateImprovementSummary(sortedTests);

    // 2. Calculate period comparison (monthly breakdown)
    const periodComparison = this.calculatePeriodComparison(sortedTests);

    // 3. Layout performance analysis (if requested)
    let layoutPerformance;
    if (includeLayoutAnalysis) {
      layoutPerformance = this.analyzeLayoutPerformance(sortedTests);
    }

    // 4. Peer comparison (if requested)
    let peerComparison;
    if (compareWithPeers) {
      peerComparison = await this.calculatePeerComparison(userId, sortedTests);
    }

    return {
      improvementSummary,
      periodComparison,
      layoutPerformance,
      peerComparison
    };
  }

  private calculateProgressPoints(tests: any[], metric: 'wpm' | 'accuracy' | 'consistency'): Array<{
    date: Date;
    value: number;
  }> {
    // Group tests by date and calculate moving average
    const dailyAverages = new Map<string, { values: number[]; date: Date }>();

    tests.forEach(test => {
      const date = new Date(test.timestamp);
      const dateKey = date.toDateString();
      
      let value: number;
      switch (metric) {
        case 'wpm':
          value = test.results.wpm;
          break;
        case 'accuracy':
          value = test.results.accuracy;
          break;
        case 'consistency':
          value = test.results.consistency || 0;
          break;
        default:
          value = 0;
      }

      if (!dailyAverages.has(dateKey)) {
        dailyAverages.set(dateKey, { values: [], date });
      }
      dailyAverages.get(dateKey)!.values.push(value);
    });

    // Calculate daily averages and apply smoothing
    const progressPoints = Array.from(dailyAverages.entries()).map(([_, data]) => ({
      date: data.date,
      value: Math.round((data.values.reduce((sum, val) => sum + val, 0) / data.values.length) * 100) / 100
    }));

    // Sort by date
    return progressPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private determineOverallTrend(
    wpmProgress: Array<{ date: Date; value: number }>,
    accuracyProgress: Array<{ date: Date; value: number }>
  ): 'improving' | 'stable' | 'declining' {
    if (wpmProgress.length < 3) {
      return 'stable';
    }

    // Calculate trends using linear regression
    const wpmTrend = this.calculateTrend(wpmProgress.map(p => p.value));
    const accuracyTrend = this.calculateTrend(accuracyProgress.map(p => p.value));

    // Weight WPM trend more heavily
    const combinedTrend = (wpmTrend * 0.7) + (accuracyTrend * 0.3);

    if (combinedTrend > 0.1) return 'improving';
    if (combinedTrend < -0.1) return 'declining';
    return 'stable';
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squared indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateNextMilestones(tests: any[]): Array<{
    metric: 'wpm' | 'accuracy' | 'consistency';
    currentValue: number;
    targetValue: number;
    estimatedTimeToReach: number;
  }> {
    const recentTests = tests.slice(-10); // Last 10 tests
    const currentWpm = recentTests.reduce((sum, test) => sum + test.results.wpm, 0) / recentTests.length;
    const currentAccuracy = recentTests.reduce((sum, test) => sum + test.results.accuracy, 0) / recentTests.length;
    const currentConsistency = recentTests.reduce((sum, test) => sum + (test.results.consistency || 0), 0) / recentTests.length;

    const milestones: Array<any> = [];

    // WPM milestones
    const nextWpmMilestone = Math.ceil(currentWpm / 10) * 10;
    if (nextWpmMilestone > currentWpm) {
      milestones.push({
        metric: 'wpm',
        currentValue: Math.round(currentWpm),
        targetValue: nextWpmMilestone,
        estimatedTimeToReach: this.estimateTimeToReachWpm(tests, nextWpmMilestone)
      });
    }

    // Accuracy milestones
    const accuracyMilestones = [90, 95, 98, 99];
    const nextAccuracyMilestone = accuracyMilestones.find(milestone => milestone > currentAccuracy);
    if (nextAccuracyMilestone) {
      milestones.push({
        metric: 'accuracy',
        currentValue: Math.round(currentAccuracy * 100) / 100,
        targetValue: nextAccuracyMilestone,
        estimatedTimeToReach: this.estimateTimeToReachAccuracy(tests, nextAccuracyMilestone)
      });
    }

    // Consistency milestones
    const consistencyMilestones = [70, 80, 90, 95];
    const nextConsistencyMilestone = consistencyMilestones.find(milestone => milestone > currentConsistency);
    if (nextConsistencyMilestone) {
      milestones.push({
        metric: 'consistency',
        currentValue: Math.round(currentConsistency),
        targetValue: nextConsistencyMilestone,
        estimatedTimeToReach: this.estimateTimeToReachConsistency(tests, nextConsistencyMilestone)
      });
    }

    return milestones;
  }

  private estimateTimeToReachWpm(tests: any[], targetWpm: number): number {
    // Simple estimation based on improvement rate
    const improvementRate = this.calculateImprovementRate(tests, 'wpm');
    const currentWpm = tests.slice(-5).reduce((sum, test) => sum + test.results.wpm, 0) / 5;
    
    if (improvementRate <= 0) return -1; // No improvement trend
    
    const wpmToImprove = targetWpm - currentWpm;
    const estimatedDays = Math.ceil(wpmToImprove / (improvementRate / 7)); // Convert weekly rate to daily
    
    return Math.max(1, estimatedDays);
  }

  private estimateTimeToReachAccuracy(tests: any[], targetAccuracy: number): number {
    const improvementRate = this.calculateImprovementRate(tests, 'accuracy');
    const currentAccuracy = tests.slice(-5).reduce((sum, test) => sum + test.results.accuracy, 0) / 5;
    
    if (improvementRate <= 0) return -1;
    
    const accuracyToImprove = targetAccuracy - currentAccuracy;
    const estimatedDays = Math.ceil(accuracyToImprove / (improvementRate / 7));
    
    return Math.max(1, estimatedDays);
  }

  private estimateTimeToReachConsistency(tests: any[], targetConsistency: number): number {
    // Consistency improvement is typically slower
    const estimatedDays = 30; // Conservative estimate
    return estimatedDays;
  }

  private calculateImprovementRate(tests: any[], metric: 'wpm' | 'accuracy'): number {
    if (tests.length < 10) return 0;
    
    const recent = tests.slice(-5);
    const earlier = tests.slice(-15, -10);
    
    if (earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, test) => sum + test.results[metric], 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, test) => sum + test.results[metric], 0) / earlier.length;
    
    return recentAvg - earlierAvg;
  }

  private async calculateImprovementSummary(tests: any[]): Promise<{
    overallScore: number;
    improvementRate: number;
    consistencyScore: number;
    strengthAreas: string[];
    improvementAreas: string[];
  }> {
    // Implementation would calculate detailed improvement metrics
    // This is a simplified version
    const avgWpm = tests.reduce((sum, test) => sum + test.results.wpm, 0) / tests.length;
    const avgAccuracy = tests.reduce((sum, test) => sum + test.results.accuracy, 0) / tests.length;
    
    return {
      overallScore: Math.round((avgWpm * 0.6) + (avgAccuracy * 0.4)),
      improvementRate: this.calculateImprovementRate(tests, 'wpm'),
      consistencyScore: 85, // Placeholder
      strengthAreas: ['Speed', 'Accuracy'], // Placeholder
      improvementAreas: ['Consistency'] // Placeholder
    };
  }

  private calculatePeriodComparison(tests: any[]): Array<{
    period: string;
    avgWpm: number;
    avgAccuracy: number;
    testsCount: number;
    improvement: number;
  }> {
    // Group tests by month and calculate comparisons
    // This is a simplified implementation
    return [
      {
        period: 'This Month',
        avgWpm: 45,
        avgAccuracy: 92,
        testsCount: 15,
        improvement: 5
      }
    ];
  }

  private analyzeLayoutPerformance(tests: any[]): Array<{
    layoutId: string;
    layoutName: string;
    progressTrend: 'improving' | 'stable' | 'declining';
    bestWpm: number;
    avgWpm: number;
    testsCount: number;
  }> {
    // Analyze performance by layout
    // This is a simplified implementation
    return [];
  }

  private async calculatePeerComparison(userId: string, userTests: any[]): Promise<{
    userPercentile: number;
    similarUsersAvgWpm: number;
    userAdvantage: number;
  }> {
    // Compare with similar users
    // This is a simplified implementation
    return {
      userPercentile: 75,
      similarUsersAvgWpm: 40,
      userAdvantage: 5
    };
  }
}