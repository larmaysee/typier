import {
  ITextGenerationService,
  TextGenerationConfig,
  GeneratedText
} from "@/domain/interfaces";
import { LanguageCode, TextType } from "@/domain/enums";
import { EnglishTextService } from "./english-text.service";
import { LisuTextService } from "./lisu-text.service";
import { MyanmarTextService } from "./myanmar-text.service";

/**
 * Main text generation orchestrator that delegates to language-specific services
 */
export class TextGeneratorService implements ITextGenerationService {
  private providers = new Map<LanguageCode, ITextGenerationService>();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set(LanguageCode.EN, new EnglishTextService());
    this.providers.set(LanguageCode.LI, new LisuTextService());
    this.providers.set(LanguageCode.MY, new MyanmarTextService());
  }

  async generate(config: TextGenerationConfig): Promise<GeneratedText> {
    const provider = this.providers.get(config.language);
    
    if (!provider) {
      throw new Error(`Text generation not supported for language: ${config.language}`);
    }

    // Validate configuration
    await this.validateConfig(config);

    try {
      const result = await provider.generate(config);
      
      // Validate the generated content
      const isValid = await this.validateContent(result.content, config);
      if (!isValid) {
        throw new Error("Generated content failed validation");
      }

      return result;
    } catch (error) {
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  supportsLanguage(language: LanguageCode): boolean {
    return this.providers.has(language);
  }

  getAvailableTextTypes(language: LanguageCode): TextType[] {
    const provider = this.providers.get(language);
    return provider ? provider.getAvailableTextTypes(language) : [];
  }

  async validateContent(content: string, config: TextGenerationConfig): Promise<boolean> {
    if (!content || content.length === 0) {
      return false;
    }

    // Basic validation
    if (config.textType === TextType.CHARS && content.length < config.length * 0.8) {
      return false;
    }

    if (config.textType === TextType.WORDS) {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount < config.length * 0.8) {
        return false;
      }
    }

    // Delegate to language-specific validation
    const provider = this.providers.get(config.language);
    if (provider) {
      return await provider.validateContent(content, config);
    }

    return true;
  }

  private async validateConfig(config: TextGenerationConfig): Promise<void> {
    if (!config.language) {
      throw new Error("Language is required");
    }

    if (!this.supportsLanguage(config.language)) {
      throw new Error(`Language ${config.language} is not supported`);
    }

    if (!config.textType) {
      throw new Error("Text type is required");
    }

    if (!config.length || config.length <= 0) {
      throw new Error("Length must be a positive number");
    }

    if (config.length > 10000) {
      throw new Error("Length cannot exceed 10000");
    }

    const availableTypes = this.getAvailableTextTypes(config.language);
    if (!availableTypes.includes(config.textType)) {
      throw new Error(`Text type ${config.textType} not supported for language ${config.language}`);
    }
  }

  /**
   * Get a provider instance for testing or direct access
   */
  getProvider(language: LanguageCode): ITextGenerationService | undefined {
    return this.providers.get(language);
  }
}