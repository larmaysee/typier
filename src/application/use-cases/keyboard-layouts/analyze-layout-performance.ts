import { TypingAnalytics, AnalysisType } from "../../../domain/entities/typing-analytics";
import { KeyboardLayout } from "../../../domain/entities/keyboard-layout";
import { IAnalyticsRepository } from "../../../domain/interfaces/analytics-repository.interface";
import { IKeyboardLayoutRepository } from "../../../domain/interfaces/keyboard-layout-repository.interface";
import { KeyboardLayoutVariant } from "../../../domain/enums/keyboard-layout-variant";

export interface AnalyzeLayoutPerformanceCommand {
  userId: string;
  layoutId: string;
  timeRangeInDays?: number;
  compareWith?: string[]; // Other layout IDs to compare
}

export interface LayoutPerformanceResult {
  layout: KeyboardLayout;
  analytics: LayoutAnalytics;
  comparison?: LayoutComparison;
  recommendations: LayoutRecommendation[];
}

export interface LayoutAnalytics {
  totalSessions: number;
  averageWpm: number;
  averageAccuracy: number;
  improvementRate: number; // WPM per day
  consistencyScore: number; // 0-100
  fingerUtilization: FingerUtilization;
  problemKeys: ProblemKey[];
  strengthAreas: StrengthArea[];
  usagePattern: UsagePattern;
}

export interface LayoutComparison {
  layouts: LayoutComparisonData[];
  bestPerformingLayout: string;
  recommendations: string[];
}

export interface LayoutComparisonData {
  layoutId: string;
  layoutName: string;
  averageWpm: number;
  averageAccuracy: number;
  consistencyScore: number;
  recommendationScore: number;
}

export interface FingerUtilization {
  leftHand: number; // 0-100%
  rightHand: number; // 0-100%
  fingerDistribution: Record<string, number>;
  overusedFingers: string[];
  underusedFingers: string[];
}

export interface ProblemKey {
  key: string;
  errorRate: number;
  averageTime: number;
  finger: string;
  suggestions: string[];
}

export interface StrengthArea {
  category: string;
  keys: string[];
  score: number;
  description: string;
}

export interface UsagePattern {
  preferredSessions: 'morning' | 'afternoon' | 'evening';
  averageSessionLength: number;
  peakPerformanceTime: string;
  fatigueFactor: number;
}

export interface LayoutRecommendation {
  type: 'key_position' | 'finger_training' | 'practice_focus' | 'layout_switch';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: string;
  actionItems: string[];
}

export class AnalyzeLayoutPerformanceUseCase {
  constructor(
    private analyticsRepository: IAnalyticsRepository,
    private keyboardLayoutRepository: IKeyboardLayoutRepository
  ) {}

  async execute(command: AnalyzeLayoutPerformanceCommand): Promise<LayoutPerformanceResult> {
    // Get layout information
    const layout = await this.keyboardLayoutRepository.findById(command.layoutId);
    if (!layout) {
      throw new Error("Layout not found");
    }

    // Get analytics data for the layout
    const timeRangeInDays = command.timeRangeInDays || 30;
    const analytics = await this.getLayoutAnalytics(
      command.userId, 
      command.layoutId, 
      timeRangeInDays
    );

    // Generate comparison if requested
    let comparison: LayoutComparison | undefined;
    if (command.compareWith && command.compareWith.length > 0) {
      comparison = await this.generateLayoutComparison(
        command.userId,
        command.layoutId,
        command.compareWith,
        timeRangeInDays
      );
    }

    // Generate recommendations
    const recommendations = await this.generateRecommendations(analytics, layout);

    return {
      layout,
      analytics,
      comparison,
      recommendations
    };
  }

