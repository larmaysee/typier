import { TypingAnalytics } from "../../../domain/entities/typing-analytics";
import { IAnalyticsRepository } from "../../../domain/interfaces/analytics-repository.interface";

export interface CompareSessionPerformanceCommand {
  userId: string;
  sessionIds: string[];
  comparisonType: 'detailed' | 'summary' | 'trends';
  metrics?: ComparisonMetric[];
  groupBy?: 'time' | 'difficulty' | 'layout' | 'content_type';
}

export interface ComparisonMetric {
  name: 'wpm' | 'accuracy' | 'consistency' | 'error_rate' | 'keystroke_pattern';
  weight: number; // 0-1 for weighted comparisons
}

export interface SessionComparisonResult {
  summary: ComparisonSummary;
  sessions: SessionAnalysis[];
  insights: ComparisonInsight[];
  recommendations: ComparisonRecommendation[];
  trends: TrendAnalysis;
  correlations: CorrelationAnalysis[];
}

export interface ComparisonSummary {
  totalSessions: number;
  timeSpan: string;
  bestSession: SessionSummary;
  worstSession: SessionSummary;
  averageMetrics: MetricsSummary;
  improvementRate: number;
  consistencyScore: number;
}

export interface SessionSummary {
  sessionId: string;
  date: string;
  score: number;
  highlightMetric: string;
  highlightValue: number;
}

export interface MetricsSummary {
  wpm: { avg: number; min: number; max: number; stdDev: number };
  accuracy: { avg: number; min: number; max: number; stdDev: number };
  consistency: { avg: number; min: number; max: number; stdDev: number };
  errorRate: { avg: number; min: number; max: number; stdDev: number };
}

export interface SessionAnalysis {
  sessionId: string;
  date: string;
  metrics: SessionMetrics;
  relativePerformance: RelativePerformance;
  standoutFeatures: StandoutFeature[];
  contextFactors: ContextFactor[];
}

export interface SessionMetrics {
  wpm: number;
  accuracy: number;
  consistency: number;
  errorRate: number;
  keystrokeEfficiency: number;
  endurance: number;
}

export interface RelativePerformance {
  rank: number; // 1 = best, N = worst
  percentileRank: number; // 0-100
  deviationFromAverage: Record<string, number>;
  improvementFromPrevious?: Record<string, number>;
}

export interface StandoutFeature {
  metric: string;
  value: number;
  significance: 'excellent' | 'good' | 'concerning' | 'poor';
  description: string;
  context: string;
}

export interface ContextFactor {
  type: 'temporal' | 'content' | 'layout' | 'performance_state';
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface ComparisonInsight {
  type: 'pattern' | 'anomaly' | 'improvement' | 'decline' | 'consistency';
  title: string;
  description: string;
  evidence: InsightEvidence[];
  confidence: number;
  actionable: boolean;
}

export interface InsightEvidence {
  metric: string;
  sessions: string[];
  values: number[];
  statisticalSignificance: number;
}

export interface ComparisonRecommendation {
  type: 'practice' | 'schedule' | 'content' | 'technique';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  actionSteps: string[];
  basedOnSessions: string[];
}

export interface TrendAnalysis {
  overallTrend: 'improving' | 'stable' | 'declining';
  trendStrength: number; // 0-1
  trendMetrics: TrendMetric[];
  projections: PerformanceProjection[];
  volatility: VolatilityAnalysis;
}

export interface TrendMetric {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  rate: number; // change per session
  acceleration: number; // change in rate
  significance: number; // statistical significance
}

export interface PerformanceProjection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  timeframe: string;
  confidence: number;
}

export interface VolatilityAnalysis {
  overall: number; // 0-1, higher = more volatile
  byMetric: Record<string, number>;
  patterns: VolatilityPattern[];
}

export interface VolatilityPattern {
  type: 'cyclical' | 'random' | 'trending';
  period?: string;
  description: string;
}

export interface CorrelationAnalysis {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  significance: number;
  interpretation: string;
  examples: CorrelationExample[];
}

export interface CorrelationExample {
  sessionId: string;
  metric1Value: number;
  metric2Value: number;
  description: string;
}

