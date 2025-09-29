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