  private async getLayoutAnalytics(
    userId: string, 
    layoutId: string, 
    timeRangeInDays: number
  ): Promise<LayoutAnalytics> {
    // Get all analytics data for this user and layout
    const allAnalytics = await this.analyticsRepository.findByUserId(userId);
    const layoutAnalytics = allAnalytics.filter(a => 
      a.layoutVariant === layoutId && 
      this.isWithinTimeRange(a.generatedAt, timeRangeInDays)
    );

    if (layoutAnalytics.length === 0) {
      throw new Error("No analytics data found for this layout");
    }

    // Calculate aggregate metrics
    const totalSessions = layoutAnalytics.length;
    const averageWpm = this.calculateAverage(layoutAnalytics.map(a => a.data.averageWpm));
    const averageAccuracy = this.calculateAverage(layoutAnalytics.map(a => a.data.accuracy));
    
    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(layoutAnalytics);
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(layoutAnalytics);
    
    // Analyze finger utilization
    const fingerUtilization = this.analyzeFingerUtilization(layoutAnalytics);
    
    // Identify problem keys
    const problemKeys = this.identifyProblemKeys(layoutAnalytics);
    
    // Identify strength areas
    const strengthAreas = this.identifyStrengthAreas(layoutAnalytics);
    
    // Analyze usage patterns
    const usagePattern = this.analyzeUsagePattern(layoutAnalytics);

    return {
      totalSessions,
      averageWpm,
      averageAccuracy,
      improvementRate,
      consistencyScore,
      fingerUtilization,
      problemKeys,
      strengthAreas,
      usagePattern
    };
  }

  private async generateLayoutComparison(
    userId: string,
    primaryLayoutId: string,
    compareLayoutIds: string[],
    timeRangeInDays: number
  ): Promise<LayoutComparison> {
    const comparisons: LayoutComparisonData[] = [];
    
    // Include the primary layout
    const primaryAnalytics = await this.getLayoutAnalytics(userId, primaryLayoutId, timeRangeInDays);
    const primaryLayout = await this.keyboardLayoutRepository.findById(primaryLayoutId);
    
    comparisons.push({
      layoutId: primaryLayoutId,
      layoutName: primaryLayout?.displayName || primaryLayoutId,
      averageWpm: primaryAnalytics.averageWpm,
      averageAccuracy: primaryAnalytics.averageAccuracy,
      consistencyScore: primaryAnalytics.consistencyScore,
      recommendationScore: this.calculateRecommendationScore(primaryAnalytics)
    });

    // Add comparison layouts
    for (const layoutId of compareLayoutIds) {
      try {
        const analytics = await this.getLayoutAnalytics(userId, layoutId, timeRangeInDays);
        const layout = await this.keyboardLayoutRepository.findById(layoutId);
        
        comparisons.push({
          layoutId,
          layoutName: layout?.displayName || layoutId,
          averageWpm: analytics.averageWpm,
          averageAccuracy: analytics.averageAccuracy,
          consistencyScore: analytics.consistencyScore,
          recommendationScore: this.calculateRecommendationScore(analytics)
        });
      } catch (error) {
        // Skip layouts with no data
        continue;
      }
    }

    // Find best performing layout
    const bestLayout = comparisons.reduce((best, current) => 
      current.recommendationScore > best.recommendationScore ? current : best
    );

    // Generate comparison recommendations
    const recommendations = this.generateComparisonRecommendations(comparisons, primaryLayoutId);

    return {
      layouts: comparisons,
      bestPerformingLayout: bestLayout.layoutId,
      recommendations
    };
  }

  private async generateRecommendations(
    analytics: LayoutAnalytics,
    layout: KeyboardLayout
  ): Promise<LayoutRecommendation[]> {
    const recommendations: LayoutRecommendation[] = [];

    // Problem key recommendations
    if (analytics.problemKeys.length > 0) {
      const topProblemKeys = analytics.problemKeys
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 3);

      recommendations.push({
        type: 'practice_focus',
        priority: 'high',
        title: 'Focus on Problem Keys',
        description: `You have high error rates on keys: ${topProblemKeys.map(k => k.key).join(', ')}`,
        expectedImprovement: 'Up to 15% accuracy improvement',
        actionItems: [
          'Practice these keys in isolation',
          'Use slow, deliberate movements',
          'Focus on correct finger placement'
        ]
      });
    }

    // Finger utilization recommendations
    if (analytics.fingerUtilization.overusedFingers.length > 0) {
      recommendations.push({
        type: 'finger_training',
        priority: 'medium',
        title: 'Balance Finger Usage',
        description: `Overused fingers: ${analytics.fingerUtilization.overusedFingers.join(', ')}`,
        expectedImprovement: 'Reduced fatigue and better consistency',
        actionItems: [
          'Practice exercises for underused fingers',
          'Consider layout modifications',
          'Focus on proper hand positioning'
        ]
      });
    }

