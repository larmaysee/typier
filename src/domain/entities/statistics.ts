/**
 * Domain entities for statistics and leaderboard management
 * Contains statistical analysis and ranking logic
 */
import { TypingMode } from '@/domain/enums/typing-mode';
import { LanguageCode } from '@/enums/site-config';

export interface StatisticsTimeFrame {
  readonly startDate: number;
  readonly endDate: number;
  readonly label: string; // e.g., "Last 7 days", "This month"
}

export interface PerformanceTrend {
  readonly date: number;
  readonly wpm: number;
  readonly accuracy: number;
  readonly consistency: number;
}

export class TypingStatistics {
  private constructor(
    public readonly userId: string,
    public readonly language: LanguageCode,
    public readonly mode: TypingMode,
    public readonly totalTests: number,
    public readonly averageWPM: number,
    public readonly bestWPM: number,
    public readonly worstWPM: number,
    public readonly averageAccuracy: number,
    public readonly bestAccuracy: number,
    public readonly worstAccuracy: number,
    public readonly totalTimeTyped: number, // in seconds
    public readonly totalCharactersTyped: number,
    public readonly totalWordsTyped: number, // total words typed across all tests
    public readonly totalErrors: number,
    public readonly improvementRate: number, // WPM improvement per week
    public readonly consistencyScore: number, // 0-100 scale
    public readonly preferredTimeOfDay: number, // Hour of day (0-23)
    public readonly streak: number, // Current consecutive days with tests
    public readonly longestStreak: number,
    public readonly performanceTrends: PerformanceTrend[],
    public readonly lastUpdated: number
  ) {
    if (!userId.trim()) throw new Error('User ID cannot be empty');
    if (totalTests < 0) throw new Error('Total tests cannot be negative');
    if (averageWPM < 0) throw new Error('Average WPM cannot be negative');
    if (bestWPM < 0) throw new Error('Best WPM cannot be negative');
    if (worstWPM < 0) throw new Error('Worst WPM cannot be negative');
    if (averageAccuracy < 0 || averageAccuracy > 100) throw new Error('Average accuracy must be between 0-100');
    if (bestAccuracy < 0 || bestAccuracy > 100) throw new Error('Best accuracy must be between 0-100');
    if (worstAccuracy < 0 || worstAccuracy > 100) throw new Error('Worst accuracy must be between 0-100');
    if (totalTimeTyped < 0) throw new Error('Total time typed cannot be negative');
    if (totalCharactersTyped < 0) throw new Error('Total characters typed cannot be negative');
    if (totalWordsTyped < 0) throw new Error('Total words typed cannot be negative');
    if (totalErrors < 0) throw new Error('Total errors cannot be negative');
    if (consistencyScore < 0 || consistencyScore > 100) throw new Error('Consistency score must be between 0-100');
    if (preferredTimeOfDay < 0 || preferredTimeOfDay > 23) throw new Error('Preferred time of day must be between 0-23');
    if (streak < 0) throw new Error('Streak cannot be negative');
    if (longestStreak < 0) throw new Error('Longest streak cannot be negative');
    if (lastUpdated <= 0) throw new Error('Last updated timestamp must be positive');
  }

  static create(data: {
    userId: string;
    language: LanguageCode;
    mode: TypingMode;
    totalTests?: number;
    averageWPM?: number;
    bestWPM?: number;
    worstWPM?: number;
    averageAccuracy?: number;
    bestAccuracy?: number;
    worstAccuracy?: number;
    totalTimeTyped?: number;
    totalCharactersTyped?: number;
    totalWordsTyped?: number;
    totalErrors?: number;
    improvementRate?: number;
    consistencyScore?: number;
    preferredTimeOfDay?: number;
    streak?: number;
    longestStreak?: number;
    performanceTrends?: PerformanceTrend[];
    lastUpdated?: number;
  }): TypingStatistics {
    return new TypingStatistics(
      data.userId,
      data.language,
      data.mode,
      data.totalTests || 0,
      data.averageWPM || 0,
      data.bestWPM || 0,
      data.worstWPM || 0,
      data.averageAccuracy || 0,
      data.bestAccuracy || 0,
      data.worstAccuracy || 0,
      data.totalTimeTyped || 0,
      data.totalCharactersTyped || 0,
      data.totalWordsTyped || 0,
      data.totalErrors || 0,
      data.improvementRate || 0,
      data.consistencyScore || 0,
      data.preferredTimeOfDay || 12, // Default to noon
      data.streak || 0,
      data.longestStreak || 0,
      data.performanceTrends || [],
      data.lastUpdated || Date.now()
    );
  }