export class CompareSessionPerformanceUseCase {
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(command: CompareSessionPerformanceCommand): Promise<SessionComparisonResult> {
    // Get analytics data for all requested sessions
    const sessionsData = await this.getSessionsData(command.sessionIds);
    
    if (sessionsData.length < 2) {
      throw new Error("At least 2 sessions are required for comparison");
    }

    // Sort sessions chronologically
    sessionsData.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

    // Generate comparison summary
    const summary = this.generateComparisonSummary(sessionsData, command.metrics);

    // Analyze each session in detail
    const sessions = this.analyzeSessionsInDetail(sessionsData, summary);

    // Generate insights from the comparison
    const insights = this.generateComparisonInsights(sessionsData, sessions);

    // Create recommendations based on analysis
    const recommendations = this.generateComparisonRecommendations(insights, sessions);

    // Perform trend analysis
    const trends = this.analyzeTrends(sessionsData);

    // Find correlations between metrics
    const correlations = this.analyzeCorrelations(sessionsData);

    return {
      summary,
      sessions,
      insights,
      recommendations,
      trends,
      correlations
    };
  }

  private async getSessionsData(sessionIds: string[]): Promise<TypingAnalytics[]> {
    const sessionsData: TypingAnalytics[] = [];
    
    for (const sessionId of sessionIds) {
      const sessionAnalytics = await this.analyticsRepository.findBySessionId(sessionId);
      sessionsData.push(...sessionAnalytics);
    }

    return sessionsData;
  }

  private generateComparisonSummary(
    sessionsData: TypingAnalytics[],
    metrics?: ComparisonMetric[]
  ): ComparisonSummary {
    const wpmValues = sessionsData.map(s => s.data.averageWpm);
    const accuracyValues = sessionsData.map(s => s.data.accuracy);
    
    // Calculate overall metrics
    const avgWpm = this.calculateAverage(wpmValues);
    const avgAccuracy = this.calculateAverage(accuracyValues);
    
    // Find best and worst sessions using composite scoring
    const sessionScores = sessionsData.map((session, index) => ({
      sessionId: session.sessionId,
      date: session.generatedAt.toString(),
      score: this.calculateCompositeScore(session, avgWpm, avgAccuracy),
      session: session,
      index
    }));

    sessionScores.sort((a, b) => b.score - a.score);
    
    const bestSession = {
      sessionId: sessionScores[0].sessionId,
      date: sessionScores[0].date,
      score: sessionScores[0].score,
      highlightMetric: 'WPM',
      highlightValue: sessionScores[0].session.data.averageWpm
    };

    const worstSession = {
      sessionId: sessionScores[sessionScores.length - 1].sessionId,
      date: sessionScores[sessionScores.length - 1].date,
      score: sessionScores[sessionScores.length - 1].score,
      highlightMetric: 'WPM',
      highlightValue: sessionScores[sessionScores.length - 1].session.data.averageWpm
    };

    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(sessionsData);
    
    // Calculate consistency score
    const consistencyScore = this.calculateOverallConsistency(sessionsData);

    // Calculate time span
    const firstDate = new Date(sessionsData[0].generatedAt);
    const lastDate = new Date(sessionsData[sessionsData.length - 1].generatedAt);
    const timeSpan = this.formatTimeSpan(firstDate, lastDate);

    return {
      totalSessions: sessionsData.length,
      timeSpan,
      bestSession,
      worstSession,
      averageMetrics: {
        wpm: this.calculateMetricsSummary(wpmValues),
        accuracy: this.calculateMetricsSummary(accuracyValues),
        consistency: this.calculateMetricsSummary(sessionsData.map(s => s.data.progressTrend?.[0]?.value || 0)),
        errorRate: this.calculateMetricsSummary(sessionsData.map(s => 100 - s.data.accuracy))
      },
      improvementRate,
      consistencyScore
    };
  }

  private analyzeSessionsInDetail(
    sessionsData: TypingAnalytics[],
    summary: ComparisonSummary
  ): SessionAnalysis[] {
    return sessionsData.map((session, index) => {
      const metrics = this.extractSessionMetrics(session);
      const relativePerformance = this.calculateRelativePerformance(session, sessionsData, index);
      const standoutFeatures = this.identifyStandoutFeatures(session, summary.averageMetrics);
      const contextFactors = this.identifyContextFactors(session, sessionsData, index);

      return {
        sessionId: session.sessionId,
        date: session.generatedAt.toString(),
        metrics,
        relativePerformance,
        standoutFeatures,
        contextFactors
      };
    });
  }

