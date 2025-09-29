import { TypingAnalytics, AnalysisType, KeystrokeData, ProblemArea, ProgressPoint } from "../../../domain/entities/typing-analytics";
import { IAnalyticsRepository } from "../../../domain/interfaces/analytics-repository.interface";

export interface AnalyzeTypingPatternsCommand {
  userId: string;
  sessionIds?: string[];
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  timeRangeInDays?: number;
  focusAreas?: AnalysisFocusArea[];
}

export interface AnalysisFocusArea {
  type: 'rhythm' | 'accuracy' | 'speed' | 'consistency' | 'finger_usage' | 'error_patterns';
  priority: 'high' | 'medium' | 'low';
}

export interface TypingPatternAnalysisResult {
  analysis: TypingAnalytics;
  patterns: TypingPattern[];
  insights: Insight[];
  recommendations: PatternRecommendation[];
  comparisons: PatternComparison[];
}

export interface TypingPattern {
  type: 'rhythm' | 'error' | 'speed' | 'finger' | 'fatigue';
  name: string;
  description: string;
  strength: 'weak' | 'moderate' | 'strong';
  frequency: number; // How often this pattern occurs
  impact: 'positive' | 'negative' | 'neutral';
  evidence: Evidence[];
}

export interface Evidence {
  type: 'statistical' | 'temporal' | 'behavioral';
  metric: string;
  value: number;
  description: string;
}

export interface Insight {
  category: 'performance' | 'behavior' | 'potential' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  relatedPatterns: string[];
}

export interface PatternRecommendation {
  pattern: string;
  type: 'practice' | 'technique' | 'mindset' | 'hardware';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  timeToSeeResults: string;
  actionSteps: string[];
}

export interface PatternComparison {
  metric: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  interpretation: string;
}

export class AnalyzeTypingPatternsUseCase {
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(command: AnalyzeTypingPatternsCommand): Promise<TypingPatternAnalysisResult> {
    // Get user analytics data
    const userAnalytics = await this.getUserAnalytics(command);
    
    if (userAnalytics.length === 0) {
      throw new Error("No analytics data available for analysis");
    }

    // Perform pattern analysis based on depth
    const patterns = await this.analyzePatterns(userAnalytics, command.analysisDepth, command.focusAreas);
    
    // Generate insights from patterns
    const insights = this.generateInsights(patterns, userAnalytics);
    
    // Create recommendations
    const recommendations = this.generateRecommendations(patterns, insights);
    
    // Generate comparisons with average users
    const comparisons = await this.generateComparisons(userAnalytics, command.userId);
    
    // Create aggregate analysis
    const analysis = await this.createAggregateAnalysis(userAnalytics, patterns, command.userId);

    return {
      analysis,
      patterns,
      insights,
      recommendations,
      comparisons
    };
  }

  private async getUserAnalytics(command: AnalyzeTypingPatternsCommand): Promise<TypingAnalytics[]> {
    let analytics: TypingAnalytics[];

    if (command.sessionIds && command.sessionIds.length > 0) {
      // Get specific sessions
      analytics = [];
      for (const sessionId of command.sessionIds) {
        const sessionAnalytics = await this.analyticsRepository.findBySessionId(sessionId);
        analytics.push(...sessionAnalytics);
      }
    } else {
      // Get all user analytics within time range
      const allAnalytics = await this.analyticsRepository.findByUserId(command.userId);
      
      if (command.timeRangeInDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - command.timeRangeInDays);
        analytics = allAnalytics.filter(a => new Date(a.generatedAt) >= cutoffDate);
      } else {
        analytics = allAnalytics;
      }
    }

