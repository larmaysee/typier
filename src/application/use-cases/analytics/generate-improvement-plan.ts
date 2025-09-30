import { IAnalyticsRepository } from "@/domain/interfaces/analytics-repository.interface";

export interface GenerateImprovementPlanCommand {
  userId: string;
  currentPerformance: UserPerformanceSnapshot;
  goals: ImprovementGoal[];
  timeframe: "short" | "medium" | "long"; // 1 month, 3 months, 6+ months
  preferredPracticeTime?: number; // minutes per day
  constraints?: PracticeConstraint[];
}

export interface UserPerformanceSnapshot {
  averageWpm: number;
  averageAccuracy: number;
  consistency: number;
  strongAreas: string[];
  weakAreas: string[];
  recentTrend: "improving" | "stable" | "declining";
  typingStyle: "touch" | "hybrid" | "hunt-peck";
  experienceLevel: "beginner" | "intermediate" | "advanced";
}

export interface ImprovementGoal {
  type: "wpm" | "accuracy" | "consistency" | "endurance" | "specific_skill";
  target: number;
  priority: "high" | "medium" | "low";
  description?: string;
}

export interface PracticeConstraint {
  type: "time" | "physical" | "equipment" | "schedule";
  description: string;
  impact: "minor" | "moderate" | "major";
}

export interface ImprovementPlanResult {
  plan: ImprovementPlan;
  milestones: Milestone[];
  practiceSchedule: ImprovementPracticeSchedule;
  recommendations: CoachingRecommendation[];
  progressTracking: ProgressTrackingPlan;
}

export interface ImprovementPlan {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  phases: ImprovementPhase[];
  expectedOutcomes: ImprovementExpectedOutcome[];
  riskFactors: RiskFactor[];
}

export interface ImprovementPhase {
  phase: number;
  name: string;
  duration: string;
  objectives: PhaseObjective[];
  practiceTypes: PracticeType[];
  successCriteria: SuccessCriteria;
  transitionConditions: string[];
}

export interface PhaseObjective {
  type: "skill" | "metric" | "habit";
  description: string;
  target: string;
  priority: "critical" | "important" | "nice-to-have";
}

export interface PracticeType {
  name: string;
  description: string;
  frequency: string;
  duration: number; // minutes
  focusAreas: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface SuccessCriteria {
  primary: string[];
  secondary: string[];
  measurements: MeasurementCriteria[];
}

export interface MeasurementCriteria {
  metric: string;
  target: number;
  tolerance: number;
  timeframe: string;
}

export interface ImprovementExpectedOutcome {
  metric: string;
  baseline: number;
  target: number;
  timeline: string;
  confidence: number; // 0-1
}

export interface RiskFactor {
  risk: string;
  probability: "low" | "medium" | "high";
  impact: "minor" | "moderate" | "severe";
  mitigation: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  metrics: MilestoneMetric[];
  celebrationSuggestion: string;
}

export interface MilestoneMetric {
  name: string;
  target: number;
  current?: number;
  unit: string;
}

export interface ImprovementPracticeSchedule {
  weeklyPattern: WeeklyPattern;
  dailySessions: DailySession[];
  adaptiveRules: AdaptiveRule[];
}

export interface WeeklyPattern {
  totalSessions: number;
  restDays: number[];
  intenseDays: number[];
  lightDays: number[];
}

export interface DailySession {
  dayOfWeek: number;
  recommendedTime: string;
  duration: number;
  intensity: "light" | "moderate" | "intense";
  focus: string[];
}

export interface AdaptiveRule {
  condition: string;
  action: string;
  explanation: string;
}

export interface CoachingRecommendation {
  category: "technique" | "mindset" | "environment" | "health";
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  actionItems: string[];
  resources?: string[];
}

export interface ProgressTrackingPlan {
  keyMetrics: KeyMetric[];
  checkpointFrequency: "daily" | "weekly" | "biweekly";
  assessmentSchedule: AssessmentSchedule[];
  alertConditions: AlertCondition[];
}

export interface KeyMetric {
  name: string;
  description: string;
  trackingMethod: string;
  target: number;
  units: string;
}

export interface AssessmentSchedule {
  type: "self-assessment" | "benchmark-test" | "progress-review";
  frequency: string;
  duration: number;
  checklist: string[];
}

export interface AlertCondition {
  condition: string;
  action: string;
  severity: "info" | "warning" | "critical";
}

export class GenerateImprovementPlanUseCase {
  constructor(private analyticsRepository: IAnalyticsRepository) { }