  addTestResult(wpm: number, accuracy: number, duration: number, charactersTyped: number, errors: number): TypingStatistics {
    const newTotalTests = this.totalTests + 1;
    const newTotalTime = this.totalTimeTyped + duration;
    const newTotalCharacters = this.totalCharactersTyped + charactersTyped;
    const newTotalWords = this.totalWordsTyped + Math.round(wpm * (duration / 60)); // Calculate words from WPM and duration
    const newTotalErrors = this.totalErrors + errors;

    // Calculate new averages
    const newAverageWPM = (this.averageWPM * this.totalTests + wpm) / newTotalTests;
    const newAverageAccuracy = (this.averageAccuracy * this.totalTests + accuracy) / newTotalTests;

    // Update best/worst records
    const newBestWPM = Math.max(this.bestWPM, wpm);
    const newWorstWPM = this.totalTests === 0 ? wpm : Math.min(this.worstWPM, wpm);
    const newBestAccuracy = Math.max(this.bestAccuracy, accuracy);
    const newWorstAccuracy = this.totalTests === 0 ? accuracy : Math.min(this.worstAccuracy, accuracy);

    // Calculate consistency score (lower variance = higher consistency)
    const wpmVariance = this.calculateWPMVariance(wpm, newAverageWPM, newTotalTests);
    const newConsistencyScore = Math.max(0, 100 - (wpmVariance * 2));

    // Update performance trends (keep last 30 entries)
    const newTrend: PerformanceTrend = {
      date: Date.now(),
      wpm,
      accuracy,
      consistency: newConsistencyScore
    };
    const updatedTrends = [...this.performanceTrends, newTrend].slice(-30);

    // Calculate improvement rate (WPM improvement per week)
    const newImprovementRate = this.calculateImprovementRate(updatedTrends);

    return new TypingStatistics(
      this.userId,
      this.language,
      this.mode,
      newTotalTests,
      Math.round(newAverageWPM * 100) / 100,
      newBestWPM,
      newWorstWPM,
      Math.round(newAverageAccuracy * 100) / 100,
      newBestAccuracy,
      newWorstAccuracy,
      newTotalTime,
      newTotalCharacters,
      newTotalWords,
      newTotalErrors,
      newImprovementRate,
      Math.round(newConsistencyScore * 100) / 100,
      this.preferredTimeOfDay,
      this.streak,
      this.longestStreak,
      updatedTrends,
      Date.now()
    );
  }

  private calculateWPMVariance(newWPM: number, averageWPM: number, totalTests: number): number {
    if (totalTests <= 1) return 0;

    // Simple variance estimation
    const deviation = Math.abs(newWPM - averageWPM);
    return Math.min(deviation / averageWPM * 100, 50); // Cap at 50% variance
  }

  private calculateImprovementRate(trends: PerformanceTrend[]): number {
    if (trends.length < 2) return 0;

    const recentTrends = trends.slice(-14); // Last 14 tests
    if (recentTrends.length < 2) return 0;

    const firstWPM = recentTrends[0].wpm;
    const lastWPM = recentTrends[recentTrends.length - 1].wpm;
    const timespan = recentTrends[recentTrends.length - 1].date - recentTrends[0].date;

    if (timespan === 0) return 0;

    const improvementPerMs = (lastWPM - firstWPM) / timespan;
    const improvementPerWeek = improvementPerMs * (7 * 24 * 60 * 60 * 1000); // Convert to per week

    return Math.round(improvementPerWeek * 100) / 100;
  }

  updateStreak(isNewTest: boolean, testAccuracy: number): TypingStatistics {
    let newStreak = this.streak;
    let newLongestStreak = this.longestStreak;

    if (isNewTest && testAccuracy >= 85) { // Require 85%+ accuracy to maintain streak
      newStreak++;
      newLongestStreak = Math.max(newLongestStreak, newStreak);
    } else if (isNewTest && testAccuracy < 85) {
      newStreak = 0;
    }

    return new TypingStatistics(
      this.userId,
      this.language,
      this.mode,
      this.totalTests,
      this.averageWPM,
      this.bestWPM,
      this.worstWPM,
      this.averageAccuracy,
      this.bestAccuracy,
      this.worstAccuracy,
      this.totalTimeTyped,
      this.totalCharactersTyped,
      this.totalWordsTyped,
      this.totalErrors,
      this.improvementRate,
      this.consistencyScore,
      this.preferredTimeOfDay,
      newStreak,
      newLongestStreak,
      this.performanceTrends,
      this.lastUpdated
    );
  }

