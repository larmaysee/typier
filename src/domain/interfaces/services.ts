import { LanguageCode } from '@/enums/site-config';
import { KeyboardLayout, LayoutType } from '../entities/keyboard-layout';
import { TypingResults, DifficultyLevel, TextType } from '../entities/typing';

export interface ITextGenerationService {
  generate(config: TextGenerationConfig): Promise<string>;
  validateText(text: string, language: LanguageCode): Promise<boolean>;
}

export interface ILayoutManagerService {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  validateLayout(layout: KeyboardLayout): Promise<ValidationResult>;
  isCompatible(layoutId: string, textContent: string): Promise<boolean>;
  createCustomLayout(config: CustomLayoutConfig): Promise<KeyboardLayout>;
}

export interface IPerformanceAnalyzerService {
  calculateResults(input: string, targetText: string, timeElapsed: number): TypingResults;
  analyzeFingerUtilization(input: string, layout: KeyboardLayout): Record<string, number>;
  calculateConsistency(wpmHistory: number[]): number;
}

export interface TextGenerationConfig {
  language: LanguageCode;
  difficulty: DifficultyLevel;
  textType: TextType;
  length: number;
  layoutId?: string;
  userId?: string;
}
/**
 * Domain service interfaces for external dependencies
 * These define contracts for services that interact with external systems
 */

import { LanguageCode } from '../enums/languages';
import { DifficultyLevel, TextType } from '../enums/typing-mode';
import { LayoutType, LayoutVariant, InputMethod } from '../enums/keyboard-layouts';
import { KeyboardLayout, TypingTest, User, Competition } from './repositories';

// Text generation and content services
export interface ITextGenerationService {
  generateText(
    language: LanguageCode,
    textType: TextType,
    difficulty: DifficultyLevel,
    wordCount?: number
  ): Promise<string>;

  generateCustomText(
    characterSet: string[],
    wordCount: number,
    includeNumbers?: boolean,
    includePunctuation?: boolean
  ): Promise<string>;

  validateTextContent(content: string, language: LanguageCode): boolean;
}

// Keyboard layout management services
export interface ILayoutManagerService {
  getLayoutsForLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;
  validateLayoutCompatibility(layoutId: string, language: LanguageCode): Promise<boolean>;
  generateKeyMappings(layoutType: LayoutType, variant: LayoutVariant, language: LanguageCode): Promise<KeyMapping[]>;
  optimizeLayoutForUser(userId: string, language: LanguageCode): Promise<KeyboardLayout>;
  detectInputMethod(input: string, language: LanguageCode): Promise<InputMethod>;
}

// Authentication and user management services  
export interface IAuthenticationService {
  authenticate(email: string, password: string): Promise<AuthResult>;
  register(userData: RegisterData): Promise<User>;
  refreshToken(token: string): Promise<string>;
  logout(userId: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<boolean>;
}

// Performance analysis services
export interface IPerformanceAnalysisService {
  analyzeTypingSession(test: TypingTest): Promise<PerformanceAnalysis>;
  calculateImprovement(userId: string, language: LanguageCode): Promise<ImprovementMetrics>;
  generateRecommendations(userId: string): Promise<TypingRecommendation[]>;
  predictPerformance(userId: string, difficulty: DifficultyLevel): Promise<PerformancePrediction>;
}

// Competition management services
export interface ICompetitionService {
  createCompetition(competitionData: CreateCompetitionData): Promise<Competition>;
  validateCompetitionEntry(competitionId: string, userId: string): Promise<ValidationResult>;
  calculateRankings(competitionId: string): Promise<CompetitionRanking[]>;
  notifyParticipants(competitionId: string, message: string): Promise<void>;
}

// Notification services
export interface INotificationService {
  sendEmail(to: string, subject: string, content: string): Promise<boolean>;
  sendInAppNotification(userId: string, notification: Notification): Promise<void>;
  scheduleReminder(userId: string, reminderData: ReminderData): Promise<string>;
  cancelReminder(reminderId: string): Promise<void>;
}

// Caching services
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Logging services
export interface ILogger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

// Event publishing services
export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler<any>): void;
}

// Supporting types and interfaces
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  preferredLanguage?: LanguageCode;
}

export interface PerformanceAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
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