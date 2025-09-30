import {
  IImprovementAnalyzerService,
  ImprovementRecommendation,
  ProgressInfo,
  PerformanceMetrics
} from "@/domain/interfaces";
import { TypingSession } from "@/domain/entities";

/**
 * Service for analyzing user improvement and providing recommendations
 */
export class ImprovementAnalyzerService implements IImprovementAnalyzerService {

  async analyzePerformance(
    userId: string,
    recentSessions: TypingSession[]
  ): Promise<ImprovementRecommendation[]> {
    if (recentSessions.length === 0) {
      return this.getBeginnerRecommendations();
    }

    const recommendations: ImprovementRecommendation[] = [];
    const metrics = this.calculateAverageMetrics(recentSessions);

    // Analyze accuracy
    if (metrics.accuracy < 85) {
      recommendations.push({
        type: 'accuracy',
        severity: 'high',
        message: 'Focus on accuracy before speed. Slow down and aim for 95%+ accuracy.',
        focusAreas: ['accuracy', 'precision'],
        suggestedExercises: [
          'Practice typing slowly with perfect accuracy',
          'Focus on problematic characters identified in your mistakes',
          'Use accuracy-focused typing drills'
        ]
      });
    } else if (metrics.accuracy < 95) {
      recommendations.push({
        type: 'accuracy',
        severity: 'medium',
        message: 'Good accuracy, but aim for 95%+ for optimal typing experience.',
        focusAreas: ['accuracy', 'common mistakes'],
        suggestedExercises: [
          'Practice common mistake patterns',
          'Slow down on difficult character combinations'
        ]
      });
    }

    // Analyze speed
    if (metrics.wpm < 30) {
      recommendations.push({
        type: 'speed',
        severity: 'medium',
        message: 'Focus on building muscle memory for faster typing.',
        focusAreas: ['speed', 'muscle memory'],
        suggestedExercises: [
          'Practice home row keys',
          'Work on finger placement',
          'Use metronome-based typing exercises'
        ]
      });
    } else if (metrics.wpm < 60) {
      recommendations.push({
        type: 'speed',
        severity: 'low',
        message: 'Good progress! Continue practicing to reach proficient speeds.',
        focusAreas: ['speed', 'rhythm'],
        suggestedExercises: [
          'Practice typing common word patterns',
          'Focus on typing rhythm and flow',
          'Gradually increase target WPM'
        ]
      });
    }

    // Analyze consistency
    if (metrics.consistency < 70) {
      recommendations.push({
        type: 'consistency',
        severity: 'medium',
        message: 'Work on maintaining steady typing rhythm throughout the test.',
        focusAreas: ['consistency', 'rhythm'],
        suggestedExercises: [
          'Practice maintaining steady pace',
          'Focus on even finger pressure',
          'Use metronome to develop consistent rhythm'
        ]
      });
    }

    // Analyze finger utilization
    const fingerAnalysis = this.analyzeFingerUtilization(metrics);
    if (fingerAnalysis.needsImprovement) {
      recommendations.push({
        type: 'posture',
        severity: 'medium',
        message: 'Improve finger utilization for better typing efficiency.',
        focusAreas: ['finger placement', 'hand position'],
        suggestedExercises: [
          `Focus on ${fingerAnalysis.underusedFingers.join(', ')} exercises`,
          'Practice proper finger placement',
          'Work on finger independence'
        ]
      });
    }

    return recommendations;
  }

  async trackProgress(userId: string): Promise<ProgressInfo> {
    // Note: userId parameter used for future data fetching implementation
    // In a real implementation, this would fetch historical data for the user
    // For now, return a mock progress info

    const currentLevel = this.determineSkillLevel(0, 0); // Would use actual metrics

    return {
      currentLevel,
      trend: 'improving', // Would be calculated from historical data
      history: [], // Would contain historical performance metrics
      goals: {
        targetWpm: this.getTargetWpmForLevel(currentLevel),
        targetAccuracy: 95,
        actualWpm: 0, // Would be current average
        actualAccuracy: 0 // Would be current average
      }
    };
  }