  async execute(
    command: GenerateImprovementPlanCommand
  ): Promise<ImprovementPlanResult> {
    // Analyze current state and generate personalized plan
    const planStructure = this.generatePlanStructure(command);

    // Create detailed phases based on goals and constraints
    const phases = this.createImprovementPhases(command, planStructure);

    // Generate milestones and schedule
    const milestones = this.generateMilestones(command, phases);
    const practiceSchedule = this.createPracticeSchedule(command);

    // Create coaching recommendations
    const recommendations = this.generateCoachingRecommendations(command);

    // Set up progress tracking
    const progressTracking = this.createProgressTrackingPlan(command);

    // Assemble the complete plan
    const plan: ImprovementPlan = {
      id: `plan-${command.userId}-${Date.now()}`,
      title: this.generatePlanTitle(command),
      description: this.generatePlanDescription(command),
      timeframe: this.getTimeframeDescription(command.timeframe),
      phases,
      expectedOutcomes: this.calculateExpectedOutcomes(command, phases),
      riskFactors: this.identifyRiskFactors(command),
    };

    return {
      plan,
      milestones,
      practiceSchedule,
      recommendations,
      progressTracking,
    };
  }

  private generatePlanStructure(
    command: GenerateImprovementPlanCommand
  ): "foundation" | "progression" | "optimization" {
    const { currentPerformance } = command;

    // Determine overall approach based on experience level and current performance
    if (
      currentPerformance.experienceLevel === "beginner" ||
      currentPerformance.typingStyle !== "touch"
    ) {
      return "foundation";
    } else if (
      currentPerformance.averageWpm < 50 ||
      currentPerformance.averageAccuracy < 90
    ) {
      return "progression";
    } else {
      return "optimization";
    }
  }

  private createImprovementPhases(
    command: GenerateImprovementPlanCommand,
    structure: string
  ): ImprovementPhase[] {
    const phases: ImprovementPhase[] = [];

    switch (structure) {
      case "foundation":
        phases.push(...this.createFoundationPhases(command));
        break;
      case "progression":
        phases.push(...this.createProgressionPhases(command));
        break;
      case "optimization":
        phases.push(...this.createOptimizationPhases(command));
        break;
    }

    return phases;
  }

  private createFoundationPhases(
    command: GenerateImprovementPlanCommand
  ): ImprovementPhase[] {
    const { timeframe } = command;

    const phases: ImprovementPhase[] = [
      {
        phase: 1,
        name: "Touch Typing Foundation",
        duration: timeframe === "short" ? "2 weeks" : "3-4 weeks",
        objectives: [
          {
            type: "skill",
            description: "Master home row keys",
            target: "Type all home row keys without looking",
            priority: "critical",
          },
          {
            type: "habit",
            description: "Establish proper finger positioning",
            target: "Consistent finger placement on home row",
            priority: "critical",
          },
        ],
        practiceTypes: [
          {
            name: "Home Row Drills",
            description: "Repetitive practice of home row keys",
            frequency: "Daily",
            duration: 10,
            focusAreas: ["finger placement", "muscle memory"],
            difficulty: "easy",
          },
        ],
        successCriteria: {
          primary: [
            "Can type all home row keys accurately",
            "Maintains proper posture",
          ],
          secondary: ["Feels comfortable with finger positioning"],
          measurements: [
            {
              metric: "home_row_accuracy",
              target: 95,
              tolerance: 2,
              timeframe: "end of phase",
            },
          ],
        },
        transitionConditions: [
          "Home row accuracy >95%",
          "Comfortable finger positioning",
        ],
      },
      {
        phase: 2,
        name: "Basic Key Expansion",
        duration: timeframe === "short" ? "2 weeks" : "3-4 weeks",
        objectives: [
          {
            type: "skill",
            description: "Learn all alphabetic keys",
            target: "Type alphabet without looking",
            priority: "critical",
          },
          {
            type: "metric",
            description: "Build basic speed",
            target: "15-20 WPM",
            priority: "important",
          },
        ],
        practiceTypes: [
          {
            name: "Letter Expansion",
            description: "Progressive addition of new keys",
            frequency: "Daily",
            duration: 15,
            focusAreas: ["new keys", "finger reach"],
            difficulty: "medium",
          },
        ],
        successCriteria: {
          primary: ["Can type all letters", "Maintains accuracy above 90%"],
          secondary: ["Shows consistent improvement"],
          measurements: [
            {
              metric: "wpm",
              target: 15,
              tolerance: 3,
              timeframe: "end of phase",
            },
          ],
        },
        transitionConditions: ["All letters mastered", "Speed >15 WPM"],
      },
    ];

    return phases;
  }