  getErrorRate(): number {
    if (this.totalCharactersTyped === 0) return 0;
    return (this.totalErrors / this.totalCharactersTyped) * 100;
  }

  getTypingSpeed(): 'slow' | 'average' | 'fast' | 'very_fast' {
    if (this.averageWPM < 20) return 'slow';
    if (this.averageWPM < 40) return 'average';
    if (this.averageWPM < 70) return 'fast';
    return 'very_fast';
  }

  getAccuracyLevel(): 'poor' | 'fair' | 'good' | 'excellent' {
    if (this.averageAccuracy < 70) return 'poor';
    if (this.averageAccuracy < 85) return 'fair';
    if (this.averageAccuracy < 95) return 'good';
    return 'excellent';
  }

  getImprovementTrend(): 'declining' | 'stable' | 'improving' {
    if (this.improvementRate < -1) return 'declining';
    if (this.improvementRate < 1) return 'stable';
    return 'improving';
  }

  getRecentPerformance(days: number = 7): PerformanceTrend[] {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.performanceTrends.filter(trend => trend.date >= cutoffDate);
  }

  isValid(): boolean {
    return this.userId.trim().length > 0 &&
      this.totalTests >= 0 &&
      this.averageWPM >= 0 &&
      this.bestWPM >= 0 &&
      this.worstWPM >= 0 &&
      this.averageAccuracy >= 0 && this.averageAccuracy <= 100 &&
      this.bestAccuracy >= 0 && this.bestAccuracy <= 100 &&
      this.worstAccuracy >= 0 && this.worstAccuracy <= 100 &&
      this.totalTimeTyped >= 0 &&
      this.totalCharactersTyped >= 0 &&
      this.totalErrors >= 0 &&
      this.consistencyScore >= 0 && this.consistencyScore <= 100 &&
      this.preferredTimeOfDay >= 0 && this.preferredTimeOfDay <= 23 &&
      this.streak >= 0 &&
      this.longestStreak >= 0 &&
      this.lastUpdated > 0;
  }

  equals(other: TypingStatistics): boolean {
    return this.userId === other.userId &&
      this.language === other.language &&
      this.mode === other.mode;
  }
}

