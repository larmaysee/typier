import { LanguageCode } from "@/enums/site-config";
import {
  ContentType,
  TypingContent,
} from "@/domain/entities/typing-content";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { IContentRepository } from "@/domain/interfaces/content-repository.interface";

export interface GenerateTypingContentCommand {
  language: LanguageCode;
  difficulty: DifficultyLevel;
  contentType: ContentType;
  wordCount?: number;
  culturalContext?: string;
  topicCategories?: string[];
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export interface GenerateTypingContentResult {
  content: TypingContent;
  metadata: {
    estimatedTime: number;
    targetWpm: number;
    complexity: number;
  };
}

export class GenerateTypingContentUseCase {
  constructor(private contentRepository: IContentRepository) { }

  async execute(
    command: GenerateTypingContentCommand
  ): Promise<GenerateTypingContentResult> {
    // Get base content patterns for the language
    const baseContent = await this.getBaseContentForLanguage(
      command.language,
      command.contentType
    );

    // Generate content based on difficulty and requirements
    const generatedText = await this.generateText(command, baseContent);

    // Calculate metadata
    const wordCount = this.countWords(generatedText);
    const characterCount = generatedText.length;
    const targetWpm = this.calculateTargetWpm(command.difficulty);
    const estimatedTime = Math.ceil((wordCount / targetWpm) * 60); // in seconds
    const complexity = this.calculateComplexity(
      generatedText,
      command.difficulty
    );

    // Create content entity
    const content = await this.contentRepository.create({
      language: command.language,
      difficulty: command.difficulty,
      contentType: command.contentType,
      text: generatedText,
      wordCount,
      characterCount,
      metadata: {
        culturalContext: command.culturalContext,
        topicCategories: command.topicCategories || [],
        targetWpm,
        estimatedTime,
      },
      tags: this.generateTags(command),
    });

    return {
      content,
      metadata: {
        estimatedTime,
        targetWpm,
        complexity,
      },
    };
  }

  private async getBaseContentForLanguage(
    language: LanguageCode,
    contentType: ContentType
  ): Promise<string[]> {
    // This would typically load from language-specific datasets
    const languageContent: Record<
      LanguageCode,
      Record<ContentType, string[]>
    > = {
      [LanguageCode.EN]: {
        [ContentType.SENTENCES]: [
          "The quick brown fox jumps over the lazy dog.",
          "Technology advances rapidly in the modern world.",
          "Education is the key to personal development.",
        ],
        [ContentType.PARAGRAPHS]: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          "The digital revolution has transformed how we communicate, work, and learn. Every day brings new innovations.",
        ],
        [ContentType.CHARACTERS]: ["abcdefghijklmnopqrstuvwxyz"],
        [ContentType.NUMBERS]: ["0123456789"],
        [ContentType.SYMBOLS]: ["!@#$%^&*()_+-=[]{}|;:,.<>?"],
        [ContentType.MIXED]: [
          "The year 2024 brings 100% new challenges & opportunities!",
        ],
      },
      [LanguageCode.LI]: {
        [ContentType.SENTENCES]: [
          "ꓬꓲ ꓚꓰ ꓬꓲ ꓪꓴ ꓗꓪ ꓪꓴ˗ꓢ ꓡꓰ ꓟꓴ ꓗꓪˍ",
          "ꓪꓴ˗ꓢ ꓦꓻ ꓠꓬ ꓬꓲ ꓙꓬ ꓕꓯ ꓢꓲ ꓗꓪ ꓮꓹ ꓔꓬˍ",
        ],
        [ContentType.PARAGRAPHS]: ["ꓓ˗ꓪꓵ ꓠꓬ ꓮ˗ꓐ˗ꓡ˗ꓦ ꓞꓲꓼ ꓤ ꓡꓯꓹ ꓤ ꓥ ꓢꓲ꓾"],
        [ContentType.CHARACTERS]: ["ꓐꓑꓒꓓꓔꓕꓖꓗꓘꓙꓚꓛꓜꓝꓞꓟꓠꓡꓢꓣ"],
        [ContentType.NUMBERS]: ["0123456789"],
        [ContentType.SYMBOLS]: ["˗ˍ˙"],
        [ContentType.MIXED]: ["ꓬꓲ ꓚꓰ 2024 ꓗꓪ 100% ꓢꓲ꓾"],
      },
      [LanguageCode.MY]: {
        [ContentType.SENTENCES]: [
          "မြန်မာနိုင်ငံ၏ ယဉ်ကျေးမှုတန်ဖိုးများသည် အလွန်အရေးကြီးသည်။",
          "ပညာရေးသည် လူမှုအဆင့်အတန်း တိုးတက်ရန် အခြေခံအဖြစ် သတ်မှတ်ရမည်။",
        ],
        [ContentType.PARAGRAPHS]: [
          "မြန်မာနိုင်ငံ၏ ယဉ်ကျေးမှုတန်ဖိုးများသည် အလွန်အရေးကြီးသည်။ ပညာရေးသည် လူမှုအဆင့်အတန်း တိုးတက်ရန် အခြေခံအဖြစ် သတ်မှတ်ရမည်။",
        ],
        [ContentType.CHARACTERS]: ["ကခဂဃငစဆဇဈဉညတထဒဓနပဖဗဘမယရလဝသဟဠအ"],
        [ContentType.NUMBERS]: ["၀၁၂၃၄၅၆၇၈၉"],
        [ContentType.SYMBOLS]: ["၊။၍၎၏"],
        [ContentType.MIXED]: ["မြန်မာ 2024 ခုနှစ် 100% အောင်မြင်မှု"],
      },
    };

