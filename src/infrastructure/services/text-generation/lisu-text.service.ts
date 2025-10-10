import { LISU_CHARACTER_SETS_BY_DIFFICULTY, LISU_SENTENCES_BY_DIFFICULTY, LISU_WORDS_BY_DIFFICULTY } from "@/data/lisu";
import { LanguageCode } from "@/domain/enums/languages";
import { DifficultyLevel, TextType } from "@/domain/enums/typing-mode";
import { GeneratedText, ITextGenerationService, TextGenerationConfig } from "@/domain/interfaces";

/**
 * Lisu text generation service with proper Unicode handling
 */
export class LisuTextService implements ITextGenerationService {
  private readonly WORDS_PER_MINUTE_ESTIMATE = 30; // Slower for complex scripts

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
        source: "lisu-text-service",
      },
    };
  }

  supportsLanguage(language: LanguageCode): boolean {
    return language === LanguageCode.LI;
  }

  getAvailableTextTypes(language: LanguageCode): TextType[] {
    if (language !== LanguageCode.LI) {
      return [];
    }
    return [TextType.CHARS, TextType.WORDS, TextType.SENTENCES];
  }

  async validateContent(content: string, config: TextGenerationConfig): Promise<boolean> {
    if (!content) return false;

    // Check if content uses Lisu Unicode characters (U+A4D0 to U+A4FF)
    const lisuPattern = /[\u{A4D0}-\u{A4FF}\u{02C7}\u{02CD}\u{201C}\u{201D}\s]+/u;
    if (!lisuPattern.test(content)) {
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
    let result = "";

    for (let i = 0; i < config.length; i++) {
      if (i > 0 && i % 4 === 0) {
        result += " "; // Add spaces for readability
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

    return result.join(" ");
  }

  private generateSentences(config: TextGenerationConfig): string {
    const sentences = LISU_SENTENCES_BY_DIFFICULTY[config.difficulty] || LISU_SENTENCES_BY_DIFFICULTY.easy;
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
    const sentences = LISU_SENTENCES_BY_DIFFICULTY[config.difficulty] || LISU_SENTENCES_BY_DIFFICULTY.medium;
    const paragraphs: string[] = [];
    let currentWordCount = 0;

    while (currentWordCount < config.length) {
      const paragraph: string[] = [];
      const sentencesPerParagraph = Math.floor(Math.random() * 3) + 2; // 2-4 sentences per paragraph

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

  private getCharactersByDifficulty(difficulty: DifficultyLevel): string[] {
    return LISU_CHARACTER_SETS_BY_DIFFICULTY[difficulty] || LISU_CHARACTER_SETS_BY_DIFFICULTY.easy;
  }

  private getWordsByDifficulty(difficulty: DifficultyLevel): string[] {
    return LISU_WORDS_BY_DIFFICULTY[difficulty] || LISU_WORDS_BY_DIFFICULTY.easy;
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private countLisuCharacters(word: string): number {
    // Count Lisu characters excluding diacritics for better word length estimation
    return (word.match(/[\u{A4D0}-\u{A4FF}]/gu) || []).length;
  }

  private estimateTypingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.WORDS_PER_MINUTE_ESTIMATE) * 60);
  }
}
