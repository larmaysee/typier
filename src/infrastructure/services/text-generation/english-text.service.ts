import { CHARACTER_SETS_BY_DIFFICULTY, SENTENCES_BY_DIFFICULTY, WORDS_BY_DIFFICULTY } from "@/data/english";
import { LanguageCode } from "@/domain/enums/languages";
import { DifficultyLevel, TextType } from "@/domain/enums/typing-mode";
import { GeneratedText, ITextGenerationService, TextGenerationConfig } from "@/domain/interfaces";

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
        source: "english-text-service",
      },
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
    let result = "";

    for (let i = 0; i < config.length; i++) {
      if (i > 0 && i % 5 === 0) {
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
    const sentences = SENTENCES_BY_DIFFICULTY[config.difficulty] || SENTENCES_BY_DIFFICULTY.easy;
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
    const sentences = SENTENCES_BY_DIFFICULTY[config.difficulty] || SENTENCES_BY_DIFFICULTY.medium;
    const paragraphs: string[] = [];
    let currentWordCount = 0;

    while (currentWordCount < config.length) {
      const paragraph: string[] = [];
      const sentencesPerParagraph = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph

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
    return CHARACTER_SETS_BY_DIFFICULTY[difficulty] || CHARACTER_SETS_BY_DIFFICULTY.easy;
  }

  private getWordsByDifficulty(difficulty: DifficultyLevel): string[] {
    return WORDS_BY_DIFFICULTY[difficulty] || WORDS_BY_DIFFICULTY.easy;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateTypingTime(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil((wordCount / this.WORDS_PER_MINUTE_ESTIMATE) * 60);
  }
}
