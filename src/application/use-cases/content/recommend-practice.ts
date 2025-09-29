import { TypingContent, ContentType } from "../../../domain/entities/typing-content";
import { LanguageCode } from "../../../domain/enums/language-code";
import { DifficultyLevel } from "../../../domain/enums/difficulty-level";
import { KeyboardLayoutVariant } from "../../../domain/enums/keyboard-layout-variant";
import { IContentRepository } from "../../../domain/interfaces/content-repository.interface";
import { UserPerformanceData, WeakArea } from "./adapt-difficulty";

export interface RecommendPracticeCommand {
  userId: string;
  userPerformance: UserPerformanceData;
  preferredLanguage: LanguageCode;
  currentLayout: KeyboardLayoutVariant;
  availableTime?: number; // in minutes
  practiceGoals?: PracticeGoal[];
}

export interface PracticeGoal {
  type: 'wpm' | 'accuracy' | 'consistency' | 'layout_mastery' | 'weak_keys';
  targetValue?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PracticeRecommendation {
  content: TypingContent;
  estimatedTime: number; // in minutes
  priority: number; // 1-10, higher is more important
  reasoning: string;
  goals: string[];
}

export interface RecommendPracticeResult {
  recommendations: PracticeRecommendation[];
  practiceSchedule: PracticeSchedule;
  totalEstimatedTime: number;
  focusAreas: string[];
}

export interface PracticeSchedule {
  sessions: PracticeSession[];
  totalSessions: number;
  recommendedFrequency: 'daily' | 'alternate_days' | 'weekly';
}

export interface PracticeSession {
  order: number;
  content: TypingContent;
  duration: number; // in minutes
  focusArea: string;
  warmupContent?: TypingContent;
}

export class RecommendPracticeUseCase {
  constructor(
    private contentRepository: IContentRepository
  ) {}

  async execute(command: RecommendPracticeCommand): Promise<RecommendPracticeResult> {
    // Analyze user's weak areas and goals
    const focusAreas = this.identifyFocusAreas(command.userPerformance, command.practiceGoals);
    
    // Generate recommendations based on focus areas
    const recommendations: PracticeRecommendation[] = [];
    
    for (const area of focusAreas) {
      const areaRecommendations = await this.generateRecommendationsForArea(
        area,
        command.preferredLanguage,
        command.userPerformance
      );
      recommendations.push(...areaRecommendations);
    }

    // Sort recommendations by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    // Create practice schedule
    const practiceSchedule = this.createPracticeSchedule(
      recommendations,
      command.availableTime
    );

    const totalEstimatedTime = recommendations.reduce((sum, rec) => sum + rec.estimatedTime, 0);

    return {
      recommendations,
      practiceSchedule,
      totalEstimatedTime,
      focusAreas: focusAreas.map(area => area.name)
    };
  }

  private identifyFocusAreas(
    userPerformance: UserPerformanceData, 
    practiceGoals?: PracticeGoal[]
  ): FocusArea[] {
    const areas: FocusArea[] = [];

    // Add areas based on weak performance
    userPerformance.weakAreas.forEach(weakArea => {
      areas.push({
        name: weakArea.category,
        type: this.mapWeakAreaToFocusType(weakArea.category),
        priority: this.calculateWeakAreaPriority(weakArea),
        data: weakArea
      });
    });

    // Add areas based on user goals
    if (practiceGoals) {
      practiceGoals.forEach(goal => {
        areas.push({
          name: goal.type,
          type: goal.type as FocusType,
          priority: this.mapPriorityToPriority(goal.priority),
          data: goal
        });
      });
    }

    // Add default areas if performance indicates need
    if (userPerformance.averageWpm < 40) {
      areas.push({
        name: 'speed_building',
        type: 'wpm',
        priority: 8,
        data: { targetWpm: 40 }
      });
    }

    if (userPerformance.averageAccuracy < 95) {
      areas.push({
        name: 'accuracy_improvement',
        type: 'accuracy',
        priority: 9,
        data: { targetAccuracy: 95 }
      });
    }

    return areas.sort((a, b) => b.priority - a.priority);
  }