  private generateComparisonInsights(
    sessionsData: TypingAnalytics[],
    sessions: SessionAnalysis[]
  ): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];

    // Pattern insights
    const patterns = this.detectPerformancePatterns(sessionsData);
    insights.push(...patterns.map(pattern => ({
      type: 'pattern' as const,
      title: pattern.name,
      description: pattern.description,
      evidence: pattern.evidence,
      confidence: pattern.confidence,
      actionable: pattern.actionable
    })));

    // Anomaly detection
    const anomalies = this.detectAnomalies(sessions);
    insights.push(...anomalies);

    // Improvement insights
    const improvementInsights = this.detectImprovementPatterns(sessionsData);
    insights.push(...improvementInsights);

    return insights;
  }

  private generateComparisonRecommendations(
    insights: ComparisonInsight[],
    sessions: SessionAnalysis[]
  ): ComparisonRecommendation[] {
    const recommendations: ComparisonRecommendation[] = [];

    // Analyze patterns for recommendations
    const strongSessions = sessions.filter(s => s.relativePerformance.percentileRank > 75);
    const weakSessions = sessions.filter(s => s.relativePerformance.percentileRank < 25);

    if (strongSessions.length > 0) {
      const commonFactors = this.findCommonFactors(strongSessions);
      if (commonFactors.length > 0) {
        recommendations.push({
          type: 'schedule',
          priority: 'high',
          title: 'Replicate Optimal Conditions',
          description: 'Your best sessions share common characteristics that can be replicated',
          rationale: `Analysis of top ${strongSessions.length} sessions reveals consistent patterns`,
          expectedImpact: 'Up to 15% improvement in consistency',
          actionSteps: commonFactors.map(f => `Practice during ${f}`),
          basedOnSessions: strongSessions.map(s => s.sessionId)
        });
      }
    }

    if (weakSessions.length > 0) {
      const problemAreas = this.identifyProblemAreas(weakSessions);
      recommendations.push({
        type: 'practice',
        priority: 'medium',
        title: 'Address Weak Areas',
        description: 'Focus practice on areas where performance consistently drops',
        rationale: `Analysis shows recurring issues in ${problemAreas.join(', ')}`,
        expectedImpact: 'Improved baseline performance',
        actionSteps: problemAreas.map(area => `Dedicated practice for ${area}`),
        basedOnSessions: weakSessions.map(s => s.sessionId)
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private analyzeTrends(sessionsData: TypingAnalytics[]): TrendAnalysis {
    const metrics = ['averageWpm', 'accuracy'];
    const trendMetrics: TrendMetric[] = [];

    metrics.forEach(metric => {
      const values = sessionsData.map(s => (s.data as any)[metric]);
      const trend = this.calculateTrendMetric(values);
      
      trendMetrics.push({
        metric,
        direction: trend.slope > 0.01 ? 'up' : trend.slope < -0.01 ? 'down' : 'stable',
        rate: trend.slope,
        acceleration: trend.acceleration,
        significance: trend.significance
      });
    });

    // Overall trend assessment
    const overallSlope = trendMetrics.reduce((sum, tm) => sum + tm.rate, 0) / trendMetrics.length;
    const overallTrend = overallSlope > 0.01 ? 'improving' : overallSlope < -0.01 ? 'declining' : 'stable';

    // Projections
    const projections = this.generateProjections(sessionsData, trendMetrics);

    // Volatility analysis
    const volatility = this.analyzeVolatility(sessionsData);

    return {
      overallTrend,
      trendStrength: Math.abs(overallSlope),
      trendMetrics,
      projections,
      volatility
    };
  }

  private analyzeCorrelations(sessionsData: TypingAnalytics[]): CorrelationAnalysis[] {
    const correlations: CorrelationAnalysis[] = [];
    const metrics = ['averageWpm', 'accuracy'];

    // Analyze pairwise correlations
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = sessionsData.map(s => (s.data as any)[metric1]);
        const values2 = sessionsData.map(s => (s.data as any)[metric2]);
        
        const correlation = this.calculateCorrelation(values1, values2);
        
        correlations.push({
          metric1,
          metric2,
          correlation: correlation.coefficient,
          strength: this.interpretCorrelationStrength(Math.abs(correlation.coefficient)),
          significance: correlation.significance,
          interpretation: this.interpretCorrelation(metric1, metric2, correlation.coefficient),
          examples: this.generateCorrelationExamples(sessionsData, metric1, metric2, values1, values2)
        });
      }
    }

    return correlations;
  }

  // Helper methods
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateMetricsSummary(values: number[]): { avg: number; min: number; max: number; stdDev: number } {
    const avg = this.calculateAverage(values);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { avg, min, max, stdDev };
  }

  private calculateCompositeScore(session: TypingAnalytics, avgWpm: number, avgAccuracy: number): number {
    const wpmScore = (session.data.averageWpm / avgWpm) * 50;
    const accuracyScore = (session.data.accuracy / avgAccuracy) * 50;
    return wpmScore + accuracyScore;
  }

  private calculateImprovementRate(sessionsData: TypingAnalytics[]): number {
    if (sessionsData.length < 2) return 0;
    
    const firstWpm = sessionsData[0].data.averageWpm;
    const lastWpm = sessionsData[sessionsData.length - 1].data.averageWpm;
    
    return ((lastWpm - firstWpm) / firstWpm) * 100;
  }

  private calculateOverallConsistency(sessionsData: TypingAnalytics[]): number {
    const wpmValues = sessionsData.map(s => s.data.averageWpm);
    const mean = this.calculateAverage(wpmValues);
    const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation
    
    return Math.max(0, 100 - (cv * 100)); // Convert to consistency score
  }

  private formatTimeSpan(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Same day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  }

  private extractSessionMetrics(session: TypingAnalytics): SessionMetrics {
    return {
      wpm: session.data.averageWpm,
      accuracy: session.data.accuracy,
      consistency: 85, // Placeholder calculation
      errorRate: 100 - session.data.accuracy,
      keystrokeEfficiency: 90, // Placeholder calculation
      endurance: 88 // Placeholder calculation
    };
  }

  private calculateRelativePerformance(
    session: TypingAnalytics,
    allSessions: TypingAnalytics[],
    currentIndex: number
  ): RelativePerformance {
    const scores = allSessions.map(s => this.calculateCompositeScore(s, 0, 0));
    const currentScore = scores[currentIndex];
    
    // Calculate rank
    const sortedScores = [...scores].sort((a, b) => b - a);
    const rank = sortedScores.indexOf(currentScore) + 1;
    
    // Calculate percentile
    const percentileRank = ((allSessions.length - rank + 1) / allSessions.length) * 100;
    
    // Calculate deviations from average
    const avgWpm = this.calculateAverage(allSessions.map(s => s.data.averageWpm));
    const avgAccuracy = this.calculateAverage(allSessions.map(s => s.data.accuracy));
    
    const deviationFromAverage = {
      wpm: session.data.averageWpm - avgWpm,
      accuracy: session.data.accuracy - avgAccuracy
    };

    // Calculate improvement from previous session
    let improvementFromPrevious: Record<string, number> | undefined;
    if (currentIndex > 0) {
      const prevSession = allSessions[currentIndex - 1];
      improvementFromPrevious = {
        wpm: session.data.averageWpm - prevSession.data.averageWpm,
        accuracy: session.data.accuracy - prevSession.data.accuracy
      };
    }

    return {
      rank,
      percentileRank,
      deviationFromAverage,
      improvementFromPrevious
    };
  }

  private identifyStandoutFeatures(session: TypingAnalytics, averageMetrics: MetricsSummary): StandoutFeature[] {
    const features: StandoutFeature[] = [];
    
    const wpmDeviation = (session.data.averageWpm - averageMetrics.wpm.avg) / averageMetrics.wpm.stdDev;
    if (Math.abs(wpmDeviation) > 1.5) {
      features.push({
        metric: 'WPM',
        value: session.data.averageWpm,
        significance: wpmDeviation > 1.5 ? 'excellent' : 'concerning',
        description: `${Math.abs(wpmDeviation).toFixed(1)} standard deviations ${wpmDeviation > 0 ? 'above' : 'below'} average`,
        context: 'Speed performance'
      });
    }

    const accuracyDeviation = (session.data.accuracy - averageMetrics.accuracy.avg) / averageMetrics.accuracy.stdDev;
    if (Math.abs(accuracyDeviation) > 1.5) {
      features.push({
        metric: 'Accuracy',
        value: session.data.accuracy,
        significance: accuracyDeviation > 1.5 ? 'excellent' : 'concerning',
        description: `${Math.abs(accuracyDeviation).toFixed(1)} standard deviations ${accuracyDeviation > 0 ? 'above' : 'below'} average`,
        context: 'Accuracy performance'
      });
    }

    return features;
  }

  private identifyContextFactors(
    session: TypingAnalytics,
    allSessions: TypingAnalytics[],
    index: number
  ): ContextFactor[] {
    const factors: ContextFactor[] = [];
    
    // Temporal factors
    const sessionDate = new Date(session.generatedAt);
    const hour = sessionDate.getHours();
    
    if (hour >= 6 && hour <= 10) {
      factors.push({
        type: 'temporal',
        factor: 'Morning session',
        impact: 'positive',
        confidence: 0.7
      });
    } else if (hour >= 22 || hour <= 2) {
      factors.push({
        type: 'temporal',
        factor: 'Late night session',
        impact: 'negative',
        confidence: 0.6
      });
    }

    return factors;
  }

  private detectPerformancePatterns(sessionsData: TypingAnalytics[]): Array<{
    name: string;
    description: string;
    evidence: InsightEvidence[];
    confidence: number;
    actionable: boolean;
  }> {
    // Simplified pattern detection
    return [
      {
        name: 'Consistency Pattern',
        description: 'Performance shows consistent patterns across sessions',
        evidence: [{
          metric: 'consistency',
          sessions: sessionsData.slice(0, 3).map(s => s.sessionId),
          values: [85, 87, 86],
          statisticalSignificance: 0.8
        }],
        confidence: 0.8,
        actionable: true
      }
    ];
  }

  private detectAnomalies(sessions: SessionAnalysis[]): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];
    
    // Find sessions with extremely high or low percentile ranks
    const outliers = sessions.filter(s => s.relativePerformance.percentileRank > 90 || s.relativePerformance.percentileRank < 10);
    
    outliers.forEach(outlier => {
      insights.push({
        type: 'anomaly',
        title: outlier.relativePerformance.percentileRank > 90 ? 'Exceptional Performance' : 'Performance Dip',
        description: `Session ${outlier.sessionId} shows ${outlier.relativePerformance.percentileRank > 90 ? 'exceptional' : 'concerning'} performance`,
        evidence: [{
          metric: 'composite_score',
          sessions: [outlier.sessionId],
          values: [outlier.relativePerformance.percentileRank],
          statisticalSignificance: 0.9
        }],
        confidence: 0.85,
        actionable: true
      });
    });

    return insights;
  }

  private detectImprovementPatterns(sessionsData: TypingAnalytics[]): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];
    
    const wpmValues = sessionsData.map(s => s.data.averageWpm);
    const trend = this.calculateTrendMetric(wpmValues);
    
    if (trend.slope > 0.5) {
      insights.push({
        type: 'improvement',
        title: 'Strong Improvement Trend',
        description: 'Your typing speed shows consistent improvement across sessions',
        evidence: [{
          metric: 'wpm',
          sessions: sessionsData.map(s => s.sessionId),
          values: wpmValues,
          statisticalSignificance: trend.significance
        }],
        confidence: Math.min(0.95, trend.significance),
        actionable: true
      });
    }

    return insights;
  }

  private calculateTrendMetric(values: number[]): { slope: number; acceleration: number; significance: number } {
    if (values.length < 3) return { slope: 0, acceleration: 0, significance: 0 };
    
    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + (val * values[i]), 0);
    const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Calculate acceleration (second derivative approximation)
    const midpoint = Math.floor(n / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    
    const firstSlope = this.calculateSlope(firstHalf);
    const secondSlope = this.calculateSlope(secondHalf);
    const acceleration = secondSlope - firstSlope;
    
    // Calculate R-squared for significance
    const yMean = sumY / n;
    const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const predictedY = x.map(xi => (slope * xi) + ((sumY - slope * sumX) / n));
    const residualSumSquares = values.reduce((sum, val, i) => sum + Math.pow(val - predictedY[i], 2), 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      slope,
      acceleration,
      significance: Math.max(0, rSquared)
    };
  }

  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + (val * values[i]), 0);
    const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private generateProjections(sessionsData: TypingAnalytics[], trendMetrics: TrendMetric[]): PerformanceProjection[] {
    const projections: PerformanceProjection[] = [];
    
    trendMetrics.forEach(tm => {
      const currentValue = sessionsData[sessionsData.length - 1].data.averageWpm; // Simplified
      const projectedValue = currentValue + (tm.rate * 10); // Project 10 sessions ahead
      
      projections.push({
        metric: tm.metric,
        currentValue,
        projectedValue,
        timeframe: '10 sessions',
        confidence: tm.significance
      });
    });

    return projections;
  }

  private analyzeVolatility(sessionsData: TypingAnalytics[]): VolatilityAnalysis {
    const wpmValues = sessionsData.map(s => s.data.averageWpm);
    const wpmVolatility = this.calculateVolatility(wpmValues);
    
    return {
      overall: wpmVolatility,
      byMetric: {
        wpm: wmpVolatility,
        accuracy: this.calculateVolatility(sessionsData.map(s => s.data.accuracy))
      },
      patterns: [
        {
          type: 'random',
          description: 'Performance varies randomly without clear patterns'
        }
      ]
    };
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = this.calculateAverage(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance) / mean;
    
    return Math.min(1, volatility);
  }

  private calculateCorrelation(values1: number[], values2: number[]): { coefficient: number; significance: number } {
    if (values1.length !== values2.length || values1.length < 3) {
      return { coefficient: 0, significance: 0 };
    }
    
    const n = values1.length;
    const sum1 = values1.reduce((sum, val) => sum + val, 0);
    const sum2 = values2.reduce((sum, val) => sum + val, 0);
    const sum1Sq = values1.reduce((sum, val) => sum + (val * val), 0);
    const sum2Sq = values2.reduce((sum, val) => sum + (val * val), 0);
    const sum12 = values1.reduce((sum, val, i) => sum + (val * values2[i]), 0);
    
    const numerator = (n * sum12) - (sum1 * sum2);
    const denominator = Math.sqrt(((n * sum1Sq) - (sum1 * sum1)) * ((n * sum2Sq) - (sum2 * sum2)));
    
    const coefficient = denominator === 0 ? 0 : numerator / denominator;
    const significance = Math.abs(coefficient); // Simplified significance
    
    return { coefficient, significance };
  }

  private interpretCorrelationStrength(coefficient: number): 'strong' | 'moderate' | 'weak' | 'none' {
    if (coefficient >= 0.7) return 'strong';
    if (coefficient >= 0.4) return 'moderate';
    if (coefficient >= 0.1) return 'weak';
    return 'none';
  }

  private interpretCorrelation(metric1: string, metric2: string, coefficient: number): string {
    const direction = coefficient > 0 ? 'positive' : 'negative';
    const strength = this.interpretCorrelationStrength(Math.abs(coefficient));
    
    return `${metric1} and ${metric2} show a ${strength} ${direction} correlation`;
  }

  private generateCorrelationExamples(
    sessionsData: TypingAnalytics[],
    metric1: string,
    metric2: string,
    values1: number[],
    values2: number[]
  ): CorrelationExample[] {
    return sessionsData.slice(0, 3).map((session, index) => ({
      sessionId: session.sessionId,
      metric1Value: values1[index],
      metric2Value: values2[index],
      description: `Session ${index + 1} example`
    }));
  }

  private findCommonFactors(sessions: SessionAnalysis[]): string[] {
    // Simplified common factor identification
    const factors: string[] = [];
    
    // Check for common temporal patterns
    const morningSessions = sessions.filter(s => {
      const hour = new Date(s.date).getHours();
      return hour >= 6 && hour <= 10;
    });
    
    if (morningSessions.length > sessions.length * 0.6) {
      factors.push('morning hours');
    }

    return factors;
  }

  private identifyProblemAreas(sessions: SessionAnalysis[]): string[] {
    const problemAreas: string[] = [];
    
    // Check for consistently low metrics
    const lowAccuracySessions = sessions.filter(s => s.metrics.accuracy < 90);
    if (lowAccuracySessions.length > sessions.length * 0.5) {
      problemAreas.push('accuracy');
    }
    
    const lowSpeedSessions = sessions.filter(s => s.metrics.wpm < 30);
    if (lowSpeedSessions.length > sessions.length * 0.5) {
      problemAreas.push('typing speed');
    }

    return problemAreas;
  }
}