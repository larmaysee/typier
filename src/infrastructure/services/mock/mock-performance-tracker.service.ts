/**
 * Mock implementation of IPerformanceTrackerService for development and testing
 */

import { TypingSession } from "@/domain/entities/typing";
import {
  ImprovementMetrics,
  PerformanceAnalysis,
  PracticeRecommendation,
} from "@/domain/interfaces/services";

interface RealtimeMetric {
  timestamp: number;
  sessionId: string;
  wpm: number;
  accuracy: number;
  typedChars: number;
  mistakes: number;
  timeElapsed: number;
}

export interface IPerformanceTrackerService {
  trackRealTimePerformance(session: TypingSession): Promise<void>;
  getPerformanceMetrics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<PerformanceAnalysis>;
  generateRecommendations(userId: string): Promise<PracticeRecommendation[]>;
  calculateImprovementRate(userId: string): Promise<ImprovementMetrics>;
}

export class MockPerformanceTrackerService
  implements IPerformanceTrackerService
{
  private performanceCache: Map<string, PerformanceAnalysis> = new Map();
  private realtimeMetrics: Map<string, RealtimeMetric[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock performance data
    this.performanceCache.set("user1", {
      overallScore: 85,
      strengths: ["High typing speed", "Good accuracy", "Consistent rhythm"],
      weaknesses: ["Occasional finger slips", "Slower on punctuation"],
      layoutEfficiency: {
        "qwerty-us": 92,
        dvorak: 78,
        colemak: 85,
      },
      commonMistakes: [
        {
          character: "q",
          frequency: 15,
          contexts: ["qu", "queue", "quiet"],
        },
        {
          character: "p",
          frequency: 12,
          contexts: ["practice", "people", "appropriate"],
        },
      ],
      typingPattern: {
        peakTimes: [10, 14, 16], // Hours of best performance
        consistencyScore: 78,
        speedVariation: 12.5,
      },
    });
  }

  async trackRealTimePerformance(session: TypingSession): Promise<void> {
    const userId = session.test.userId;

    if (!this.realtimeMetrics.has(userId)) {
      this.realtimeMetrics.set(userId, []);
    }

    const metrics = this.realtimeMetrics.get(userId)!;

    // Track current performance metrics
    const currentMetric = {
      timestamp: Date.now(),
      sessionId: session.id,
      wpm: session.liveStats.currentWPM,
      accuracy: session.liveStats.currentAccuracy,
      typedChars: session.currentInput.length,
      mistakes: session.mistakes.length,
      timeElapsed: session.startTime ? Date.now() - session.startTime : 0,
    };

    metrics.push(currentMetric);

    // Keep only last 100 metrics to prevent memory bloat
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    // Update performance analysis if significant change
    if (metrics.length % 10 === 0) {
      await this.updatePerformanceAnalysis(userId, metrics);
    }
  }

  async getPerformanceMetrics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<PerformanceAnalysis> {
    let analysis = this.performanceCache.get(userId);

    if (!analysis) {
      // Generate default analysis for new users
      analysis = {
        overallScore: 50,
        strengths: ["Getting started"],
        weaknesses: ["More practice needed"],
        layoutEfficiency: {},
        commonMistakes: [],
        typingPattern: {
          peakTimes: [9, 13, 17],
          consistencyScore: 60,
          speedVariation: 20,
        },
      };
      this.performanceCache.set(userId, analysis);
    }

    // Filter by time range if specified
    if (timeRange) {
      const metrics = this.realtimeMetrics.get(userId) || [];
      const filteredMetrics = metrics.filter((m) => {
        const metricDate = new Date(m.timestamp);
        return metricDate >= timeRange.start && metricDate <= timeRange.end;
      });

      if (filteredMetrics.length > 0) {
        return this.generateAnalysisFromMetrics(filteredMetrics);
      }
    }

    return analysis;
  }

  async generateRecommendations(
    userId: string
  ): Promise<PracticeRecommendation[]> {
    const analysis = await this.getPerformanceMetrics(userId);
    const recommendations: PracticeRecommendation[] = [];

    // Speed recommendations
    if (analysis.overallScore < 60) {
      recommendations.push({
        type: "content",
        title: "Focus on Basic Words",
        description:
          "Practice with common words to build muscle memory and speed",
        priority: "high",
        estimatedImpact: 25,
        suggestedDuration: 15,
      });
    }

    // Accuracy recommendations
    if (analysis.commonMistakes.length > 5) {
      recommendations.push({
        type: "content",
        title: "Targeted Mistake Practice",
        description: `Focus on characters: ${analysis.commonMistakes
          .slice(0, 3)
          .map((m) => m.character)
          .join(", ")}`,
        priority: "high",
        estimatedImpact: 20,
        suggestedDuration: 10,
      });
    }

    // Layout recommendations
    const layoutEfficiencies = Object.entries(analysis.layoutEfficiency);
    if (layoutEfficiencies.length > 1) {
      const bestLayout = layoutEfficiencies.reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      const currentEfficiency = Math.max(
        ...layoutEfficiencies.map(([, eff]) => eff)
      );

      if (currentEfficiency < 85) {
        recommendations.push({
          type: "layout",
          title: "Optimize Keyboard Layout",
          description: `Consider using ${bestLayout[0]} layout for better efficiency`,
          priority: "medium",
          estimatedImpact: 15,
          suggestedDuration: 30,
        });
      }
    }

    // Timing recommendations
    if (analysis.typingPattern.consistencyScore < 70) {
      recommendations.push({
        type: "timing",
        title: "Improve Consistency",
        description:
          "Practice maintaining steady rhythm with metronome exercises",
        priority: "medium",
        estimatedImpact: 18,
        suggestedDuration: 20,
      });
    }

    // Difficulty recommendations
    if (analysis.overallScore > 80) {
      recommendations.push({
        type: "difficulty",
        title: "Increase Challenge",
        description: "Try harder difficulty levels or technical content",
        priority: "low",
        estimatedImpact: 10,
        suggestedDuration: 25,
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async calculateImprovementRate(userId: string): Promise<ImprovementMetrics> {
    const metrics = this.realtimeMetrics.get(userId) || [];

    if (metrics.length < 10) {
      return {
        wpmGrowth: 0,
        accuracyGrowth: 0,
        consistencyImprovement: 0,
        timeToNextLevel: 0,
        recommendedPracticeTime: 30,
        // Legacy compatibility
        wpmImprovement: 0,
        accuracyImprovement: 0,
        timeToImprove: 0,
        trendDirection: "stable",
      };
    }

    // Calculate trends using first quarter vs last quarter of metrics
    const quarterSize = Math.floor(metrics.length / 4);
    const earlyMetrics = metrics.slice(0, quarterSize);
    const recentMetrics = metrics.slice(-quarterSize);

    const earlyAvgWpm =
      earlyMetrics.reduce((sum, m) => sum + m.wpm, 0) / earlyMetrics.length;
    const recentAvgWpm =
      recentMetrics.reduce((sum, m) => sum + m.wpm, 0) / recentMetrics.length;

    const earlyAvgAccuracy =
      earlyMetrics.reduce((sum, m) => sum + m.accuracy, 0) /
      earlyMetrics.length;
    const recentAvgAccuracy =
      recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) /
      recentMetrics.length;

    const wpmImprovement = ((recentAvgWpm - earlyAvgWpm) / earlyAvgWpm) * 100;
    const accuracyImprovement =
      ((recentAvgAccuracy - earlyAvgAccuracy) / earlyAvgAccuracy) * 100;

    // Calculate consistency improvement (lower variation is better)
    const earlyWpmVariation = this.calculateVariation(
      earlyMetrics.map((m) => m.wpm)
    );
    const recentWpmVariation = this.calculateVariation(
      recentMetrics.map((m) => m.wpm)
    );
    const consistencyImprovement =
      ((earlyWpmVariation - recentWpmVariation) / earlyWpmVariation) * 100;

    // Determine trend direction
    let trendDirection: "improving" | "stable" | "declining";
    if (wpmImprovement > 5 || accuracyImprovement > 2) {
      trendDirection = "improving";
    } else if (wpmImprovement < -5 || accuracyImprovement < -2) {
      trendDirection = "declining";
    } else {
      trendDirection = "stable";
    }

    // Estimate time to next improvement milestone
    const currentRate = Math.max(wpmImprovement, 0);
    const timeToImprove = currentRate > 0 ? Math.ceil(10 / currentRate) : 30; // Days

    return {
      wpmGrowth: Math.round(wpmImprovement * 100) / 100,
      accuracyGrowth: Math.round(accuracyImprovement * 100) / 100,
      consistencyImprovement: Math.round(consistencyImprovement * 100) / 100,
      timeToNextLevel: timeToImprove,
      recommendedPracticeTime: Math.max(15, 30 - currentRate * 2), // Minutes
      // Legacy compatibility
      wpmImprovement: Math.round(wpmImprovement * 100) / 100,
      accuracyImprovement: Math.round(accuracyImprovement * 100) / 100,
      timeToImprove,
      trendDirection,
    };
  }

  private async updatePerformanceAnalysis(
    userId: string,
    metrics: RealtimeMetric[]
  ): Promise<void> {
    if (metrics.length < 5) return;

    const recentMetrics = metrics.slice(-20); // Last 20 data points
    const analysis = this.generateAnalysisFromMetrics(recentMetrics);

    this.performanceCache.set(userId, analysis);
  }

  private generateAnalysisFromMetrics(
    metrics: RealtimeMetric[]
  ): PerformanceAnalysis {
    const avgWpm = metrics.reduce((sum, m) => sum + m.wpm, 0) / metrics.length;
    const avgAccuracy =
      metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length;
    const avgMistakes =
      metrics.reduce((sum, m) => sum + m.mistakes, 0) / metrics.length;

    const overallScore = Math.round(avgWpm * 0.6 + avgAccuracy * 0.4);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (avgWpm > 60) strengths.push("High typing speed");
    if (avgAccuracy > 95) strengths.push("Excellent accuracy");
    if (avgMistakes < 2) strengths.push("Low error rate");

    if (avgWpm < 30) weaknesses.push("Typing speed needs improvement");
    if (avgAccuracy < 90) weaknesses.push("Accuracy needs attention");
    if (avgMistakes > 5) weaknesses.push("High error rate");

    const wpmValues = metrics.map((m) => m.wpm);
    const wpmVariation = this.calculateVariation(wpmValues);
    const consistencyScore = Math.max(0, 100 - wpmVariation * 2);

    return {
      overallScore,
      strengths,
      weaknesses,
      layoutEfficiency: {}, // Would be calculated from session data
      commonMistakes: [], // Would be extracted from mistake patterns
      typingPattern: {
        peakTimes: [9, 13, 17], // Would be calculated from timestamp patterns
        consistencyScore,
        speedVariation: wpmVariation,
      },
    };
  }

  private calculateVariation(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? (stdDev / mean) * 100 : 0;
  }
}
