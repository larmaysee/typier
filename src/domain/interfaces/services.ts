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
  unsubscribe(eventType: string, handler: (event: any) => Promise<void>): void;
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
  improvementAreas: string[];
  consistencyScore: number;
  speedProgression: number[];
  accuracyTrend: number[];
  fingerEfficiency: Record<string, number>;
}

export interface ImprovementMetrics {
  wpmGrowth: number;
  accuracyGrowth: number;
  consistencyImprovement: number;
  timeToNextLevel: number;
  recommendedPracticeTime: number;
}

export interface TypingRecommendation {
  type: 'practice' | 'layout' | 'technique' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedImprovement: string;
}

export interface PerformancePrediction {
  predictedWPM: number;
  predictedAccuracy: number;
  confidence: number;
  factors: string[];
}

export interface CreateCompetitionData {
  name: string;
  description: string;
  type: string;
  startDate: number;
  endDate: number;
  language: LanguageCode;
  textContent: string;
  requiredLayout?: string;
  maxParticipants?: number;
  rules: CompetitionRules;
}

export interface CompetitionRules {
  timeLimit: number;
  attemptsAllowed: number;
  layoutLocked: boolean;
  retakeAllowed: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface CustomLayoutConfig {
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: LayoutType;
  baseLayoutId?: string;
  keyMappings: Array<{
    key: string;
    character: string;
    shiftCharacter?: string;
  }>;
  metadata: {
    description: string;
    author: string;
  };
}

export interface CompetitionRanking {
  userId: string;
  username: string;
  score: number;
  rank: number;
  improvement: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface ReminderData {
  userId: string;
  type: 'practice' | 'competition' | 'achievement';
  scheduledFor: number;
  title: string;
  message: string;
  actionUrl?: string;
}

export interface DomainEvent<T = any> {
  id: string;
  type: string;
  aggregateId: string;
  data: T;
  timestamp: number;
  version: number;
}

export interface EventHandler<T> {
  (event: DomainEvent<T>): Promise<void> | void;
}

// Key mapping interface for layout management
export interface KeyMapping {
  key: string;
  character: string;
  shiftCharacter?: string;
  altCharacter?: string;
  ctrlCharacter?: string;
  position: KeyPosition;
}

export interface KeyPosition {
  row: number;
  column: number;
  finger: string;
  hand: 'left' | 'right';
}