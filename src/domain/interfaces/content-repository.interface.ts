import { TypingContent, ContentType } from "../entities/typing-content";
import { DifficultyLevel, LanguageCode } from "../enums";


export interface IContentRepository {
  create(content: Omit<TypingContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypingContent>;
  findById(id: string): Promise<TypingContent | null>;
  findByLanguageAndDifficulty(language: LanguageCode, difficulty: DifficultyLevel): Promise<TypingContent[]>;
  findByType(contentType: ContentType): Promise<TypingContent[]>;
  findByTags(tags: string[]): Promise<TypingContent[]>;
  getRandomContent(
    language: LanguageCode,
    difficulty: DifficultyLevel,
    contentType?: ContentType
  ): Promise<TypingContent | null>;
  update(id: string, data: Partial<TypingContent>): Promise<TypingContent>;
  delete(id: string): Promise<void>;
}