  private async generateRecommendationsForArea(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];

    switch (area.type) {
      case 'accuracy':
        recommendations.push(...await this.generateAccuracyRecommendations(area, language, userPerformance));
        break;
      case 'wpm':
        recommendations.push(...await this.generateSpeedRecommendations(area, language, userPerformance));
        break;
      case 'weak_keys':
        recommendations.push(...await this.generateWeakKeyRecommendations(area, language, userPerformance));
        break;
      case 'consistency':
        recommendations.push(...await this.generateConsistencyRecommendations(area, language, userPerformance));
        break;
      case 'layout_mastery':
        recommendations.push(...await this.generateLayoutMasteryRecommendations(area, language, userPerformance));
        break;
    }

    return recommendations;
  }

  private async generateAccuracyRecommendations(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];

    // Character-level practice for accuracy
    const charContent = await this.contentRepository.findByLanguageAndDifficulty(
      language,
      DifficultyLevel.EASY
    );

    const characterPractice = charContent.find(c => c.contentType === ContentType.CHARACTERS);
    if (characterPractice) {
      recommendations.push({
        content: characterPractice,
        estimatedTime: 10,
        priority: area.priority,
        reasoning: "Character-level practice improves muscle memory and reduces errors",
        goals: ["Improve accuracy", "Build muscle memory"]
      });
    }

    // Slow, careful sentence practice
    const sentenceContent = await this.contentRepository.findByLanguageAndDifficulty(
      language,
      DifficultyLevel.EASY
    );

    const sentences = sentenceContent.filter(c => c.contentType === ContentType.SENTENCES);
    if (sentences.length > 0) {
      recommendations.push({
        content: sentences[0],
        estimatedTime: 15,
        priority: area.priority - 1,
        reasoning: "Slow, deliberate sentence practice builds accuracy without speed pressure",
        goals: ["Improve accuracy", "Reduce error rate"]
      });
    }

