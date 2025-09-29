import {
  ITextGenerationService,
  TextGenerationConfig,
  GeneratedText
} from "@/domain/interfaces";
import { LanguageCode, TextType, DifficultyLevel } from "@/domain/enums";
import engdatasets from "@/datas/english-data";

/**
 * English text generation service
 */
export class EnglishTextService implements ITextGenerationService {
  private readonly WORDS_PER_MINUTE_ESTIMATE = 40; // Average typing speed for time estimation

  async generate(config: TextGenerationConfig): Promise<GeneratedText> {
    let content: string;
    
    switch (config.textType) {
      case TextType.CHARS:
        content = this.generateCharacters(config);
        break;
      case TextType.WORDS:
        content = this.generateWords(config);
        break;
      case TextType.SENTENCES:
        content = this.generateSentences(config);
        break;
      case TextType.PARAGRAPHS:
        content = this.generateParagraphs(config);
        break;
      default:
        content = this.generateWords(config);
    }

    return {
      content,
      metadata: {
        wordCount: this.countWords(content),
        characterCount: content.length,
        difficulty: config.difficulty,
        language: config.language,
        textType: config.textType,
        estimatedTime: this.estimateTypingTime(content),
        source: 'english-text-service'
      }
    };
  }

  supportsLanguage(language: LanguageCode): boolean {
    return language === LanguageCode.EN;
  }

  getAvailableTextTypes(language: LanguageCode): TextType[] {
    if (language !== LanguageCode.EN) {
      return [];
    }
    return [TextType.CHARS, TextType.WORDS, TextType.SENTENCES, TextType.PARAGRAPHS];
  }

  async validateContent(content: string, config: TextGenerationConfig): Promise<boolean> {
    if (!content) return false;

    // Check if content uses English characters
    const englishPattern = /^[a-zA-Z0-9\s\.,;:!?\-'"()\[\]{}\/\\@#$%^&*+=_~`<>|]+$/;
    if (!englishPattern.test(content)) {
      return false;
    }

    // Validate length based on type
    if (config.textType === TextType.CHARS) {
      return content.length >= config.length * 0.8;
    }

    if (config.textType === TextType.WORDS) {
      const wordCount = this.countWords(content);
      return wordCount >= config.length * 0.8;
    }

    return true;
  }

  private generateCharacters(config: TextGenerationConfig): string {
    const chars = this.getCharactersByDifficulty(config.difficulty);
    let result = '';
    
    for (let i = 0; i < config.length; i++) {
      if (i > 0 && i % 5 === 0) {
        result += ' '; // Add spaces for readability
      }
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return result.trim();
  }

  private generateWords(config: TextGenerationConfig): string {
    const words = this.getWordsByDifficulty(config.difficulty);
    const result: string[] = [];
    
    for (let i = 0; i < config.length; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return result.join(' ');
  }

  private generateSentences(config: TextGenerationConfig): string {
    // Use preset sentences from the dataset
    const sentences = engdatasets.syntaxs;
    const result: string[] = [];
    let currentLength = 0;
    
    while (currentLength < config.length && result.length < sentences.length) {
      const sentence = sentences[Math.floor(Math.random() * sentences.length)];
      if (!result.includes(sentence)) {
        result.push(sentence);
        currentLength += this.countWords(sentence);
      }
    }
    
    return result.join(' ');
  }

  private generateParagraphs(config: TextGenerationConfig): string {
    // For paragraphs, use longer content from the dataset
    const longText = engdatasets.syntaxs.find(text => text.length > 200);
    if (longText) {
      const words = longText.split(' ');
      if (words.length >= config.length) {
        return words.slice(0, config.length).join(' ');
      }
    }
    
    // Fallback to generating multiple sentences
    return this.generateSentences(config);
  }

  private getCharactersByDifficulty(difficulty: DifficultyLevel): string[] {
    const baseChars = engdatasets.chars.filter(char => /[a-zA-Z0-9\s]/.test(char));
    
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return baseChars.filter(char => /[a-z\s]/.test(char));
      case DifficultyLevel.MEDIUM:
        return baseChars.filter(char => /[a-zA-Z0-9\s]/.test(char));
      case DifficultyLevel.HARD:
        return engdatasets.chars; // All characters including special ones
      default:
        return baseChars;
    }
  }

  private getWordsByDifficulty(difficulty: DifficultyLevel): string[] {
    // Extract words from sentences based on difficulty
    const allWords = engdatasets.syntaxs
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const uniqueWords = Array.from(new Set(allWords));

    switch (difficulty) {
      case DifficultyLevel.EASY:
        return uniqueWords.filter(word => word.length >= 3 && word.length <= 6);
      case DifficultyLevel.MEDIUM:
        return uniqueWords.filter(word => word.length >= 4 && word.length <= 10);
      case DifficultyLevel.HARD:
        return uniqueWords;
      default:
        return uniqueWords.filter(word => word.length >= 3 && word.length <= 8);
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateTypingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.WORDS_PER_MINUTE_ESTIMATE) * 60);
  }
}