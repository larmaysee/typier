/**
 * Domain value objects for text content and difficulty configuration
 */

import { DifficultyLevel, TextType } from '../enums/typing-mode';
import { LanguageCode } from '@/domain/enums/languages';

export interface TextContentData {
  readonly content: string;
  readonly language: LanguageCode;
  readonly textType: TextType;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly difficulty: DifficultyLevel;
}

export interface DifficultyConfigData {
  readonly level: DifficultyLevel;
  readonly minWPM: number;
  readonly maxWPM: number;
  readonly expectedAccuracy: number;
  readonly characterSet: string[];
  readonly allowedMistakePercent: number;
}

export class TextContent {
  private constructor(
    public readonly content: string,
    public readonly language: LanguageCode,
    public readonly textType: TextType,
    public readonly difficulty: DifficultyLevel,
    public readonly wordCount: number,
    public readonly characterCount: number
  ) {
    if (!content.trim()) throw new Error('Text content cannot be empty');
    if (wordCount < 0) throw new Error('Word count cannot be negative');
    if (characterCount < 0) throw new Error('Character count cannot be negative');
  }

  static create(data: TextContentData): TextContent {
    const words = TextContent.countWords(data.content);
    const characters = data.content.length;

    return new TextContent(
      data.content.trim(),
      data.language,
      data.textType,
      data.difficulty,
      words,
      characters
    );
  }

  static fromString(
    content: string,
    language: LanguageCode,
    textType: TextType = TextType.SENTENCES,
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
  ): TextContent {
    return TextContent.create({
      content,
      language,
      textType,
      difficulty,
      wordCount: TextContent.countWords(content),
      characterCount: content.length
    });
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  get averageWordLength(): number {
    if (this.wordCount === 0) return 0;
    return this.characterCount / this.wordCount;
  }

  get estimatedTypingTime(): number {
    // Rough estimate: 40 WPM average, 5 characters per word
    const averageWPM = 40;
    const minutes = this.wordCount / averageWPM;
    return Math.ceil(minutes * 60); // Return seconds
  }

  getWords(): string[] {
    return this.content.split(/\s+/).filter(word => word.length > 0);
  }

  getCharacters(): string[] {
    return Array.from(this.content);
  }

  slice(startIndex: number, endIndex?: number): TextContent {
    const slicedContent = this.content.slice(startIndex, endIndex);
    return TextContent.fromString(slicedContent, this.language, this.textType, this.difficulty);
  }

  isValid(): boolean {
    return this.content.trim().length > 0 &&
      this.wordCount > 0 &&
      this.characterCount > 0;
  }

  equals(other: TextContent): boolean {
    return this.content === other.content &&
      this.language === other.language &&
      this.textType === other.textType &&
      this.difficulty === other.difficulty;
  }
}

export class DifficultyConfig {
  private constructor(
    public readonly level: DifficultyLevel,
    public readonly minWPM: number,
    public readonly maxWPM: number,
    public readonly expectedAccuracy: number,
    public readonly characterSet: string[],
    public readonly allowedMistakePercent: number
  ) {
    if (minWPM < 0) throw new Error('Minimum WPM cannot be negative');
    if (maxWPM < minWPM) throw new Error('Maximum WPM must be greater than minimum WPM');
    if (expectedAccuracy < 0 || expectedAccuracy > 100) {
      throw new Error('Expected accuracy must be between 0 and 100');
    }
    if (allowedMistakePercent < 0 || allowedMistakePercent > 100) {
      throw new Error('Allowed mistake percentage must be between 0 and 100');
    }
    if (characterSet.length === 0) throw new Error('Character set cannot be empty');
  }

  static create(data: DifficultyConfigData): DifficultyConfig {
    return new DifficultyConfig(
      data.level,
      data.minWPM,
      data.maxWPM,
      data.expectedAccuracy,
      [...data.characterSet], // Create a copy
      data.allowedMistakePercent
    );
  }

  static easy(): DifficultyConfig {
    return new DifficultyConfig(
      DifficultyLevel.EASY,
      10,
      30,
      85,
      'abcdefghijklmnopqrstuvwxyz'.split(''),
      15
    );
  }

  static medium(): DifficultyConfig {
    return new DifficultyConfig(
      DifficultyLevel.MEDIUM,
      30,
      60,
      90,
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
      10
    );
  }

  static hard(): DifficultyConfig {
    return new DifficultyConfig(
      DifficultyLevel.HARD,
      60,
      120,
      95,
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'.split(''),
      5
    );
  }

  isWPMInRange(wpm: number): boolean {
    return wpm >= this.minWPM && wpm <= this.maxWPM;
  }

  isAccuracyAcceptable(accuracy: number): boolean {
    return accuracy >= this.expectedAccuracy;
  }

  containsCharacter(char: string): boolean {
    return this.characterSet.includes(char);
  }

  getUniqueCharacters(): string[] {
    return Array.from(new Set(this.characterSet));
  }

  equals(other: DifficultyConfig): boolean {
    return this.level === other.level &&
      this.minWPM === other.minWPM &&
      this.maxWPM === other.maxWPM &&
      this.expectedAccuracy === other.expectedAccuracy &&
      this.allowedMistakePercent === other.allowedMistakePercent &&
      JSON.stringify(this.characterSet.sort()) === JSON.stringify(other.characterSet.sort());
  }
}