export class LeaderboardEntry {
  private constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly displayName: string,
    public readonly bestWPM: number,
    public readonly averageAccuracy: number,
    public readonly language: LanguageCode,
    public readonly mode: TypingMode,
    public readonly rank: number,
    public readonly score: number, // Composite score for ranking
    public readonly totalTests: number,
    public readonly lastImproved: number,
    public readonly isVerified: boolean,
    public readonly achievementBadges: string[],
    public readonly keyboardLayout?: string, // Optional keyboard layout ID for layout-specific leaderboards
    public readonly timestamp?: number // Optional timestamp for when this entry was last updated
  ) {
    if (!userId.trim()) throw new Error('User ID cannot be empty');
    if (!username.trim()) throw new Error('Username cannot be empty');
    if (bestWPM < 0) throw new Error('Best WPM cannot be negative');
    if (averageAccuracy < 0 || averageAccuracy > 100) throw new Error('Average accuracy must be between 0-100');
    if (rank < 1) throw new Error('Rank must be positive');
    if (score < 0) throw new Error('Score cannot be negative');
    if (totalTests < 0) throw new Error('Total tests cannot be negative');
    if (lastImproved <= 0) throw new Error('Last improved timestamp must be positive');
  }

  // Backwards compatibility getters
  get wpm(): number {
    return this.bestWPM;
  }

  get accuracy(): number {
    return this.averageAccuracy;
  }

  static create(data: {
    userId: string;
    username: string;
    displayName?: string;
    bestWPM: number;
    averageAccuracy: number;
    language: LanguageCode;
    mode: TypingMode;
    rank: number;
    totalTests: number;
    lastImproved: number;
    isVerified?: boolean;
    achievementBadges?: string[];
    keyboardLayout?: string;
    timestamp?: number;
  }): LeaderboardEntry {
    const score = LeaderboardEntry.calculateScore(data.bestWPM, data.averageAccuracy);

    return new LeaderboardEntry(
      data.userId,
      data.username,
      data.displayName || data.username,
      data.bestWPM,
      data.averageAccuracy,
      data.language,
      data.mode,
      data.rank,
      score,
      data.totalTests,
      data.lastImproved,
      data.isVerified || false,
      data.achievementBadges || [],
      data.keyboardLayout,
      data.timestamp
    );
  }

  static calculateScore(wpm: number, accuracy: number): number {
    // Composite score: WPM weighted by accuracy
    // Formula: WPM * (accuracy/100)^2 to heavily penalize low accuracy
    const accuracyMultiplier = Math.pow(accuracy / 100, 2);
    return Math.round(wpm * accuracyMultiplier * 100) / 100;
  }

  updateRank(newRank: number): LeaderboardEntry {
    return new LeaderboardEntry(
      this.userId,
      this.username,
      this.displayName,
      this.bestWPM,
      this.averageAccuracy,
      this.language,
      this.mode,
      newRank,
      this.score,
      this.totalTests,
      this.lastImproved,
      this.isVerified,
      this.achievementBadges,
      this.keyboardLayout,
      this.timestamp
    );
  }

  updatePerformance(newBestWPM: number, newAverageAccuracy: number, newTotalTests: number): LeaderboardEntry {
    const newScore = LeaderboardEntry.calculateScore(newBestWPM, newAverageAccuracy);

    return new LeaderboardEntry(
      this.userId,
      this.username,
      this.displayName,
      newBestWPM,
      newAverageAccuracy,
      this.language,
      this.mode,
      this.rank,
      newScore,
      newTotalTests,
      Date.now(),
      this.isVerified,
      this.achievementBadges,
      this.keyboardLayout,
      this.timestamp
    );
  }

  addAchievementBadge(badgeId: string): LeaderboardEntry {
    if (this.achievementBadges.includes(badgeId)) {
      return this; // Already has this badge
    }

    const updatedBadges = [...this.achievementBadges, badgeId];

    return new LeaderboardEntry(
      this.userId,
      this.username,
      this.displayName,
      this.bestWPM,
      this.averageAccuracy,
      this.language,
      this.mode,
      this.rank,
      this.score,
      this.totalTests,
      this.lastImproved,
      this.isVerified,
      updatedBadges,
      this.keyboardLayout,
      this.timestamp
    );
  }

  verify(): LeaderboardEntry {
    if (this.isVerified) return this;

    return new LeaderboardEntry(
      this.userId,
      this.username,
      this.displayName,
      this.bestWPM,
      this.averageAccuracy,
      this.language,
      this.mode,
      this.rank,
      this.score,
      this.totalTests,
      this.lastImproved,
      true,
      this.achievementBadges,
      this.keyboardLayout,
      this.timestamp
    );
  }

  getRankCategory(): 'top_10' | 'top_100' | 'top_1000' | 'other' {
    if (this.rank <= 10) return 'top_10';
    if (this.rank <= 100) return 'top_100';
    if (this.rank <= 1000) return 'top_1000';
    return 'other';
  }

  getPerformanceLevel(): 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' {
    if (this.bestWPM < 30) return 'beginner';
    if (this.bestWPM < 50) return 'intermediate';
    if (this.bestWPM < 70) return 'advanced';
    if (this.bestWPM < 100) return 'expert';
    return 'master';
  }

  getDaysLastActive(): number {
    const now = Date.now();
    const daysSince = (now - this.lastImproved) / (1000 * 60 * 60 * 24);
    return Math.floor(daysSince);
  }

  isActive(daysThreshold: number = 30): boolean {
    return this.getDaysLastActive() <= daysThreshold;
  }

  isValid(): boolean {
    return this.userId.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.displayName.trim().length > 0 &&
      this.bestWPM >= 0 &&
      this.averageAccuracy >= 0 && this.averageAccuracy <= 100 &&
      this.rank >= 1 &&
      this.score >= 0 &&
      this.totalTests >= 0 &&
      this.lastImproved > 0;
  }

  equals(other: LeaderboardEntry): boolean {
    return this.userId === other.userId &&
      this.language === other.language &&
      this.mode === other.mode;
  }
}