  private createProgressionPhases(
    command: GenerateImprovementPlanCommand
  ): ImprovementPhase[] {
    const { goals, timeframe } = command;

    const speedGoal = goals.find((g) => g.type === "wpm");
    const accuracyGoal = goals.find((g) => g.type === "accuracy");

    return [
      {
        phase: 1,
        name: "Speed Building",
        duration: timeframe === "short" ? "3 weeks" : "6-8 weeks",
        objectives: [
          {
            type: "metric",
            description: "Increase typing speed",
            target: speedGoal ? `${speedGoal.target} WPM` : "40 WPM",
            priority: "critical",
          },
          {
            type: "skill",
            description: "Develop typing rhythm",
            target: "Consistent keystroke timing",
            priority: "important",
          },
        ],
        practiceTypes: [
          {
            name: "Speed Drills",
            description: "Timed typing exercises",
            frequency: "Daily",
            duration: 20,
            focusAreas: ["speed", "rhythm"],
            difficulty: "medium",
          },
        ],
        successCriteria: {
          primary: ["Reaches target speed", "Maintains rhythm"],
          secondary: ["Shows consistent progress"],
          measurements: [
            {
              metric: "wpm",
              target: speedGoal?.target || 40,
              tolerance: 5,
              timeframe: "end of phase",
            },
          ],
        },
        transitionConditions: [
          "Target speed achieved",
          "Consistent performance",
        ],
      },
      {
        phase: 2,
        name: "Accuracy Refinement",
        duration: timeframe === "short" ? "2 weeks" : "4-6 weeks",
        objectives: [
          {
            type: "metric",
            description: "Improve accuracy",
            target: accuracyGoal ? `${accuracyGoal.target}%` : "95%",
            priority: "critical",
          },
          {
            type: "skill",
            description: "Eliminate common errors",
            target: "Reduce error rate by 50%",
            priority: "important",
          },
        ],
        practiceTypes: [
          {
            name: "Accuracy Focus",
            description: "Slow, deliberate typing",
            frequency: "Daily",
            duration: 15,
            focusAreas: ["accuracy", "error reduction"],
            difficulty: "medium",
          },
        ],
        successCriteria: {
          primary: ["Reaches target accuracy", "Fewer repeated errors"],
          secondary: ["Maintains speed while improving accuracy"],
          measurements: [
            {
              metric: "accuracy",
              target: accuracyGoal?.target || 95,
              tolerance: 1,
              timeframe: "end of phase",
            },
          ],
        },
        transitionConditions: [
          "Target accuracy achieved",
          "Error patterns eliminated",
        ],
      },
    ];
  }

  private createOptimizationPhases(
    command: GenerateImprovementPlanCommand
  ): ImprovementPhase[] {
    return [
      {
        phase: 1,
        name: "Performance Optimization",
        duration: command.timeframe === "short" ? "4 weeks" : "8-12 weeks",
        objectives: [
          {
            type: "metric",
            description: "Peak performance",
            target: "Maximize speed while maintaining accuracy",
            priority: "critical",
          },
          {
            type: "skill",
            description: "Advanced techniques",
            target: "Master difficult key combinations",
            priority: "important",
          },
        ],
        practiceTypes: [
          {
            name: "Advanced Drills",
            description: "Complex text and specialized content",
            frequency: "Daily",
            duration: 25,
            focusAreas: ["peak performance", "consistency"],
            difficulty: "hard",
          },
        ],
        successCriteria: {
          primary: ["Achieves personal best", "Consistent high performance"],
          secondary: ["Handles complex content well"],
          measurements: [
            {
              metric: "peak_wpm",
              target: command.currentPerformance.averageWpm * 1.3,
              tolerance: 5,
              timeframe: "end of phase",
            },
          ],
        },
        transitionConditions: [
          "Peak performance achieved",
          "Consistency maintained",
        ],
      },
    ];
  }

