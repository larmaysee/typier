import { LanguageCode } from "@/enums/site-config";
import { DifficultyLevel, TypingMode } from "../entities/typing";
import { KeyboardLayout } from "../entities/keyboard-layout";

export interface ITextGenerationService {
  generate(config: TextGenerationConfig): Promise<string>;
  validateText(text: string, language: LanguageCode): Promise<boolean>;
  getDifficultyScore(text: string, language: LanguageCode): Promise<number>;
}

export interface ILayoutManagerService {
  getLayoutsForLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;
  createCustomLayout(baseLayout: KeyboardLayout, modifications: KeyboardModification[]): Promise<KeyboardLayout>;
  optimizeLayoutForUser(userId: string, language: LanguageCode): Promise<KeyboardLayout>;
}

export interface IPerformanceAnalyzerService {
  analyzeTypingPerformance(tests: any[], options?: AnalysisOptions): Promise<PerformanceAnalysis>;
  calculateImprovement(oldStats: any, newStats: any): Promise<ImprovementMetrics>;
  recommendPractice(analysis: PerformanceAnalysis): Promise<PracticeRecommendation[]>;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void;
  unsubscribe(eventType: string, handler: Function): void;
}

// Supporting types
export interface TextGenerationConfig {
  language: LanguageCode;
  difficulty: DifficultyLevel;
  textType: 'words' | 'sentences' | 'paragraphs' | 'code';
  length: number;
  userId?: string;
  customWords?: string[];
  avoidRecentWords?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface KeyboardModification {
  key: string;
  newOutput: string;
  modifiers?: string[];
}

export interface AnalysisOptions {
  includeLayoutAnalysis?: boolean;
  includePatterAnalysis?: boolean;
  includeTimingAnalysis?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  layoutEfficiency: Record<string, number>;
  commonMistakes: Array<{
    character: string;
    frequency: number;
    contexts: string[];
  }>;
  typingPattern: {
    peakTimes: number[];
    consistencyScore: number;
    speedVariation: number;
  };
}

export interface ImprovementMetrics {
  wpmImprovement: number;
  accuracyImprovement: number;
  consistencyImprovement: number;
  timeToImprove: number;
  trendDirection: 'improving' | 'stable' | 'declining';
}

export interface PracticeRecommendation {
  type: 'layout' | 'difficulty' | 'content' | 'timing';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  suggestedDuration: number;
}

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  timestamp: Date;
  userId?: string;
}