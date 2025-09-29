import { LanguageCode } from "../enums/language-code";
import { DifficultyLevel } from "../enums/difficulty-level";

export interface TypingContent {
  id: string;
  language: LanguageCode;
  difficulty: DifficultyLevel;
  contentType: ContentType;
  text: string;
  wordCount: number;
  characterCount: number;
  metadata: ContentMetadata;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ContentType {
  SENTENCES = "sentences",
  PARAGRAPHS = "paragraphs", 
  CHARACTERS = "characters",
  NUMBERS = "numbers",
  SYMBOLS = "symbols",
  MIXED = "mixed"
}

export interface ContentMetadata {
  source?: string;
  culturalContext?: string;
  topicCategories?: string[];
  targetWpm?: number;
  estimatedTime?: number; // in seconds
}