  async identifyWeakPoints(
    sessions: TypingSession[]
  ): Promise<Array<{ character: string; accuracy: number; avgSpeed: number }>> {
    const characterStats = new Map<string, { correct: number; total: number; totalTime: number }>();

    // Analyze mistakes across all sessions
    for (const session of sessions) {
      const targetText = session.test.textContent;
      const typedText = session.currentInput;
      const sessionTime = session.liveStats.timeElapsed;

      // Track character-level performance
      const minLength = Math.min(targetText.length, typedText.length);
      for (let i = 0; i < minLength; i++) {
        const char = targetText[i];

        if (!characterStats.has(char)) {
          characterStats.set(char, { correct: 0, total: 0, totalTime: 0 });
        }

        const stats = characterStats.get(char)!;
        stats.total++;
        stats.totalTime += sessionTime / targetText.length; // Approximate time per character

        if (targetText[i] === typedText[i]) {
          stats.correct++;
        }
      }

      // Also track mistakes explicitly
      for (const mistake of session.mistakes) {
        const char = mistake.expected;

        if (!characterStats.has(char)) {
          characterStats.set(char, { correct: 0, total: 0, totalTime: 0 });
        }

        const stats = characterStats.get(char)!;
        stats.total++;
        // Don't increment correct count for explicit mistakes
      }
    }

    // Convert to weak points (characters with low accuracy)
    const weakPoints: Array<{ character: string; accuracy: number; avgSpeed: number }> = [];

    for (const [character, stats] of characterStats) {
      if (stats.total >= 3) { // Only consider characters typed at least 3 times
        const accuracy = (stats.correct / stats.total) * 100;
        const avgSpeed = stats.totalTime > 0 ? 60 / (stats.totalTime / stats.total) : 0; // Characters per minute

        if (accuracy < 85 || character === ' ') { // Include space and low-accuracy characters
          weakPoints.push({
            character: character === ' ' ? '[space]' : character,
            accuracy: Math.round(accuracy * 100) / 100,
            avgSpeed: Math.round(avgSpeed * 100) / 100
          });
        }
      }
    }

    // Sort by accuracy (lowest first)
    return weakPoints.sort((a, b) => a.accuracy - b.accuracy).slice(0, 10);
  }

  async generateTrainingContent(
    userId: string,
    weakPoints: string[]
  ): Promise<string> {
    if (weakPoints.length === 0) {
      return "the quick brown fox jumps over the lazy dog";
    }

    // Create training content focusing on weak characters
    const trainingWords: string[] = [];
    const commonWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
      'our', 'had', 'have', 'what', 'were', 'they', 'said', 'each', 'which', 'their',
      'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first',
      'well', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long',
      'down', 'day', 'did', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'old',
      'see', 'two', 'way', 'may', 'say', 'she', 'use', 'her', 'many', 'some', 'very'
    ];

    // Filter words that contain weak characters
    for (const word of commonWords) {
      for (const weakChar of weakPoints) {
        const char = weakChar === '[space]' ? ' ' : weakChar;
        if (word.includes(char.toLowerCase())) {
          trainingWords.push(word);
          break;
        }
      }
    }

    // If not enough words found, add character-focused exercises
    if (trainingWords.length < 20) {
      for (const weakChar of weakPoints.slice(0, 5)) {
        if (weakChar !== '[space]' && /[a-zA-Z]/.test(weakChar)) {
          // Add character repetition
          trainingWords.push(weakChar.repeat(3));
          // Add character combinations
          trainingWords.push(weakChar + 'a');
          trainingWords.push('a' + weakChar);
        }
      }
    }

    // Ensure we have enough content
    while (trainingWords.length < 30) {
      trainingWords.push(...commonWords.slice(0, 30 - trainingWords.length));
    }