    // Consistency recommendations
    if (analytics.consistencyScore < 70) {
      recommendations.push({
        type: 'practice_focus',
        priority: 'medium',
        title: 'Improve Consistency',
        description: 'Your typing speed varies significantly between sessions',
        expectedImprovement: 'More predictable performance',
        actionItems: [
          'Practice at consistent times',
          'Maintain steady rhythm',
          'Avoid rushing through difficult sections'
        ]
      });
    }

    // Layout-specific recommendations
    if (layout.isCustom) {
      const layoutScore = this.calculateLayoutEfficiencyScore(analytics, layout);
      if (layoutScore < 70) {
        recommendations.push({
          type: 'key_position',
          priority: 'low',
          title: 'Consider Layout Optimization',
          description: 'Your custom layout may have room for improvement',
          expectedImprovement: 'Better key accessibility and reduced strain',
          actionItems: [
            'Analyze key frequency vs. position',
            'Consider finger load distribution',
            'Review difficult key combinations'
          ]
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateImprovementRate(analytics: TypingAnalytics[]): number {
    if (analytics.length < 2) return 0;
    
    const sortedAnalytics = analytics.sort((a, b) => 
      new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
    );
    
    const firstWpm = sortedAnalytics[0].data.averageWpm;
    const lastWpm = sortedAnalytics[sortedAnalytics.length - 1].data.averageWpm;
    const daysDiff = (new Date(sortedAnalytics[sortedAnalytics.length - 1].generatedAt).getTime() - 
                     new Date(sortedAnalytics[0].generatedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? (lastWpm - firstWpm) / daysDiff : 0;
  }

  private calculateConsistencyScore(analytics: TypingAnalytics[]): number {
    const wpmValues = analytics.map(a => a.data.averageWpm);
    const mean = this.calculateAverage(wpmValues);
    const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    return Math.min(100, consistencyScore);
  }

  private analyzeFingerUtilization(analytics: TypingAnalytics[]): FingerUtilization {
    // Aggregate keystroke data across all analytics
    const allKeystrokes = analytics.flatMap(a => a.data.keystrokePattern || []);
    const fingerCounts: Record<string, number> = {};
    
    allKeystrokes.forEach(keystroke => {
      if (!fingerCounts[keystroke.finger]) {
        fingerCounts[keystroke.finger] = 0;
      }
      fingerCounts[keystroke.finger] += keystroke.frequency;
    });

    const totalKeystrokes = Object.values(fingerCounts).reduce((sum, count) => sum + count, 0);
    const fingerDistribution: Record<string, number> = {};
    
    Object.entries(fingerCounts).forEach(([finger, count]) => {
      fingerDistribution[finger] = totalKeystrokes > 0 ? (count / totalKeystrokes) * 100 : 0;
    });

    // Calculate hand distribution
    const leftFingers = ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-thumb'];
    const rightFingers = ['right-pinky', 'right-ring', 'right-middle', 'right-index', 'right-thumb'];
    
    const leftHand = leftFingers.reduce((sum, finger) => sum + (fingerDistribution[finger] || 0), 0);
    const rightHand = rightFingers.reduce((sum, finger) => sum + (fingerDistribution[finger] || 0), 0);

    // Identify over/under used fingers (more than 15% or less than 5%)
    const overusedFingers = Object.entries(fingerDistribution)
      .filter(([_, usage]) => usage > 15)
      .map(([finger]) => finger);
    
    const underusedFingers = Object.entries(fingerDistribution)
      .filter(([_, usage]) => usage < 5)
      .map(([finger]) => finger);

    return {
      leftHand,
      rightHand,
      fingerDistribution,
      overusedFingers,
      underusedFingers
    };
  }

  private identifyProblemKeys(analytics: TypingAnalytics[]): ProblemKey[] {
    const keyProblems: Record<string, { totalErrors: number, totalTime: number, count: number, finger: string }> = {};
    
    analytics.forEach(a => {
      (a.data.keystrokePattern || []).forEach(keystroke => {
        if (!keyProblems[keystroke.key]) {
          keyProblems[keystroke.key] = { totalErrors: 0, totalTime: 0, count: 0, finger: keystroke.finger };
        }
        
        keyProblems[keystroke.key].totalErrors += keystroke.errorRate * keystroke.frequency;
        keyProblems[keystroke.key].totalTime += keystroke.averageTime * keystroke.frequency;
        keyProblems[keystroke.key].count += keystroke.frequency;
      });
    });

    return Object.entries(keyProblems)
      .map(([key, data]) => ({
        key,
        errorRate: data.count > 0 ? data.totalErrors / data.count : 0,
        averageTime: data.count > 0 ? data.totalTime / data.count : 0,
        finger: data.finger,
        suggestions: this.generateKeySuggestions(key, data.totalErrors / data.count)
      }))
      .filter(pk => pk.errorRate > 5) // Only include keys with >5% error rate
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  private identifyStrengthAreas(analytics: TypingAnalytics[]): StrengthArea[] {
    const strengths: StrengthArea[] = [];
    
    // Analyze consistent high performance areas
    const consistentHighAccuracy = analytics.filter(a => a.data.accuracy > 95);
    if (consistentHighAccuracy.length > analytics.length * 0.7) {
      strengths.push({
        category: 'accuracy',
        keys: [],
        score: 90,
        description: 'Consistently high accuracy across sessions'
      });
    }

    const consistentHighSpeed = analytics.filter(a => a.data.averageWpm > 50);
    if (consistentHighSpeed.length > analytics.length * 0.7) {
      strengths.push({
        category: 'speed',
        keys: [],
        score: 85,
        description: 'Consistently high typing speed'
      });
    }

    return strengths;
  }

  private analyzeUsagePattern(analytics: TypingAnalytics[]): UsagePattern {
    // Simplified usage pattern analysis
    const sessions = analytics.map(a => ({
      date: new Date(a.generatedAt),
      wpm: a.data.averageWpm
    }));

    const averageSessionLength = 15; // Placeholder
    const peakPerformanceTime = '10:00 AM'; // Placeholder
    const fatigueFactor = 0.8; // Placeholder

    return {
      preferredSessions: 'morning', // Placeholder
      averageSessionLength,
      peakPerformanceTime,
      fatigueFactor
    };
  }

  private generateKeySuggestions(key: string, errorRate: number): string[] {
    const suggestions = ['Practice this key in isolation'];
    
    if (errorRate > 20) {
      suggestions.push('Check finger positioning');
      suggestions.push('Slow down for this key');
    }
    
    if (errorRate > 10) {
      suggestions.push('Focus on muscle memory');
    }
    
    return suggestions;
  }

  private calculateRecommendationScore(analytics: LayoutAnalytics): number {
    // Weighted score calculation
    const wpmScore = Math.min(100, analytics.averageWpm * 2); // Max at 50 WPM
    const accuracyScore = analytics.averageAccuracy;
    const consistencyScore = analytics.consistencyScore;
    
    return (wpmScore * 0.4) + (accuracyScore * 0.4) + (consistencyScore * 0.2);
  }

  private calculateLayoutEfficiencyScore(analytics: LayoutAnalytics, layout: KeyboardLayout): number {
    // Simplified efficiency calculation
    let score = 70; // Base score
    
    if (analytics.problemKeys.length < 3) score += 15;
    if (analytics.fingerUtilization.overusedFingers.length === 0) score += 10;
    if (analytics.consistencyScore > 80) score += 5;
    
    return Math.min(100, score);
  }

  private generateComparisonRecommendations(
    comparisons: LayoutComparisonData[],
    primaryLayoutId: string
  ): string[] {
    const recommendations: string[] = [];
    const primary = comparisons.find(c => c.layoutId === primaryLayoutId);
    const best = comparisons.reduce((best, current) => 
      current.recommendationScore > best.recommendationScore ? current : best
    );

    if (primary && best.layoutId !== primaryLayoutId) {
      recommendations.push(`Consider switching to ${best.layoutName} for better overall performance`);
      
      if (best.averageWpm > primary.averageWpm) {
        recommendations.push(`${best.layoutName} shows ${(best.averageWpm - primary.averageWpm).toFixed(1)} WPM improvement`);
      }
      
      if (best.averageAccuracy > primary.averageAccuracy) {
        recommendations.push(`${best.layoutName} shows ${(best.averageAccuracy - primary.averageAccuracy).toFixed(1)}% better accuracy`);
      }
    }

    return recommendations;
  }

  private isWithinTimeRange(date: Date, daysBack: number): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return new Date(date) >= cutoffDate;
  }
}