import { KeyboardLayout } from "../../../domain/entities/keyboard-layout";
import { TypingAnalytics } from "../../../domain/entities/typing-analytics";
import { LanguageCode } from "../../../domain/enums/language-code";
import { KeyboardLayoutVariant } from "../../../domain/enums/keyboard-layout-variant";
import { IKeyboardLayoutRepository } from "../../../domain/interfaces/keyboard-layout-repository.interface";
import { IAnalyticsRepository } from "../../../domain/interfaces/analytics-repository.interface";

export interface RecommendOptimalLayoutCommand {
  userId: string;
  targetLanguage: LanguageCode;
  currentLayoutId?: string;
  userGoals: TypingGoal[];
  physicalConstraints?: PhysicalConstraint[];
}

export interface TypingGoal {
  type: 'speed' | 'accuracy' | 'comfort' | 'learning';
  priority: 'high' | 'medium' | 'low';
  targetValue?: number;
}

export interface PhysicalConstraint {
  type: 'hand_size' | 'finger_reach' | 'injury' | 'preference';
  description: string;
  affectedFingers?: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface LayoutRecommendationResult {
  primaryRecommendation: LayoutRecommendation;
  alternativeRecommendations: LayoutRecommendation[];
  migrationPlan?: MigrationPlan;
  customLayoutSuggestion?: CustomLayoutSuggestion;
}

export interface LayoutRecommendation {
  layout: KeyboardLayout;
  suitabilityScore: number; // 0-100
  reasoning: ReasoningPoint[];
  expectedOutcomes: ExpectedOutcome[];
  learningCurve: LearningCurve;
  pros: string[];
  cons: string[];
}

export interface ReasoningPoint {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1
  explanation: string;
}

export interface ExpectedOutcome {
  metric: 'wpm' | 'accuracy' | 'comfort' | 'learning_time';
  currentValue?: number;
  expectedValue: number;
  timeToAchieve: string; // e.g., "2-3 weeks"
  confidence: number; // 0-1
}

export interface LearningCurve {
  difficulty: 'easy' | 'moderate' | 'hard';
  estimatedTimeWeeks: number;
  keyMilestones: string[];
  dropInPerformance: number; // Initial % drop expected
}

export interface MigrationPlan {
  fromLayout: KeyboardLayout;
  toLayout: KeyboardLayout;
  phases: MigrationPhase[];
  totalDuration: string;
  progressMetrics: string[];
}

export interface MigrationPhase {
  phase: number;
  name: string;
  duration: string;
  focusAreas: string[];
  practiceRecommendations: string[];
  successCriteria: string[];
}

export interface CustomLayoutSuggestion {
  basedOn: KeyboardLayoutVariant;
  modifications: LayoutModification[];
  reasoning: string;
  expectedBenefit: string;
}

export interface LayoutModification {
  type: 'move_key' | 'swap_keys' | 'add_shortcut';
  description: string;
  from?: string;
  to?: string;
  rationale: string;
}

export class RecommendOptimalLayoutUseCase {
  constructor(
    private keyboardLayoutRepository: IKeyboardLayoutRepository,
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(command: RecommendOptimalLayoutCommand): Promise<LayoutRecommendationResult> {
    // Get user's current performance data
    const userAnalytics = await this.analyticsRepository.findByUserId(command.userId);
    const currentPerformance = this.analyzeCurrentPerformance(userAnalytics);

    // Get available layouts for the target language
    const availableLayouts = await this.keyboardLayoutRepository.findByLanguage(command.targetLanguage);

    // Score each layout based on user profile
    const scoredLayouts = await Promise.all(
      availableLayouts.map(layout => this.scoreLayout(layout, command, currentPerformance))
    );

    // Sort by suitability score
    scoredLayouts.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    const primaryRecommendation = scoredLayouts[0];
    const alternativeRecommendations = scoredLayouts.slice(1, 4); // Top 3 alternatives

    // Generate migration plan if switching layouts
    let migrationPlan: MigrationPlan | undefined;
    if (command.currentLayoutId && command.currentLayoutId !== primaryRecommendation.layout.id) {
      const currentLayout = await this.keyboardLayoutRepository.findById(command.currentLayoutId);
      if (currentLayout) {
        migrationPlan = this.generateMigrationPlan(currentLayout, primaryRecommendation.layout, currentPerformance);
      }
    }

    // Generate custom layout suggestion if appropriate
    let customLayoutSuggestion: CustomLayoutSuggestion | undefined;
    if (this.shouldSuggestCustomLayout(command, currentPerformance)) {
      customLayoutSuggestion = this.generateCustomLayoutSuggestion(command, currentPerformance);
    }

    return {
      primaryRecommendation,
      alternativeRecommendations,
      migrationPlan,
      customLayoutSuggestion
    };
  }

  private analyzeCurrentPerformance(analytics: TypingAnalytics[]): UserPerformanceProfile {
    if (analytics.length === 0) {
      return {
        averageWpm: 0,
        averageAccuracy: 0,
        consistency: 0,
        experienceLevel: 'beginner',
        strongFingers: [],
        weakFingers: [],
        problemKeys: [],
        typingStyle: 'hunt-peck'
      };
    }

    const recentAnalytics = analytics.slice(-10); // Last 10 sessions
    const averageWpm = recentAnalytics.reduce((sum, a) => sum + a.data.averageWpm, 0) / recentAnalytics.length;
    const averageAccuracy = recentAnalytics.reduce((sum, a) => sum + a.data.accuracy, 0) / recentAnalytics.length;

    // Calculate consistency (inverse of coefficient of variation)
    const wpmValues = recentAnalytics.map(a => a.data.averageWpm);
    const mean = averageWpm;
    const stdDev = Math.sqrt(wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length);
    const consistency = mean > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 0;

    // Determine experience level
    let experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    if (averageWpm < 25 || averageAccuracy < 85) {
      experienceLevel = 'beginner';
    } else if (averageWpm < 50 || averageAccuracy < 95) {
      experienceLevel = 'intermediate';
    } else {
      experienceLevel = 'advanced';
    }

    // Analyze finger usage and problem keys
    const keystrokeData = recentAnalytics.flatMap(a => a.data.keystrokePattern || []);
    const fingerUsage = this.analyzeFingerUsage(keystrokeData);
    const problemKeys = keystrokeData
      .filter(k => k.errorRate > 10)
      .map(k => k.key)
      .slice(0, 5);

    // Determine typing style based on finger usage
    const typingStyle = fingerUsage.activeFingersCount >= 8 ? 'touch' : 
                      fingerUsage.activeFingersCount >= 4 ? 'hybrid' : 'hunt-peck';

    return {
      averageWpm,
      averageAccuracy,
      consistency,
      experienceLevel,
      strongFingers: fingerUsage.strongFingers,
      weakFingers: fingerUsage.weakFingers,
      problemKeys,
      typingStyle
    };
  }

  private async scoreLayout(
    layout: KeyboardLayout,
    command: RecommendOptimalLayoutCommand,
    currentPerformance: UserPerformanceProfile
  ): Promise<LayoutRecommendation> {
    const reasoningPoints: ReasoningPoint[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Goal alignment scoring
    for (const goal of command.userGoals) {
      const goalScore = this.scoreLayoutForGoal(layout, goal, currentPerformance);
      const weight = goal.priority === 'high' ? 1.0 : goal.priority === 'medium' ? 0.7 : 0.4;
      
      totalScore += goalScore * weight;
      totalWeight += weight;
      
      reasoningPoints.push({
        factor: `${goal.type}_goal`,
        impact: goalScore > 70 ? 'positive' : goalScore < 40 ? 'negative' : 'neutral',
        weight,
        explanation: this.generateGoalExplanation(layout, goal, goalScore)
      });
    }

    // Physical constraints scoring
    if (command.physicalConstraints) {
      for (const constraint of command.physicalConstraints) {
        const constraintScore = this.scoreLayoutForConstraint(layout, constraint);
        const weight = constraint.severity === 'severe' ? 0.9 : constraint.severity === 'moderate' ? 0.6 : 0.3;
        
        totalScore += constraintScore * weight;
        totalWeight += weight;
        
        reasoningPoints.push({
          factor: `${constraint.type}_constraint`,
          impact: constraintScore > 70 ? 'positive' : constraintScore < 40 ? 'negative' : 'neutral',
          weight,
          explanation: this.generateConstraintExplanation(layout, constraint, constraintScore)
        });
      }
    }

    // Experience level compatibility
    const experienceScore = this.scoreLayoutForExperience(layout, currentPerformance.experienceLevel);
    const experienceWeight = 0.6;
    totalScore += experienceScore * experienceWeight;
    totalWeight += experienceWeight;

    // Calculate final score
    const suitabilityScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Generate expected outcomes
    const expectedOutcomes = this.generateExpectedOutcomes(layout, currentPerformance);

    // Determine learning curve
    const learningCurve = this.calculateLearningCurve(layout, currentPerformance);

    // Generate pros and cons
    const pros = this.generatePros(layout, currentPerformance);
    const cons = this.generateCons(layout, currentPerformance);

    return {
      layout,
      suitabilityScore,
      reasoningPoints,
      expectedOutcomes,
      learningCurve,
      pros,
      cons
    };
  }

  private scoreLayoutForGoal(layout: KeyboardLayout, goal: TypingGoal, performance: UserPerformanceProfile): number {
    switch (goal.type) {
      case 'speed':
        return this.scoreLayoutForSpeed(layout, performance);
      case 'accuracy':
        return this.scoreLayoutForAccuracy(layout, performance);
      case 'comfort':
        return this.scoreLayoutForComfort(layout, performance);
      case 'learning':
        return this.scoreLayoutForLearning(layout, performance);
      default:
        return 50; // Neutral score
    }
  }

  private scoreLayoutForSpeed(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    let score = 50; // Base score

    // Favor layouts optimized for common keys
    if (layout.variant === KeyboardLayoutVariant.DVORAK) score += 20;
    if (layout.variant === KeyboardLayoutVariant.COLEMAK) score += 15;
    
    // Consider user's current speed
    if (performance.averageWpm > 40) {
      // Advanced users might benefit from optimized layouts
      if (layout.variant === KeyboardLayoutVariant.DVORAK || layout.variant === KeyboardLayoutVariant.COLEMAK) {
        score += 15;
      }
    }

    return Math.min(100, score);
  }

  private scoreLayoutForAccuracy(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    let score = 50;

    // Standard layouts are often more accurate due to familiarity
    if (layout.variant === KeyboardLayoutVariant.QWERTY_US) score += 15;
    
    // Custom layouts can be optimized for accuracy
    if (layout.isCustom && layout.metadata.optimizedFor?.includes('accuracy')) score += 20;

    // Consider problem keys
    if (performance.problemKeys.length > 0) {
      // Check if layout helps with problem keys
      const helpfulForProblems = this.layoutHelpsWithKeys(layout, performance.problemKeys);
      score += helpfulForProblems ? 15 : -10;
    }

    return Math.min(100, score);
  }

  private scoreLayoutForComfort(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    let score = 50;

    // Ergonomic layouts score higher for comfort
    if (layout.variant === KeyboardLayoutVariant.DVORAK) score += 25;
    if (layout.variant === KeyboardLayoutVariant.COLEMAK) score += 20;

    // Consider user's finger strength/weakness
    const layoutMatchesFingerStrength = this.layoutMatchesFingerProfile(layout, performance);
    score += layoutMatchesFingerStrength ? 15 : -5;

    return Math.min(100, score);
  }

  private scoreLayoutForLearning(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    let score = 50;

    // Beginners benefit from standard layouts
    if (performance.experienceLevel === 'beginner') {
      if (layout.variant === KeyboardLayoutVariant.QWERTY_US) score += 20;
    }

    // Intermediate users can handle some complexity
    if (performance.experienceLevel === 'intermediate') {
      if (layout.variant === KeyboardLayoutVariant.COLEMAK) score += 15;
    }

    // Advanced users can tackle any layout
    if (performance.experienceLevel === 'advanced') {
      score += 10; // All layouts are viable
    }

    return Math.min(100, score);
  }

  private scoreLayoutForConstraint(layout: KeyboardLayout, constraint: PhysicalConstraint): number {
    let score = 50;

    switch (constraint.type) {
      case 'hand_size':
        // Smaller hands might prefer more compact layouts
        score += this.layoutSuitableForHandSize(layout, constraint.description) ? 20 : -15;
        break;
      case 'finger_reach':
        // Limited reach prefers layouts with better key positioning
        score += this.layoutSuitableForReach(layout, constraint.affectedFingers || []) ? 25 : -20;
        break;
      case 'injury':
        // Injury considerations are critical
        score += this.layoutSuitableForInjury(layout, constraint) ? 30 : -30;
        break;
      case 'preference':
        // User preferences are important but less critical
        score += constraint.description.includes('prefer') ? 10 : 0;
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreLayoutForExperience(layout: KeyboardLayout, experience: 'beginner' | 'intermediate' | 'advanced'): number {
    const experienceScores = {
      beginner: {
        [KeyboardLayoutVariant.QWERTY_US]: 90,
        [KeyboardLayoutVariant.QWERTY_UK]: 85,
        [KeyboardLayoutVariant.DVORAK]: 30,
        [KeyboardLayoutVariant.COLEMAK]: 40
      },
      intermediate: {
        [KeyboardLayoutVariant.QWERTY_US]: 80,
        [KeyboardLayoutVariant.QWERTY_UK]: 75,
        [KeyboardLayoutVariant.DVORAK]: 60,
        [KeyboardLayoutVariant.COLEMAK]: 70
      },
      advanced: {
        [KeyboardLayoutVariant.QWERTY_US]: 70,
        [KeyboardLayoutVariant.QWERTY_UK]: 65,
        [KeyboardLayoutVariant.DVORAK]: 85,
        [KeyboardLayoutVariant.COLEMAK]: 90
      }
    };

    return experienceScores[experience][layout.variant] || 50;
  }

  // Helper methods continue...
  private generateMigrationPlan(
    fromLayout: KeyboardLayout,
    toLayout: KeyboardLayout,
    performance: UserPerformanceProfile
  ): MigrationPlan {
    const phases: MigrationPhase[] = [
      {
        phase: 1,
        name: 'Foundation',
        duration: '1-2 weeks',
        focusAreas: ['Basic key positions', 'Home row mastery'],
        practiceRecommendations: ['15 minutes daily', 'Focus on accuracy over speed'],
        successCriteria: ['Can type alphabet without looking', '70% of original speed']
      },
      {
        phase: 2,
        name: 'Building Speed',
        duration: '2-3 weeks',
        focusAreas: ['Common words', 'Letter combinations'],
        practiceRecommendations: ['20 minutes daily', 'Gradually increase speed'],
        successCriteria: ['80% of original speed', 'Comfortable with common words']
      },
      {
        phase: 3,
        name: 'Mastery',
        duration: '3-4 weeks',
        focusAreas: ['Numbers and symbols', 'Complex texts'],
        practiceRecommendations: ['25 minutes daily', 'Challenge yourself'],
        successCriteria: ['Exceed original performance', 'Comfortable with all keys']
      }
    ];

    return {
      fromLayout,
      toLayout,
      phases,
      totalDuration: '6-9 weeks',
      progressMetrics: ['WPM recovery', 'Accuracy maintenance', 'Comfort level']
    };
  }

  private generateExpectedOutcomes(layout: KeyboardLayout, performance: UserPerformanceProfile): ExpectedOutcome[] {
    const outcomes: ExpectedOutcome[] = [];

    // Speed outcome
    const speedImprovement = this.estimateSpeedImprovement(layout, performance);
    outcomes.push({
      metric: 'wpm',
      currentValue: performance.averageWpm,
      expectedValue: performance.averageWpm + speedImprovement,
      timeToAchieve: speedImprovement > 10 ? '8-12 weeks' : '4-6 weeks',
      confidence: speedImprovement > 0 ? 0.8 : 0.6
    });

    // Accuracy outcome
    const accuracyImprovement = this.estimateAccuracyImprovement(layout, performance);
    outcomes.push({
      metric: 'accuracy',
      currentValue: performance.averageAccuracy,
      expectedValue: Math.min(100, performance.averageAccuracy + accuracyImprovement),
      timeToAchieve: '2-4 weeks',
      confidence: 0.7
    });

    return outcomes;
  }

  private calculateLearningCurve(layout: KeyboardLayout, performance: UserPerformanceProfile): LearningCurve {
    const isStandardLayout = [
      KeyboardLayoutVariant.QWERTY_US,
      KeyboardLayoutVariant.QWERTY_UK,
      KeyboardLayoutVariant.QWERTY_INTL
    ].includes(layout.variant);

    if (isStandardLayout && performance.typingStyle !== 'touch') {
      return {
        difficulty: 'easy',
        estimatedTimeWeeks: 4,
        keyMilestones: ['Learn home row', 'Basic words', 'Full speed'],
        dropInPerformance: 10
      };
    }

    if (layout.variant === KeyboardLayoutVariant.COLEMAK) {
      return {
        difficulty: 'moderate',
        estimatedTimeWeeks: 8,
        keyMilestones: ['Home row transition', 'Common keys', 'Full layout', 'Speed recovery'],
        dropInPerformance: 40
      };
    }

    if (layout.variant === KeyboardLayoutVariant.DVORAK) {
      return {
        difficulty: 'hard',
        estimatedTimeWeeks: 12,
        keyMilestones: ['Complete relearning', 'Basic proficiency', 'Speed building', 'Mastery'],
        dropInPerformance: 60
      };
    }

    return {
      difficulty: 'moderate',
      estimatedTimeWeeks: 6,
      keyMilestones: ['Adaptation', 'Proficiency', 'Optimization'],
      dropInPerformance: 30
    };
  }

  // Additional helper methods would be implemented here...
  private analyzeFingerUsage(keystrokeData: any[]): { activeFingersCount: number, strongFingers: string[], weakFingers: string[] } {
    // Simplified implementation
    return {
      activeFingersCount: 8,
      strongFingers: ['left-index', 'right-index'],
      weakFingers: ['left-pinky', 'right-pinky']
    };
  }

  private generateGoalExplanation(layout: KeyboardLayout, goal: TypingGoal, score: number): string {
    return `Layout scores ${score}/100 for ${goal.type} optimization`;
  }

  private generateConstraintExplanation(layout: KeyboardLayout, constraint: PhysicalConstraint, score: number): string {
    return `Layout compatibility with ${constraint.type}: ${score}/100`;
  }

  private layoutHelpsWithKeys(layout: KeyboardLayout, problemKeys: string[]): boolean {
    return Math.random() > 0.5; // Simplified
  }

  private layoutMatchesFingerProfile(layout: KeyboardLayout, performance: UserPerformanceProfile): boolean {
    return Math.random() > 0.5; // Simplified
  }

  private layoutSuitableForHandSize(layout: KeyboardLayout, description: string): boolean {
    return Math.random() > 0.5; // Simplified
  }

  private layoutSuitableForReach(layout: KeyboardLayout, affectedFingers: string[]): boolean {
    return Math.random() > 0.5; // Simplified
  }

  private layoutSuitableForInjury(layout: KeyboardLayout, constraint: PhysicalConstraint): boolean {
    return Math.random() > 0.5; // Simplified
  }

  private estimateSpeedImprovement(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    if (layout.variant === KeyboardLayoutVariant.DVORAK) return 8;
    if (layout.variant === KeyboardLayoutVariant.COLEMAK) return 5;
    return 2;
  }

  private estimateAccuracyImprovement(layout: KeyboardLayout, performance: UserPerformanceProfile): number {
    return Math.max(0, 95 - performance.averageAccuracy) * 0.3;
  }

  private generatePros(layout: KeyboardLayout, performance: UserPerformanceProfile): string[] {
    const pros = [];
    if (layout.variant === KeyboardLayoutVariant.DVORAK) {
      pros.push('Optimized for English letter frequency');
      pros.push('Reduces finger travel distance');
    }
    return pros;
  }

  private generateCons(layout: KeyboardLayout, performance: UserPerformanceProfile): string[] {
    const cons = [];
    if (layout.variant !== KeyboardLayoutVariant.QWERTY_US) {
      cons.push('Learning curve required');
      cons.push('Less universal compatibility');
    }
    return cons;
  }

  private shouldSuggestCustomLayout(command: RecommendOptimalLayoutCommand, performance: UserPerformanceProfile): boolean {
    return performance.experienceLevel === 'advanced' && performance.problemKeys.length > 3;
  }

  private generateCustomLayoutSuggestion(
    command: RecommendOptimalLayoutCommand,
    performance: UserPerformanceProfile
  ): CustomLayoutSuggestion {
    return {
      basedOn: KeyboardLayoutVariant.COLEMAK,
      modifications: [
        {
          type: 'move_key',
          description: 'Move problematic keys to easier positions',
          rationale: 'Based on your typing patterns'
        }
      ],
      reasoning: 'Your typing patterns suggest specific optimizations',
      expectedBenefit: 'Up to 15% improvement in problem areas'
    };
  }
}

interface UserPerformanceProfile {
  averageWpm: number;
  averageAccuracy: number;
  consistency: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  strongFingers: string[];
  weakFingers: string[];
  problemKeys: string[];
  typingStyle: 'touch' | 'hybrid' | 'hunt-peck';
}