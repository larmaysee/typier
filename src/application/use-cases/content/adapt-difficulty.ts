import { DifficultyLevel } from "@/domain/enums/typing-mode";

export interface UserPerformanceData {
  userId: string;
  averageWpm: number;
  averageAccuracy: number;
  recentSessions: SessionData[];
  weakAreas: WeakArea[];
}

export interface SessionData {
  wpm: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  date: Date;
  mistakes: number;
}

export interface WeakArea {
  category: string;
  keys?: string[];
  errorRate: number;
}

export interface AdaptDifficultyResult {
  recommendedDifficulty: DifficultyLevel;
  reasoning: string;
  adjustments: DifficultyAdjustment[];
}

export interface DifficultyAdjustment {
  parameter: string;
  currentValue: any;
  recommendedValue: any;
  reason: string;
}

export class AdaptDifficultyUseCase {
  async execute(
    userPerformance: UserPerformanceData
  ): Promise<AdaptDifficultyResult> {
    // Analyze user performance trends
    const performanceTrend = this.analyzePerformanceTrend(
      userPerformance.recentSessions
    );
    const competencyLevel = this.assessCompetencyLevel(userPerformance);
    const errorAnalysis = this.analyzeErrors(userPerformance.weakAreas);

    // Determine recommended difficulty
    const recommendedDifficulty = this.calculateRecommendedDifficulty(
      competencyLevel,
      performanceTrend,
      errorAnalysis
    );

    // Generate reasoning and adjustments
    const reasoning = this.generateReasoning(
      competencyLevel,
      performanceTrend,
      errorAnalysis
    );
    const adjustments = this.generateAdjustments(
      userPerformance,
      recommendedDifficulty
    );

    return {
      recommendedDifficulty,
      reasoning,
      adjustments,
    };
  }

  private analyzePerformanceTrend(
    sessions: SessionData[]
  ): "improving" | "stable" | "declining" {
    if (sessions.length < 3) return "stable";

    // Get last 5 sessions for trend analysis
    const recentSessions = sessions.slice(-5);
    const wpmTrend = this.calculateTrend(recentSessions.map((s) => s.wpm));
    const accuracyTrend = this.calculateTrend(
      recentSessions.map((s) => s.accuracy)
    );

    // Weight WPM more than accuracy for overall trend
    const overallTrend = wpmTrend * 0.6 + accuracyTrend * 0.4;

    if (overallTrend > 0.1) return "improving";
    if (overallTrend < -0.1) return "declining";
    return "stable";
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = ((n - 1) * n) / 2; // Sum of indices 0, 1, 2, ..., n-1
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    const sumX2 = values.reduce((sum, _, index) => sum + index * index, 0);

    // Calculate slope of linear regression
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Normalize by average value to get relative trend
    const avgValue = sumY / n;
    return avgValue > 0 ? slope / avgValue : 0;
  }

  private assessCompetencyLevel(
    userPerformance: UserPerformanceData
  ): "beginner" | "intermediate" | "advanced" {
    const { averageWpm, averageAccuracy } = userPerformance;

    // Beginner: < 25 WPM or < 85% accuracy
    if (averageWpm < 25 || averageAccuracy < 85) {
      return "beginner";
    }

    // Advanced: > 50 WPM and > 95% accuracy
    if (averageWpm > 50 && averageAccuracy > 95) {
      return "advanced";
    }

    // Intermediate: everything in between
    return "intermediate";
  }

  private analyzeErrors(weakAreas: WeakArea[]): "high" | "medium" | "low" {
    if (weakAreas.length === 0) return "low";

    const averageErrorRate =
      weakAreas.reduce((sum, area) => sum + area.errorRate, 0) /
      weakAreas.length;

    if (averageErrorRate > 15) return "high";
    if (averageErrorRate > 5) return "medium";
    return "low";
  }

  private calculateRecommendedDifficulty(
    competencyLevel: "beginner" | "intermediate" | "advanced",
    trend: "improving" | "stable" | "declining",
    errorLevel: "high" | "medium" | "low"
  ): DifficultyLevel {
    // Base difficulty from competency level
    let baseDifficulty: DifficultyLevel;

    switch (competencyLevel) {
      case "beginner":
        baseDifficulty = DifficultyLevel.EASY;
        break;
      case "intermediate":
        baseDifficulty = DifficultyLevel.MEDIUM;
        break;
      case "advanced":
        baseDifficulty = DifficultyLevel.HARD;
        break;
    }

    // Adjust based on trend and error level
    if (trend === "improving" && errorLevel === "low") {
      // Can handle higher difficulty
      switch (baseDifficulty) {
        case DifficultyLevel.EASY:
          return DifficultyLevel.MEDIUM;
        case DifficultyLevel.MEDIUM:
          return DifficultyLevel.HARD;
        case DifficultyLevel.HARD:
          return DifficultyLevel.HARD; // Already at max
      }
    }

    if (trend === "declining" || errorLevel === "high") {
      // Should use lower difficulty
      switch (baseDifficulty) {
        case DifficultyLevel.HARD:
          return DifficultyLevel.MEDIUM;
        case DifficultyLevel.MEDIUM:
          return DifficultyLevel.EASY;
        case DifficultyLevel.EASY:
          return DifficultyLevel.EASY; // Already at min
      }
    }

    return baseDifficulty;
  }

  private generateReasoning(
    competencyLevel: string,
    trend: string,
    errorLevel: string
  ): string {
    let reasoning = `Based on your ${competencyLevel} skill level`;

    if (trend === "improving") {
      reasoning += " and consistent improvement, ";
    } else if (trend === "declining") {
      reasoning += " and recent performance decline, ";
    } else {
      reasoning += " and stable performance, ";
    }

    if (errorLevel === "high") {
      reasoning +=
        "I recommend focusing on accuracy with an easier difficulty level.";
    } else if (errorLevel === "low") {
      reasoning +=
        "you're ready for more challenging content to continue growing.";
    } else {
      reasoning +=
        "maintaining current difficulty with minor adjustments would be optimal.";
    }

    return reasoning;
  }

  private generateAdjustments(
    userPerformance: UserPerformanceData,
    recommendedDifficulty: DifficultyLevel
  ): DifficultyAdjustment[] {
    const adjustments: DifficultyAdjustment[] = [];

    // Word count adjustment
    const currentWordCount = 50; // Default
    const recommendedWordCount = this.getRecommendedWordCount(
      recommendedDifficulty
    );

    if (currentWordCount !== recommendedWordCount) {
      adjustments.push({
        parameter: "wordCount",
        currentValue: currentWordCount,
        recommendedValue: recommendedWordCount,
        reason: `${recommendedDifficulty} difficulty typically uses ${recommendedWordCount} words`,
      });
    }

    // Content type adjustment based on weak areas
    if (userPerformance.weakAreas.some((area) => area.category === "numbers")) {
      adjustments.push({
        parameter: "includeNumbers",
        currentValue: false,
        recommendedValue: true,
        reason: "Practice needed with numbers based on error analysis",
      });
    }

    if (userPerformance.weakAreas.some((area) => area.category === "symbols")) {
      adjustments.push({
        parameter: "includeSymbols",
        currentValue: false,
        recommendedValue: true,
        reason: "Practice needed with symbols based on error analysis",
      });
    }

    return adjustments;
  }

  private getRecommendedWordCount(difficulty: DifficultyLevel): number {
    const wordCountMap = {
      [DifficultyLevel.EASY]: 20,
      [DifficultyLevel.MEDIUM]: 40,
      [DifficultyLevel.HARD]: 80,
    };
    return wordCountMap[difficulty];
  }
}