  private generateMilestones(
    command: GenerateImprovementPlanCommand,
    phases: ImprovementPhase[]
  ): Milestone[] {
    const milestones: Milestone[] = [];
    let currentDate = new Date();

    phases.forEach((phase, index) => {
      // Calculate target date based on phase duration
      const phaseDurationWeeks = this.parseDuration(phase.duration);
      currentDate = new Date(
        currentDate.getTime() + phaseDurationWeeks * 7 * 24 * 60 * 60 * 1000
      );

      milestones.push({
        id: `milestone-${index + 1}`,
        name: `Complete ${phase.name}`,
        description: `Successfully finish phase ${phase.phase} of your improvement plan`,
        targetDate: currentDate.toISOString().split("T")[0],
        metrics: this.extractPhaseMetrics(phase),
        celebrationSuggestion: this.generateCelebrationSuggestion(phase.name),
      });
    });

    return milestones;
  }

  private createPracticeSchedule(
    command: GenerateImprovementPlanCommand
  ): ImprovementPracticeSchedule {
    const dailyTime = command.preferredPracticeTime || 20;

    // Determine optimal schedule based on available time and constraints
    const intensity =
      dailyTime >= 30 ? "intense" : dailyTime >= 20 ? "moderate" : "light";

    return {
      weeklyPattern: {
        totalSessions: dailyTime >= 20 ? 6 : 5,
        restDays: [0], // Sunday
        intenseDays: [2, 4], // Tuesday, Thursday
        lightDays: [6], // Saturday
      },
      dailySessions: this.generateDailySessions(dailyTime, intensity),
      adaptiveRules: [
        {
          condition: "Performance decline for 2 consecutive days",
          action: "Reduce intensity and add extra rest",
          explanation: "Prevents burnout and allows recovery",
        },
        {
          condition: "Ahead of milestone targets",
          action: "Introduce challenge exercises",
          explanation: "Maintains engagement and accelerates progress",
        },
      ],
    };
  }

  private generateCoachingRecommendations(
    command: GenerateImprovementPlanCommand
  ): CoachingRecommendation[] {
    const recommendations: CoachingRecommendation[] = [];

    // Technique recommendations based on current performance
    if (command.currentPerformance.typingStyle !== "touch") {
      recommendations.push({
        category: "technique",
        title: "Transition to Touch Typing",
        description:
          "Learning proper touch typing technique is fundamental for long-term improvement",
        importance: "high",
        actionItems: [
          "Practice without looking at the keyboard",
          "Use proper finger positioning on home row",
          "Build muscle memory through repetition",
        ],
        resources: ["Touch typing tutorials", "Finger positioning guides"],
      });
    }

    // Mindset recommendations
    recommendations.push({
      category: "mindset",
      title: "Focus on Consistency Over Speed",
      description:
        "Consistent practice yields better long-term results than sporadic intensive sessions",
      importance: "high",
      actionItems: [
        "Set realistic daily practice goals",
        "Track progress regularly",
        "Celebrate small improvements",
      ],
    });

    // Environment recommendations
    recommendations.push({
      category: "environment",
      title: "Optimize Your Practice Environment",
      description: "A proper setup reduces fatigue and improves focus",
      importance: "medium",
      actionItems: [
        "Ensure proper chair and desk height",
        "Use good lighting",
        "Minimize distractions during practice",
      ],
    });

    return recommendations;
  }