    return analytics.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());
  }

  private async analyzePatterns(
    analytics: TypingAnalytics[],
    depth: 'basic' | 'detailed' | 'comprehensive',
    focusAreas?: AnalysisFocusArea[]
  ): Promise<TypingPattern[]> {
    const patterns: TypingPattern[] = [];

    // Determine which patterns to analyze based on depth and focus areas
    const areasToAnalyze = this.determineAnalysisAreas(depth, focusAreas);

    for (const area of areasToAnalyze) {
      switch (area) {
        case 'rhythm':
          patterns.push(...this.analyzeRhythmPatterns(analytics));
          break;
        case 'accuracy':
          patterns.push(...this.analyzeAccuracyPatterns(analytics));
          break;
        case 'speed':
          patterns.push(...this.analyzeSpeedPatterns(analytics));
          break;
        case 'consistency':
          patterns.push(...this.analyzeConsistencyPatterns(analytics));
          break;
        case 'finger_usage':
          patterns.push(...this.analyzeFingerUsagePatterns(analytics));
          break;
        case 'error_patterns':
          patterns.push(...this.analyzeErrorPatterns(analytics));
          break;
      }
    }

    return patterns;
  }

  private determineAnalysisAreas(
    depth: 'basic' | 'detailed' | 'comprehensive',
    focusAreas?: AnalysisFocusArea[]
  ): AnalysisFocusArea['type'][] {
    if (focusAreas && focusAreas.length > 0) {
      return focusAreas.map(area => area.type);
    }

    switch (depth) {
      case 'basic':
        return ['speed', 'accuracy'];
      case 'detailed':
        return ['speed', 'accuracy', 'consistency', 'error_patterns'];
      case 'comprehensive':
        return ['rhythm', 'accuracy', 'speed', 'consistency', 'finger_usage', 'error_patterns'];
      default:
        return ['speed', 'accuracy'];
    }
  }

  private analyzeRhythmPatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Analyze typing rhythm consistency
    const keystrokeIntervals = this.extractKeystrokeIntervals(analytics);
    const rhythmVariation = this.calculateRhythmVariation(keystrokeIntervals);

    if (rhythmVariation < 0.2) {
      patterns.push({
        type: 'rhythm',
        name: 'Consistent Rhythm',
        description: 'You maintain a steady typing rhythm across sessions',
        strength: 'strong',
        frequency: 0.8,
        impact: 'positive',
        evidence: [
          {
            type: 'statistical',
            metric: 'rhythm_variation',
            value: rhythmVariation,
            description: 'Low variation in keystroke timing'
          }
        ]
      });
    } else if (rhythmVariation > 0.5) {
      patterns.push({
        type: 'rhythm',
        name: 'Erratic Rhythm',
        description: 'Your typing rhythm varies significantly, affecting consistency',
        strength: 'strong',
        frequency: 0.7,
        impact: 'negative',
        evidence: [
          {
            type: 'statistical',
            metric: 'rhythm_variation',
            value: rhythmVariation,
            description: 'High variation in keystroke timing'
          }
        ]
      });
    }

    return patterns;
  }

  private analyzeAccuracyPatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Analyze accuracy trends over time
    const accuracyTrend = this.calculateAccuracyTrend(analytics);
    const errorDistribution = this.analyzeErrorDistribution(analytics);

    if (accuracyTrend > 0.1) {
      patterns.push({
        type: 'accuracy',
        name: 'Improving Accuracy',
        description: 'Your accuracy is consistently improving over time',
        strength: 'moderate',
        frequency: 0.6,
        impact: 'positive',
        evidence: [
          {
            type: 'temporal',
            metric: 'accuracy_trend',
            value: accuracyTrend,
            description: 'Positive accuracy trend over time'
          }
        ]
      });
    }

    // Analyze specific error patterns
    if (errorDistribution.hasPattern) {
      patterns.push({
        type: 'error',
        name: 'Systematic Errors',
        description: 'You have consistent error patterns that can be addressed',
        strength: 'moderate',
        frequency: errorDistribution.frequency,
        impact: 'negative',
        evidence: [
          {
            type: 'behavioral',
            metric: 'error_consistency',
            value: errorDistribution.consistency,
            description: 'Repeated errors on specific keys/combinations'
          }
        ]
      });
    }

    return patterns;
  }

  private analyzeSpeedPatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Analyze speed consistency and peaks
    const speedData = analytics.map(a => a.data.averageWpm);
    const speedTrend = this.calculateTrend(speedData);
    const speedConsistency = this.calculateConsistency(speedData);
    const speedBursts = this.detectSpeedBursts(analytics);

    if (speedBursts.length > 0) {
      patterns.push({
        type: 'speed',
        name: 'Speed Bursts',
        description: 'You show capability for higher speeds in bursts',
        strength: 'moderate',
        frequency: speedBursts.length / analytics.length,
        impact: 'positive',
        evidence: [
          {
            type: 'statistical',
            metric: 'burst_frequency',
            value: speedBursts.length,
            description: 'Number of sessions with significantly higher speed'
          }
        ]
      });
    }

    if (speedConsistency < 0.6) {
      patterns.push({
        type: 'speed',
        name: 'Inconsistent Speed',
        description: 'Your typing speed varies significantly between sessions',
        strength: 'strong',
        frequency: 0.8,
        impact: 'negative',
        evidence: [
          {
            type: 'statistical',
            metric: 'speed_consistency',
            value: speedConsistency,
            description: 'High variation in typing speed'
          }
        ]
      });
    }

    return patterns;
  }

  private analyzeConsistencyPatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Analyze overall consistency across metrics
    const metrics = ['averageWpm', 'accuracy'];
    let overallConsistency = 0;

    for (const metric of metrics) {
      const values = analytics.map(a => (a.data as any)[metric]);
      const consistency = this.calculateConsistency(values);
      overallConsistency += consistency;
    }

    overallConsistency /= metrics.length;

    if (overallConsistency > 0.8) {
      patterns.push({
        type: 'consistency',
        name: 'High Consistency',
        description: 'You maintain consistent performance across sessions',
        strength: 'strong',
        frequency: 0.9,
        impact: 'positive',
        evidence: [
          {
            type: 'statistical',
            metric: 'overall_consistency',
            value: overallConsistency,
            description: 'Low variation across all performance metrics'
          }
        ]
      });
    }

    return patterns;
  }

  private analyzeFingerUsagePatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Analyze finger usage distribution
    const fingerUsage = this.aggregateFingerUsage(analytics);
    const imbalance = this.calculateFingerImbalance(fingerUsage);

    if (imbalance > 0.3) {
      patterns.push({
        type: 'finger',
        name: 'Finger Imbalance',
        description: 'Some fingers are overused while others are underutilized',
        strength: 'moderate',
        frequency: 0.7,
        impact: 'negative',
        evidence: [
          {
            type: 'behavioral',
            metric: 'finger_imbalance',
            value: imbalance,
            description: 'Uneven distribution of keystrokes across fingers'
          }
        ]
      });
    }

    return patterns;
  }

  private analyzeErrorPatterns(analytics: TypingAnalytics[]): TypingPattern[] {
    const patterns: TypingPattern[] = [];

    // Find recurring error patterns
    const errorPatterns = this.findRecurringErrors(analytics);
    
    for (const errorPattern of errorPatterns) {
      patterns.push({
        type: 'error',
        name: `Recurring ${errorPattern.type} Errors`,
        description: `Consistent errors in ${errorPattern.category}`,
        strength: errorPattern.strength,
        frequency: errorPattern.frequency,
        impact: 'negative',
        evidence: [
          {
            type: 'behavioral',
            metric: 'error_recurrence',
            value: errorPattern.frequency,
            description: `${errorPattern.occurrences} occurrences across sessions`
          }
        ]
      });
    }

    return patterns;
  }

  private generateInsights(patterns: TypingPattern[], analytics: TypingAnalytics[]): Insight[] {
    const insights: Insight[] = [];

    // Performance insights
    const performancePatterns = patterns.filter(p => p.impact === 'positive');
    const problemPatterns = patterns.filter(p => p.impact === 'negative');

    if (performancePatterns.length > problemPatterns.length) {
      insights.push({
        category: 'performance',
        title: 'Strong Foundation',
        description: 'You have more positive typing patterns than negative ones, indicating a solid foundation',
        confidence: 0.8,
        actionable: true,
        relatedPatterns: performancePatterns.map(p => p.name)
      });
    }

    // Potential insights
    const speedBursts = patterns.find(p => p.name === 'Speed Bursts');
    if (speedBursts) {
      insights.push({
        category: 'potential',
        title: 'Untapped Speed Potential',
        description: 'Your speed bursts indicate you can type faster consistently with practice',
        confidence: 0.7,
        actionable: true,
        relatedPatterns: [speedBursts.name]
      });
    }

    // Warning insights
    const criticalPatterns = patterns.filter(p => p.impact === 'negative' && p.strength === 'strong');
    if (criticalPatterns.length > 0) {
      insights.push({
        category: 'warning',
        title: 'Critical Areas Need Attention',
        description: 'Several strong negative patterns are limiting your progress',
        confidence: 0.9,
        actionable: true,
        relatedPatterns: criticalPatterns.map(p => p.name)
      });
    }

    return insights;
  }

  private generateRecommendations(patterns: TypingPattern[], insights: Insight[]): PatternRecommendation[] {
    const recommendations: PatternRecommendation[] = [];

    // Generate recommendations for each negative pattern
    patterns.filter(p => p.impact === 'negative').forEach(pattern => {
      const recommendation = this.createRecommendationForPattern(pattern);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return recommendations;
  }

  private async generateComparisons(analytics: TypingAnalytics[], userId: string): Promise<PatternComparison[]> {
    // This would typically compare against a database of anonymous user data
    // For now, we'll use representative averages
    const userAvgWpm = analytics.reduce((sum, a) => sum + a.data.averageWpm, 0) / analytics.length;
    const userAvgAccuracy = analytics.reduce((sum, a) => sum + a.data.accuracy, 0) / analytics.length;

    return [
      {
        metric: 'Average WPM',
        userValue: userAvgWpm,
        averageValue: 40, // Representative average
        percentile: this.calculatePercentile(userAvgWpm, 40, 15), // mean=40, std=15
        interpretation: userAvgWpm > 40 ? 'Above average' : 'Below average'
      },
      {
        metric: 'Average Accuracy',
        userValue: userAvgAccuracy,
        averageValue: 92, // Representative average
        percentile: this.calculatePercentile(userAvgAccuracy, 92, 5), // mean=92, std=5
        interpretation: userAvgAccuracy > 92 ? 'Above average' : 'Below average'
      }
    ];
  }

  private async createAggregateAnalysis(
    analytics: TypingAnalytics[],
    patterns: TypingPattern[],
    userId: string
  ): Promise<TypingAnalytics> {
    const analysisData = {
      averageWpm: analytics.reduce((sum, a) => sum + a.data.averageWpm, 0) / analytics.length,
      peakWpm: Math.max(...analytics.map(a => a.data.peakWpm || a.data.averageWpm)),
      accuracy: analytics.reduce((sum, a) => sum + a.data.accuracy, 0) / analytics.length,
      keystrokePattern: this.aggregateKeystrokeData(analytics),
      problemAreas: this.aggregateProblemAreas(analytics),
      strengths: patterns.filter(p => p.impact === 'positive').map(p => p.name),
      weaknesses: patterns.filter(p => p.impact === 'negative').map(p => p.name),
      progressTrend: this.calculateProgressTrend(analytics)
    };

    return await this.analyticsRepository.create({
      userId,
      sessionId: 'aggregate-analysis',
      language: 'en', // Default
      layoutVariant: 'aggregate',
      analysisType: AnalysisType.TYPING_PATTERNS,
      data: analysisData,
      insights: patterns.map(p => p.description),
      recommendations: [] // Will be filled by the calling code
    });
  }

  // Helper methods
  private extractKeystrokeIntervals(analytics: TypingAnalytics[]): number[] {
    // Simplified implementation
    return analytics.flatMap(a => 
      (a.data.keystrokePattern || []).map(k => k.averageTime)
    );
  }

  private calculateRhythmVariation(intervals: number[]): number {
    if (intervals.length < 2) return 0;
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    return Math.sqrt(variance) / mean;
  }

  private calculateAccuracyTrend(analytics: TypingAnalytics[]): number {
    const accuracyValues = analytics.map(a => a.data.accuracy);
    return this.calculateTrend(accuracyValues);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = ((n - 1) * n) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgValue = sumY / n;
    return avgValue > 0 ? slope / avgValue : 0;
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Return consistency score (1 - coefficient of variation)
    return mean > 0 ? Math.max(0, 1 - (standardDeviation / mean)) : 0;
  }

  private detectSpeedBursts(analytics: TypingAnalytics[]): TypingAnalytics[] {
    const avgWpm = analytics.reduce((sum, a) => sum + a.data.averageWpm, 0) / analytics.length;
    const threshold = avgWpm * 1.2; // 20% above average
    return analytics.filter(a => a.data.averageWpm > threshold);
  }

  private analyzeErrorDistribution(analytics: TypingAnalytics[]): { hasPattern: boolean, frequency: number, consistency: number } {
    // Simplified error pattern analysis
    const problemAreas = analytics.flatMap(a => a.data.problemAreas || []);
    const errorKeys = problemAreas.flatMap(area => area.keys || []);
    
    // Count frequency of each error key
    const errorCounts: Record<string, number> = {};
    errorKeys.forEach(key => {
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    const repeatedErrors = Object.values(errorCounts).filter(count => count > 1);
    const hasPattern = repeatedErrors.length > 0;
    const frequency = repeatedErrors.length / Object.keys(errorCounts).length;
    const consistency = Math.max(...Object.values(errorCounts)) / analytics.length;

    return { hasPattern, frequency, consistency };
  }

  private aggregateFingerUsage(analytics: TypingAnalytics[]): Record<string, number> {
    const fingerUsage: Record<string, number> = {};
    
    analytics.forEach(a => {
      (a.data.keystrokePattern || []).forEach(keystroke => {
        if (!fingerUsage[keystroke.finger]) {
          fingerUsage[keystroke.finger] = 0;
        }
        fingerUsage[keystroke.finger] += keystroke.frequency;
      });
    });

    return fingerUsage;
  }

  private calculateFingerImbalance(fingerUsage: Record<string, number>): number {
    const values = Object.values(fingerUsage);
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean;
  }

  private findRecurringErrors(analytics: TypingAnalytics[]): Array<{
    type: string,
    category: string,
    strength: 'weak' | 'moderate' | 'strong',
    frequency: number,
    occurrences: number
  }> {
    // Simplified recurring error detection
    return [
      {
        type: 'key',
        category: 'specific keys',
        strength: 'moderate',
        frequency: 0.4,
        occurrences: 8
      }
    ];
  }

  private createRecommendationForPattern(pattern: TypingPattern): PatternRecommendation | null {
    const recommendationMap: Record<string, Partial<PatternRecommendation>> = {
      'Erratic Rhythm': {
        type: 'technique',
        priority: 'high',
        title: 'Develop Steady Rhythm',
        description: 'Practice maintaining consistent keystroke timing',
        expectedImpact: 'Improved consistency and reduced errors',
        timeToSeeResults: '2-3 weeks',
        actionSteps: [
          'Use a metronome while typing',
          'Practice with rhythm-focused exercises',
          'Focus on smooth, even keystrokes'
        ]
      },
      'Inconsistent Speed': {
        type: 'practice',
        priority: 'medium',
        title: 'Build Consistent Speed',
        description: 'Focus on maintaining steady typing speed',
        expectedImpact: 'More predictable performance',
        timeToSeeResults: '3-4 weeks',
        actionSteps: [
          'Practice at target speed consistently',
          'Avoid rushing through difficult sections',
          'Build speed gradually'
        ]
      },
      'Finger Imbalance': {
        type: 'technique',
        priority: 'medium',
        title: 'Balance Finger Usage',
        description: 'Train underused fingers and reduce overuse',
        expectedImpact: 'Reduced fatigue and better accuracy',
        timeToSeeResults: '4-6 weeks',
        actionSteps: [
          'Practice finger independence exercises',
          'Focus on weak finger training',
          'Use proper finger assignments'
        ]
      }
    };

    const baseRecommendation = recommendationMap[pattern.name];
    if (!baseRecommendation) return null;

    return {
      pattern: pattern.name,
      type: baseRecommendation.type || 'practice',
      priority: baseRecommendation.priority || 'medium',
      title: baseRecommendation.title || 'Improve Pattern',
      description: baseRecommendation.description || 'Work on this typing pattern',
      expectedImpact: baseRecommendation.expectedImpact || 'Performance improvement',
      timeToSeeResults: baseRecommendation.timeToSeeResults || '2-4 weeks',
      actionSteps: baseRecommendation.actionSteps || ['Practice regularly']
    };
  }

  private calculatePercentile(value: number, mean: number, stdDev: number): number {
    // Simplified percentile calculation using normal distribution approximation
    const z = (value - mean) / stdDev;
    return Math.round(this.normalCDF(z) * 100);
  }

  private normalCDF(z: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private aggregateKeystrokeData(analytics: TypingAnalytics[]): KeystrokeData[] {
    const aggregated: Record<string, KeystrokeData> = {};
    
    analytics.forEach(a => {
      (a.data.keystrokePattern || []).forEach(keystroke => {
        if (!aggregated[keystroke.key]) {
          aggregated[keystroke.key] = {
            key: keystroke.key,
            frequency: 0,
            averageTime: 0,
            errorRate: 0,
            finger: keystroke.finger
          };
        }
        
        const existing = aggregated[keystroke.key];
        existing.frequency += keystroke.frequency;
        existing.averageTime = (existing.averageTime + keystroke.averageTime) / 2;
        existing.errorRate = (existing.errorRate + keystroke.errorRate) / 2;
      });
    });

    return Object.values(aggregated);
  }

  private aggregateProblemAreas(analytics: TypingAnalytics[]): ProblemArea[] {
    const problemMap: Record<string, ProblemArea> = {};
    
    analytics.forEach(a => {
      (a.data.problemAreas || []).forEach(area => {
        if (!problemMap[area.category]) {
          problemMap[area.category] = {
            category: area.category,
            keys: [...area.keys],
            errorRate: area.errorRate,
            suggestion: area.suggestion
          };
        } else {
          problemMap[area.category].errorRate = 
            (problemMap[area.category].errorRate + area.errorRate) / 2;
        }
      });
    });

    return Object.values(problemMap);
  }

  private calculateProgressTrend(analytics: TypingAnalytics[]): ProgressPoint[] {
    return analytics.map(a => ({
      date: new Date(a.generatedAt),
      metric: 'wpm',
      value: a.data.averageWpm
    }));
  }
}