    return trainingWords.slice(0, 50).join(' ');
  }

  async compareWithPeers(
    userId: string,
    metrics: PerformanceMetrics
  ): Promise<{
    percentile: number;
    averageWpm: number;
    averageAccuracy: number;
  }> {
    // In a real implementation, this would query actual user data
    // For now, return mock comparison data

    const averageWpm = 40; // Global average
    const averageAccuracy = 90; // Global average

    // Calculate approximate percentile based on WPM
    let percentile = 50; // Default to median

    if (metrics.wpm >= 80) percentile = 95;
    else if (metrics.wpm >= 70) percentile = 90;
    else if (metrics.wpm >= 60) percentile = 80;
    else if (metrics.wpm >= 50) percentile = 70;
    else if (metrics.wpm >= 40) percentile = 60;
    else if (metrics.wpm >= 30) percentile = 40;
    else if (metrics.wpm >= 20) percentile = 20;
    else percentile = 10;

    // Adjust for accuracy
    if (metrics.accuracy >= 98) percentile += 5;
    else if (metrics.accuracy >= 95) percentile += 2;
    else if (metrics.accuracy < 85) percentile -= 10;

    return {
      percentile: Math.max(1, Math.min(99, percentile)),
      averageWpm,
      averageAccuracy
    };
  }

  private getBeginnerRecommendations(): ImprovementRecommendation[] {
    return [
      {
        type: 'posture',
        severity: 'high',
        message: 'Start with proper typing fundamentals for long-term success.',
        focusAreas: ['posture', 'finger placement'],
        suggestedExercises: [
          'Learn proper sitting posture',
          'Practice home row finger placement',
          'Focus on using all fingers correctly'
        ]
      },
      {
        type: 'accuracy',
        severity: 'high',
        message: 'Begin with accuracy-focused practice before building speed.',
        focusAreas: ['accuracy', 'muscle memory'],
        suggestedExercises: [
          'Start with home row keys (asdf jkl;)',
          'Practice each finger slowly',
          'Maintain 95%+ accuracy before increasing speed'
        ]
      }
    ];
  }

  private calculateAverageMetrics(sessions: TypingSession[]): PerformanceMetrics {
    if (sessions.length === 0) {
      return {
        wpm: 0,
        accuracy: 100,
        consistency: 100,
        rhythm: [],
        errorRate: 0,
        speedOverTime: [],
        fingerUtilization: {},
        commonMistakes: []
      };
    }

    const totalWpm = sessions.reduce((sum, session) => sum + session.liveStats.currentWPM, 0);
    const totalAccuracy = sessions.reduce((sum, session) => sum + session.liveStats.currentAccuracy, 0);

    // Calculate average consistency (simplified)
    const consistencySum = sessions.reduce((sum, session) => {
      const wpmVariation = Math.abs(session.liveStats.currentWPM - (totalWpm / sessions.length));
      return sum + Math.max(0, 100 - wpmVariation);
    }, 0);

    return {
      wpm: Math.round(totalWpm / sessions.length),
      accuracy: Math.round(totalAccuracy / sessions.length),
      consistency: Math.round(consistencySum / sessions.length),
      rhythm: [],
      errorRate: sessions.reduce((sum, session) => sum + session.mistakes.length, 0) / sessions.length,
      speedOverTime: [],
      fingerUtilization: {},
      commonMistakes: []
    };
  }

  private analyzeFingerUtilization(metrics: PerformanceMetrics): {
    needsImprovement: boolean;
    underusedFingers: string[];
  } {
    // Note: metrics parameter available for future finger analysis implementation
    // This is a simplified analysis
    // In reality, would analyze actual finger utilization data
    return {
      needsImprovement: false,
      underusedFingers: []
    };
  }

  private determineSkillLevel(wpm: number, accuracy: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (wpm >= 70 && accuracy >= 95) return 'expert';
    if (wpm >= 50 && accuracy >= 90) return 'advanced';
    if (wpm >= 30 && accuracy >= 85) return 'intermediate';
    return 'beginner';
  }

  private getTargetWpmForLevel(level: string): number {
    switch (level) {
      case 'beginner': return 30;
      case 'intermediate': return 50;
      case 'advanced': return 70;
      case 'expert': return 90;
      default: return 40;
    }
  }
}