  private createProgressTrackingPlan(
    command: GenerateImprovementPlanCommand
  ): ProgressTrackingPlan {
    return {
      keyMetrics: [
        {
          name: "Words Per Minute",
          description: "Average typing speed across sessions",
          trackingMethod: "Automatic during practice sessions",
          target: command.goals.find((g) => g.type === "wpm")?.target || 40,
          units: "WPM",
        },
        {
          name: "Accuracy",
          description: "Percentage of correctly typed characters",
          trackingMethod: "Automatic during practice sessions",
          target:
            command.goals.find((g) => g.type === "accuracy")?.target || 95,
          units: "%",
        },
      ],
      checkpointFrequency: "weekly",
      assessmentSchedule: [
        {
          type: "self-assessment",
          frequency: "Weekly",
          duration: 5,
          checklist: [
            "Rate comfort level with current exercises",
            "Identify any pain or discomfort",
            "Note areas of difficulty",
          ],
        },
        {
          type: "benchmark-test",
          frequency: "Bi-weekly",
          duration: 10,
          checklist: [
            "Complete standardized typing test",
            "Record WPM and accuracy",
            "Note improvement trends",
          ],
        },
      ],
      alertConditions: [
        {
          condition: "No improvement for 2 weeks",
          action: "Review practice approach and adjust difficulty",
          severity: "warning",
        },
        {
          condition: "Accuracy drops below 85%",
          action: "Focus on accuracy over speed",
          severity: "critical",
        },
      ],
    };
  }

  // Helper methods
  private generatePlanTitle(command: GenerateImprovementPlanCommand): string {
    const level = command.currentPerformance.experienceLevel;
    const timeframe = command.timeframe;

    const titleMap: Record<string, Record<string, string>> = {
      beginner: {
        short: "Touch Typing Bootcamp",
        medium: "Foundation Building Program",
        long: "Complete Typing Mastery Journey",
      },
      intermediate: {
        short: "Speed & Accuracy Sprint",
        medium: "Performance Enhancement Program",
        long: "Advanced Typing Development",
      },
      advanced: {
        short: "Peak Performance Challenge",
        medium: "Elite Typing Optimization",
        long: "Typing Mastery Refinement",
      },
    };

    return (
      titleMap[level]?.[timeframe] || "Personalized Typing Improvement Plan"
    );
  }

  private generatePlanDescription(
    command: GenerateImprovementPlanCommand
  ): string {
    const { currentPerformance, goals } = command;
    const primaryGoal = goals.find((g) => g.priority === "high") || goals[0];

    return (
      `A personalized ${this.getTimeframeDescription(
        command.timeframe
      )} improvement plan designed for ${currentPerformance.experienceLevel
      } typists. ` +
      `Focus on ${primaryGoal?.type || "overall improvement"
      } with current baseline of ${currentPerformance.averageWpm} WPM at ${currentPerformance.averageAccuracy
      }% accuracy.`
    );
  }

  private getTimeframeDescription(
    timeframe: "short" | "medium" | "long"
  ): string {
    const descriptions = {
      short: "4-6 week intensive",
      medium: "3 month comprehensive",
      long: "6+ month mastery",
    };
    return descriptions[timeframe];
  }

  private calculateExpectedOutcomes(
    command: GenerateImprovementPlanCommand,
    phases: ImprovementPhase[]
  ): ImprovementExpectedOutcome[] {
    const outcomes: ImprovementExpectedOutcome[] = [];
    const { currentPerformance } = command;

    // Calculate realistic targets based on current performance and timeframe
    const wpmImprovement = this.calculateExpectedWpmImprovement(command);
    const accuracyImprovement =
      this.calculateExpectedAccuracyImprovement(command);

    outcomes.push({
      metric: "Words Per Minute",
      baseline: currentPerformance.averageWpm,
      target: currentPerformance.averageWpm + wpmImprovement,
      timeline: this.getTimeframeDescription(command.timeframe),
      confidence: this.calculateConfidence(command, "wpm"),
    });

    outcomes.push({
      metric: "Accuracy",
      baseline: currentPerformance.averageAccuracy,
      target: Math.min(
        100,
        currentPerformance.averageAccuracy + accuracyImprovement
      ),
      timeline: this.getTimeframeDescription(command.timeframe),
      confidence: this.calculateConfidence(command, "accuracy"),
    });

    return outcomes;
  }

