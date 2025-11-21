import {
  MYANMAR_CHARACTER_SETS_BY_DIFFICULTY,
  MYANMAR_SENTENCES_BY_DIFFICULTY,
  MYANMAR_WORDS_BY_DIFFICULTY,
} from "@/data/myanmar";
import { LanguageCode } from "@/domain/enums/languages";
import { TextType } from "@/domain/enums/typing-mode";
import { GeneratedText, ITextGenerationService, TextGenerationConfig } from "@/domain/interfaces";

/**
 * Myanmar text generation service with proper Unicode handling
 */
export class MyanmarTextService implements ITextGenerationService {
  private readonly WORDS_PER_MINUTE_ESTIMATE = 25;

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
        source: "myanmar-text-service",
      },
    };
  }

  async supportsLanguage(language: LanguageCode): Promise<boolean> {
    return language === LanguageCode.MY;
  }

  async getAvailableTextTypes(language: LanguageCode): Promise<TextType[]> {
    if (language !== LanguageCode.MY) {
      return [];
    }
    return [TextType.CHARS, TextType.WORDS, TextType.SENTENCES];
  }

  async validateContent(content: string): Promise<boolean> {
    if (!content) return false;
    const myanmarPattern = /[\u{1000}-\u{109F}\s\u{200C}\u{200D}]+/u;
    return myanmarPattern.test(content);
  }

  private generateCharacters(config: TextGenerationConfig): string {
    const chars = MYANMAR_CHARACTER_SETS_BY_DIFFICULTY[config.difficulty] || MYANMAR_CHARACTER_SETS_BY_DIFFICULTY.easy;
    let result = "";

    for (let i = 0; i < config.length; i++) {
      if (i > 0 && i % 4 === 0) result += " ";
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result.trim();
  }

  private generateWords(config: TextGenerationConfig): string {
    const words = MYANMAR_WORDS_BY_DIFFICULTY[config.difficulty] || MYANMAR_WORDS_BY_DIFFICULTY.easy;
    const result: string[] = [];

    for (let i = 0; i < config.length; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }

    return result.join(" ");
  }

  private generateSentences(config: TextGenerationConfig): string {
    const sentences = MYANMAR_SENTENCES_BY_DIFFICULTY[config.difficulty] || MYANMAR_SENTENCES_BY_DIFFICULTY.easy;
    const result: string[] = [];
    let currentLength = 0;

    while (currentLength < config.length && result.length < sentences.length) {
      const sentence = sentences[Math.floor(Math.random() * sentences.length)];
      if (!result.includes(sentence)) {
        result.push(sentence);
        currentLength += this.countWords(sentence);
      }
    }

    return result.join(" ");
  }

  private generateParagraphs(config: TextGenerationConfig): string {
    const sentences = MYANMAR_SENTENCES_BY_DIFFICULTY[config.difficulty] || MYANMAR_SENTENCES_BY_DIFFICULTY.medium;
    const paragraphs: string[] = [];
    let currentWordCount = 0;

    while (currentWordCount < config.length) {
      const paragraph: string[] = [];
      const sentencesPerParagraph = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < sentencesPerParagraph && currentWordCount < config.length; i++) {
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        paragraph.push(sentence);
        currentWordCount += this.countWords(sentence);
      }

      paragraphs.push(paragraph.join(" "));
      if (currentWordCount >= config.length) break;
    }

    return paragraphs.join("\n\n");
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private estimateTypingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.WORDS_PER_MINUTE_ESTIMATE) * 60);
  }
}
