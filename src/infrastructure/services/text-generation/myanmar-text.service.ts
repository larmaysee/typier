import {
  ITextGenerationService,
  TextGenerationConfig,
  GeneratedText
} from "@/domain/interfaces";
import { LanguageCode, TextType, DifficultyLevel } from "@/domain/enums";
import mydatasets from "@/datas/myanmar-data";

/**
 * Myanmar text generation service with proper Unicode handling
 */
export class MyanmarTextService implements ITextGenerationService {
  private readonly WORDS_PER_MINUTE_ESTIMATE = 25; // Slower for complex scripts

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
        source: 'myanmar-text-service'
      }
    };
  }

  supportsLanguage(language: LanguageCode): boolean {
    return language === LanguageCode.MY;
  }

  getAvailableTextTypes(language: LanguageCode): TextType[] {
    if (language !== LanguageCode.MY) {
      return [];
    }
    return [TextType.CHARS, TextType.WORDS, TextType.SENTENCES, TextType.PARAGRAPHS];
  }

  async validateContent(content: string, config: TextGenerationConfig): Promise<boolean> {
    if (!content) return false;

    // Check if content uses Myanmar Unicode characters (U+1000 to U+109F)
    const myanmarPattern = /[\u{1000}-\u{109F}\s]+/u;
    if (!myanmarPattern.test(content)) {
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
    // Use preset sentences from the Myanmar dataset
    const sentences = mydatasets.syntaxs;
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
    // For paragraphs, combine multiple sentences
    const sentences = mydatasets.syntaxs;
    const result: string[] = [];
    let currentLength = 0;
    
    // Use all available sentences for longer paragraphs
    while (currentLength < config.length && result.length < sentences.length) {
      sentences.forEach(sentence => {
        if (currentLength < config.length && !result.includes(sentence)) {
          result.push(sentence);
          currentLength += this.countWords(sentence);
        }
      });
    }
    
    return result.join(' ');
  }

  private getCharactersByDifficulty(difficulty: DifficultyLevel): string[] {
    const baseChars = mydatasets.chars.filter(char => char !== ' ');
    
    switch (difficulty) {
      case DifficultyLevel.EASY:
        // Basic consonants only
        return baseChars.filter(char => 
          char >= 'က' && char <= 'အ' && 
          !/[ါာိီုူေးံ့း္်ျြွှ]/.test(char)
        );
      case DifficultyLevel.MEDIUM:
        // Include vowel marks and basic diacritics
        return baseChars.filter(char => 
          (char >= 'က' && char <= 'အ') || 
          /[ါာိီုူေးံ]/.test(char)
        );
      case DifficultyLevel.HARD:
        return mydatasets.chars; // All characters including complex diacritics
      default:
        return baseChars.filter(char => 
          (char >= 'က' && char <= 'အ') || 
          /[ါာိီုူေး]/.test(char)
        );
    }
  }

  private getWordsByDifficulty(difficulty: DifficultyLevel): string[] {
    // Extract words from sentences, accounting for Myanmar word boundaries
    const allWords = mydatasets.syntaxs
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const uniqueWords = Array.from(new Set(allWords));

    switch (difficulty) {
      case DifficultyLevel.EASY:
        // Shorter Myanmar words (basic syllables)
        return uniqueWords.filter(word => this.countMyanmarSyllables(word) <= 3);
      case DifficultyLevel.MEDIUM:
        // Medium-length words
        return uniqueWords.filter(word => 
          this.countMyanmarSyllables(word) >= 2 && this.countMyanmarSyllables(word) <= 6
        );
      case DifficultyLevel.HARD:
        return uniqueWords;
      default:
        return uniqueWords.filter(word => 
          this.countMyanmarSyllables(word) >= 1 && this.countMyanmarSyllables(word) <= 4
        );
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countMyanmarSyllables(word: string): number {
    // Rough estimation of Myanmar syllables by counting main characters
    return (word.match(/[\u{1000}-\u{1049}]/gu) || []).length;
  }

  private estimateTypingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.WORDS_PER_MINUTE_ESTIMATE) * 60);
  }
}