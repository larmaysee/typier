import { TypingResults, LiveTypingStats, TypingSession } from "../entities";

/**
 * Performance metrics for analysis
 */
export interface PerformanceMetrics {
  /** Words per minute */
  wpm: number;
  /** Accuracy percentage */
  accuracy: number;
  /** Consistency score */
  consistency: number;
  /** Typing rhythm (keystrokes per interval) */
  rhythm: number[];
  /** Error rate per character */
  errorRate: number;
  /** Speed over time */
  speedOverTime: { time: number; wpm: number }[];
  /** Finger utilization */
  fingerUtilization: Record<string, number>;
  /** Most common mistakes */
  commonMistakes: { character: string; count: number }[];
}

/**
 * Improvement recommendation
 */
export interface ImprovementRecommendation {
  /** Recommendation type */
  type: 'accuracy' | 'speed' | 'consistency' | 'posture';
  /** Severity level */
  severity: 'low' | 'medium' | 'high';
  /** Recommendation message */
  message: string;
  /** Specific areas to focus on */
  focusAreas: string[];
  /** Suggested exercises */
  suggestedExercises?: string[];
}

/**
 * Progress tracking information
 */
export interface ProgressInfo {
  /** Current performance level */
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Improvement trend */
  trend: 'improving' | 'stable' | 'declining';
  /** Performance history */
  history: PerformanceMetrics[];
  /** Goals vs actual performance */
  goals: {
    targetWpm: number;
    targetAccuracy: number;
    actualWpm: number;
    actualAccuracy: number;
  };
}

/**
 * Performance tracker service interface
 */
export interface IPerformanceTrackerService {
  /**
   * Calculate real-time typing metrics
   */
  calculateLiveMetrics(
    currentInput: string,
    targetText: string,
    startTime: number,
    mistakes: any[]
  ): LiveTypingStats;

  /**
   * Calculate final performance metrics
   */
  calculateFinalResults(session: TypingSession): TypingResults;

  /**
   * Track typing rhythm and patterns
   */
  analyzeTypingRhythm(keystrokes: Array<{ key: string; timestamp: number }>): number[];

  /**
   * Calculate finger utilization
   */
  calculateFingerUtilization(
    text: string,
    keyboardLayout: string
  ): Record<string, number>;

  /**
   * Calculate consistency score
   */
  calculateConsistency(speedOverTime: { time: number; wpm: number }[]): number;
}

/**
 * Improvement analyzer service interface
 */
export interface IImprovementAnalyzerService {
  /**
   * Analyze user performance and provide recommendations
   */
  analyzePerformance(
    userId: string,
    recentSessions: TypingSession[]
  ): Promise<ImprovementRecommendation[]>;

  /**
   * Track user progress over time
   */
  trackProgress(userId: string): Promise<ProgressInfo>;

  /**
   * Identify weak points in typing
   */
  identifyWeakPoints(
    sessions: TypingSession[]
  ): Promise<{ character: string; accuracy: number; avgSpeed: number }[]>;

  /**
   * Generate personalized training content
   */
  generateTrainingContent(
    userId: string,
    weakPoints: string[]
  ): Promise<string>;

  /**
   * Compare performance with similar users
   */
  compareWithPeers(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<{
    percentile: number;
    averageWpm: number;
    averageAccuracy: number;
  }>;
}