    return languageContent[language]?.[contentType] || [];
  }

  private async generateText(
    command: GenerateTypingContentCommand,
    baseContent: string[]
  ): Promise<string> {
    if (baseContent.length === 0) {
      throw new Error(
        `No base content available for ${command.language} ${command.contentType}`
      );
    }

    const targetLength =
      command.wordCount || this.getDefaultWordCount(command.difficulty);
    let generatedText = "";
    let currentLength = 0;

    while (currentLength < targetLength) {
      const randomContent =
        baseContent[Math.floor(Math.random() * baseContent.length)];

      if (command.contentType === ContentType.CHARACTERS) {
        // For character practice, repeat and shuffle
        const chars = randomContent.split("");
        for (let i = 0; i < Math.min(50, targetLength - currentLength); i++) {
          generatedText += chars[Math.floor(Math.random() * chars.length)];
          if (i % 5 === 4) generatedText += " "; // Add spaces every 5 characters
        }
      } else {
        generatedText += randomContent + " ";
      }

      currentLength = this.countWords(generatedText);
    }

    return generatedText.trim();
  }

  private getDefaultWordCount(difficulty: DifficultyLevel): number {
    const wordCountMap = {
      [DifficultyLevel.EASY]: 20,
      [DifficultyLevel.MEDIUM]: 50,
      [DifficultyLevel.HARD]: 100,
    };
    return wordCountMap[difficulty];
  }

  private calculateTargetWpm(difficulty: DifficultyLevel): number {
    const wpmMap = {
      [DifficultyLevel.EASY]: 20,
      [DifficultyLevel.MEDIUM]: 40,
      [DifficultyLevel.HARD]: 60,
    };
    return wpmMap[difficulty];
  }

  private calculateComplexity(
    text: string,
    difficulty: DifficultyLevel
  ): number {
    let complexity = 0;

    // Base complexity from difficulty
    const baseComplexity = {
      [DifficultyLevel.EASY]: 1,
      [DifficultyLevel.MEDIUM]: 2,
      [DifficultyLevel.HARD]: 3,
    };
    complexity += baseComplexity[difficulty];

    // Add complexity for special characters
    const specialChars = /[^\w\s]/g;
    const specialCharCount = (text.match(specialChars) || []).length;
    complexity += specialCharCount * 0.1;

    // Add complexity for numbers
    const numbers = /\d/g;
    const numberCount = (text.match(numbers) || []).length;
    complexity += numberCount * 0.05;

    return Math.round(complexity * 10) / 10;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private generateTags(command: GenerateTypingContentCommand): string[] {
    const tags: string[] = [
      command.language,
      command.difficulty,
      command.contentType,
    ];

    if (command.culturalContext) {
      tags.push(command.culturalContext);
    }

    if (command.includeNumbers) {
      tags.push("numbers");
    }

    if (command.includeSymbols) {
      tags.push("symbols");
    }

    return tags;
  }
}