    return recommendations;
  }

  private async generateSpeedRecommendations(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];

    // Progressive difficulty for speed building
    const mediumContent = await this.contentRepository.findByLanguageAndDifficulty(
      language,
      DifficultyLevel.MEDIUM
    );

    const sentences = mediumContent.filter(c => c.contentType === ContentType.SENTENCES);
    if (sentences.length > 0) {
      recommendations.push({
        content: sentences[0],
        estimatedTime: 20,
        priority: area.priority,
        reasoning: "Medium difficulty sentences help build speed while maintaining reasonable accuracy",
        goals: ["Increase WPM", "Build typing rhythm"]
      });
    }

    // Repetitive common words practice
    const commonWordsContent = await this.contentRepository.findByTags(['common-words', language]);
    if (commonWordsContent.length > 0) {
      recommendations.push({
        content: commonWordsContent[0],
        estimatedTime: 10,
        priority: area.priority - 1,
        reasoning: "Practicing common words builds automatic typing patterns",
        goals: ["Increase WPM", "Automate common patterns"]
      });
    }

    return recommendations;
  }

  private async generateWeakKeyRecommendations(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];
    const weakArea = area.data as WeakArea;

    if (weakArea.keys && weakArea.keys.length > 0) {
      // Create targeted content for weak keys
      const targetedContent = await this.createTargetedKeyContent(weakArea.keys, language);
      
      recommendations.push({
        content: targetedContent,
        estimatedTime: 12,
        priority: area.priority,
        reasoning: `Focused practice on problem keys: ${weakArea.keys.join(', ')}`,
        goals: ["Improve weak key accuracy", "Build finger strength"]
      });
    }

    return recommendations;
  }

  private async generateConsistencyRecommendations(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];

    // Consistent difficulty content
    const content = await this.contentRepository.findByLanguageAndDifficulty(
      language,
      DifficultyLevel.MEDIUM
    );

    const paragraphs = content.filter(c => c.contentType === ContentType.PARAGRAPHS);
    if (paragraphs.length > 0) {
      recommendations.push({
        content: paragraphs[0],
        estimatedTime: 15,
        priority: area.priority,
        reasoning: "Extended paragraph practice builds consistent typing rhythm",
        goals: ["Improve consistency", "Build endurance"]
      });
    }

    return recommendations;
  }

  private async generateLayoutMasteryRecommendations(
    area: FocusArea,
    language: LanguageCode,
    userPerformance: UserPerformanceData
  ): Promise<PracticeRecommendation[]> {
    const recommendations: PracticeRecommendation[] = [];

    // All key positions practice
    const content = await this.contentRepository.findByLanguageAndDifficulty(
      language,
      DifficultyLevel.HARD
    );

    const mixedContent = content.filter(c => c.contentType === ContentType.MIXED);
    if (mixedContent.length > 0) {
      recommendations.push({
        content: mixedContent[0],
        estimatedTime: 18,
        priority: area.priority,
        reasoning: "Mixed content with numbers and symbols builds complete layout mastery",
        goals: ["Master all keys", "Improve layout familiarity"]
      });
    }

    return recommendations;
  }

  private createPracticeSchedule(
    recommendations: PracticeRecommendation[],
    availableTime?: number
  ): PracticeSchedule {
    const sessions: PracticeSession[] = [];
    const timeLimit = availableTime || 30; // Default 30 minutes
    let currentSession = 1;
    let sessionTime = 0;

    for (const rec of recommendations) {
      if (sessionTime + rec.estimatedTime > timeLimit) {
        // Start new session
        currentSession++;
        sessionTime = 0;
      }

      sessions.push({
        order: currentSession,
        content: rec.content,
        duration: rec.estimatedTime,
        focusArea: rec.goals[0] || 'General practice'
      });

      sessionTime += rec.estimatedTime;
    }

    const frequency = this.recommendFrequency(sessions.length, timeLimit);

    return {
      sessions,
      totalSessions: Math.max(...sessions.map(s => s.order)),
      recommendedFrequency: frequency
    };
  }

  private async createTargetedKeyContent(keys: string[], language: LanguageCode): Promise<TypingContent> {
    // Generate content focusing on specific keys
    const keyText = keys.join(' ').repeat(10);
    
    return await this.contentRepository.create({
      language,
      difficulty: DifficultyLevel.EASY,
      contentType: ContentType.CHARACTERS,
      text: keyText,
      wordCount: keys.length * 10,
      characterCount: keyText.length,
      metadata: {
        targetWpm: 25,
        estimatedTime: 300
      },
      tags: ['weak-keys', 'targeted', language]
    });
  }

  private mapWeakAreaToFocusType(category: string): FocusType {
    const mapping: Record<string, FocusType> = {
      'numbers': 'weak_keys',
      'symbols': 'weak_keys',
      'accuracy': 'accuracy',
      'speed': 'wpm',
      'consistency': 'consistency'
    };
    return mapping[category] || 'weak_keys';
  }

  private calculateWeakAreaPriority(weakArea: WeakArea): number {
    // Higher error rate = higher priority
    if (weakArea.errorRate > 20) return 9;
    if (weakArea.errorRate > 10) return 7;
    if (weakArea.errorRate > 5) return 5;
    return 3;
  }

  private mapPriorityToPriority(priority: 'high' | 'medium' | 'low'): number {
    const mapping = {
      high: 8,
      medium: 5,
      low: 2
    };
    return mapping[priority];
  }

  private recommendFrequency(totalSessions: number, timePerSession: number): 'daily' | 'alternate_days' | 'weekly' {
    const totalTime = totalSessions * timePerSession;
    
    if (totalTime > 120) return 'alternate_days'; // More than 2 hours total
    if (totalTime > 60) return 'daily'; // 1-2 hours
    return 'daily'; // Less than 1 hour
  }
}

interface FocusArea {
  name: string;
  type: FocusType;
  priority: number;
  data: any;
}

type FocusType = 'wpm' | 'accuracy' | 'consistency' | 'layout_mastery' | 'weak_keys';