  private identifyRiskFactors(
    command: GenerateImprovementPlanCommand
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    // Time commitment risk
    if (command.preferredPracticeTime && command.preferredPracticeTime < 15) {
      risks.push({
        risk: "Insufficient practice time",
        probability: "medium",
        impact: "moderate",
        mitigation: [
          "Start with shorter, more focused sessions",
          "Gradually increase practice time",
          "Focus on quality over quantity",
        ],
      });
    }

    // Plateau risk for advanced users
    if (command.currentPerformance.experienceLevel === "advanced") {
      risks.push({
        risk: "Performance plateau",
        probability: "medium",
        impact: "minor",
        mitigation: [
          "Introduce varied practice content",
          "Focus on consistency over speed gains",
          "Try alternative keyboard layouts",
        ],
      });
    }

    return risks;
  }

  private parseDuration(duration: string): number {
    // Simple duration parser - returns weeks
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }

  private extractPhaseMetrics(phase: ImprovementPhase): MilestoneMetric[] {
    return phase.successCriteria.measurements.map((m) => ({
      name: m.metric,
      target: m.target,
      unit: this.getMetricUnit(m.metric),
    }));
  }

  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      wpm: "WPM",
      accuracy: "%",
      consistency: "%",
      home_row_accuracy: "%",
      peak_wpm: "WPM",
    };
    return units[metric] || "units";
  }

  private generateCelebrationSuggestion(phaseName: string): string {
    const suggestions = [
      "Treat yourself to your favorite beverage!",
      "Share your progress with friends or family",
      "Take a well-deserved break",
      "Reward yourself with something special",
      "Reflect on how far you've come",
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  private generateDailySessions(
    dailyTime: number,
    intensity: string
  ): DailySession[] {
    const sessions: DailySession[] = [];

    for (let day = 1; day <= 6; day++) {
      // Monday to Saturday
      let sessionIntensity: "light" | "moderate" | "intense";
      let focus: string[];

      if ([2, 4].includes(day)) {
        // Tuesday, Thursday
        sessionIntensity = "intense";
        focus = ["speed building", "complex exercises"];
      } else if (day === 6) {
        // Saturday
        sessionIntensity = "light";
        focus = ["review", "fun exercises"];
      } else {
        sessionIntensity = "moderate";
        focus = ["skill building", "accuracy"];
      }

      sessions.push({
        dayOfWeek: day,
        recommendedTime: "09:00", // Default morning time
        duration: dailyTime,
        intensity: sessionIntensity,
        focus,
      });
    }

    return sessions;
  }

  private calculateExpectedWpmImprovement(
    command: GenerateImprovementPlanCommand
  ): number {
    const { currentPerformance, timeframe } = command;
    const currentWpm = currentPerformance.averageWpm;

    // Base improvement rates per timeframe
    const improvementRates = {
      short: 0.15, // 15% improvement
      medium: 0.35, // 35% improvement
      long: 0.6, // 60% improvement
    };

    // Adjust based on experience level (beginners improve faster)
    const experienceMultiplier = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.7,
    };

    const baseImprovement = currentWpm * improvementRates[timeframe];
    const adjustedImprovement =
      baseImprovement *
      experienceMultiplier[currentPerformance.experienceLevel];

    return Math.round(adjustedImprovement);
  }

  private calculateExpectedAccuracyImprovement(
    command: GenerateImprovementPlanCommand
  ): number {
    const { currentPerformance } = command;
    const currentAccuracy = currentPerformance.averageAccuracy;

    // Accuracy improvement has diminishing returns
    if (currentAccuracy >= 95) return 2; // Minimal improvement at high accuracy
    if (currentAccuracy >= 90) return 5;
    if (currentAccuracy >= 85) return 8;
    return 12; // Significant improvement potential at low accuracy
  }

  private calculateConfidence(
    command: GenerateImprovementPlanCommand,
    metric: "wpm" | "accuracy"
  ): number {
    const { currentPerformance, constraints } = command;

    let confidence = 0.8; // Base confidence

    // Adjust based on current performance level
    if (currentPerformance.recentTrend === "improving") confidence += 0.1;
    if (currentPerformance.recentTrend === "declining") confidence -= 0.1;

    // Adjust based on constraints
    if (constraints && constraints.some((c) => c.impact === "major"))
      confidence -= 0.2;

    // Adjust based on metric type
    if (metric === "accuracy" && currentPerformance.averageAccuracy < 85)
      confidence += 0.1;
    if (metric === "wpm" && currentPerformance.experienceLevel === "beginner")
      confidence += 0.1;

    return Math.max(0.3, Math.min(0.95, confidence));
  }
}
