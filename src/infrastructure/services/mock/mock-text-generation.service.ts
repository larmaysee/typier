/**
 * Mock implementation of ITextGenerationService for development and testing
 * Updated to support new difficulty-based text generation rules
 */

import { LanguageCode } from "@/domain";
import { DifficultyLevel, TextType, TypingMode } from "@/domain/enums/typing-mode";
import {
  GeneratedText,
  ITextGenerationService,
  TextGenerationConfig,
} from "@/domain/interfaces/text-generation.interface";

export class MockTextGenerationService implements ITextGenerationService {
  private wordPools: Map<string, string[]> = new Map();
  private sentencePools: Map<string, string[]> = new Map();
  private numberPools: string[] = [];
  private specialCharPools: string[] = [];
  private codePools: Map<string, string[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize number pools
    this.numberPools = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    // Initialize special character pools
    this.specialCharPools = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "+",
      "=",
      "[",
      "]",
      "{",
      "}",
      "|",
      "\\",
      ":",
      ";",
      '"',
      "'",
      "<",
      ">",
      ",",
      ".",
      "?",
      "/",
      "~",
      "`",
    ];

    // English word pools for EASY difficulty (chars, words, numbers)
    // Left hand keys: q w e r t a s d f g z x c v b (QWERTY layout)
    // Right hand keys: y u i o p h j k l n m
    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}-chars-left`, [
      "a",
      "s",
      "d",
      "f",
      "g",
      "q",
      "w",
      "e",
      "r",
      "t",
      "z",
      "x",
      "c",
      "v",
      "b",
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}-chars-right`, [
      "h",
      "j",
      "k",
      "l",
      "y",
      "u",
      "i",
      "o",
      "p",
      "n",
      "m",
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}-chars`, [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}-words`, [
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "cat",
      "dog",
      "run",
      "big",
      "red",
      "hot",
      "sun",
      "car",
      "box",
      "top",
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}-numbers`, [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "10",
      "20",
      "30",
      "100",
      "123",
      "456",
      "789",
      "2024",
      "2025",
    ]);

    // English pools for MEDIUM difficulty (sentences, paragraphs)
    this.sentencePools.set(`${LanguageCode.EN}-${DifficultyLevel.MEDIUM}`, [
      "The quick brown fox jumps over the lazy dog.",
      "A journey of a thousand miles begins with a single step.",
      "Practice makes perfect when you work hard every day.",
      "Technology is advancing rapidly in the modern world.",
      "Learning new skills requires patience and dedication.",
      "The weather today is quite pleasant for outdoor activities.",
      "Reading books helps expand your knowledge and vocabulary.",
      "Exercise is important for maintaining good health.",
      "Communication skills are essential in professional settings.",
      "Time management can improve productivity significantly.",
      "Education opens doors to countless opportunities in life.",
      "Teamwork and collaboration lead to better outcomes.",
      "Innovation drives progress in every field of study.",
      "Determination and perseverance overcome most obstacles.",
      "Critical thinking skills are valuable in problem-solving.",
      "Creativity flourishes when you explore new perspectives.",
      "Effective leadership inspires and motivates others.",
      "Continuous improvement is the key to long-term success.",
      "Adaptability helps navigate changing circumstances gracefully.",
      "Clear communication prevents misunderstandings and conflicts.",
      "Professional development enhances career growth opportunities.",
      "Digital literacy is essential in today's technology-driven world.",
      "Cultural awareness promotes understanding and respect.",
      "Environmental sustainability requires collective action.",
      "Financial planning ensures stability and security.",
      "Healthy habits contribute to overall well-being.",
      "Social connections enrich our daily experiences.",
      "Emotional intelligence improves interpersonal relationships.",
      "Strategic thinking enables better decision making.",
      "Lifelong learning keeps the mind sharp and engaged.",
    ]);

    // English pools for HARD difficulty (mixed all)
    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.HARD}`, [
      "JavaScript",
      "TypeScript",
      "React.js",
      "Node.js",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Kubernetes",
      "GraphQL",
      "API",
      "JSON",
      "HTML5",
      "CSS3",
      "ES6+",
      "npm",
      "yarn",
      "Git",
      "GitHub",
      "CI/CD",
      "DevOps",
      "microservices",
    ]);

    // Code samples for HARD difficulty
    this.codePools.set(`${LanguageCode.EN}-code`, [
      "const app = express();",
      "function calculateSum(a, b) { return a + b; }",
      'import React from "react";',
      "export default function App() {}",
      "if (condition && isValid) { return true; }",
      "const [state, setState] = useState(0);",
      'async function fetchData() { await fetch("/api"); }',
      'console.log("Hello, World!");',
      'const obj = { key: "value", num: 42 };',
      "for (let i = 0; i < array.length; i++) {}",
    ]);

    // Lisu character pools for EASY
    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.EASY}-chars`, [
      "ꓐ",
      "ꓑ",
      "ꓒ",
      "ꓓ",
      "ꓔ",
      "ꓕ",
      "ꓖ",
      "ꓗ",
      "ꓘ",
      "ꓙ",
      "ꓚ",
      "ꓛ",
      "ꓜ",
      "ꓝ",
      "ꓞ",
      "ꓟ",
      "ꓠ",
      "ꓡ",
      "ꓢ",
      "ꓣ",
      "ꓤ",
      "ꓥ",
      "ꓦ",
      "ꓧ",
      "ꓨ",
      "ꓩ",
      "ꓪ",
      "ꓫ",
      "ꓬ",
      "ꓭ",
      "ꓮ",
      "ꓯ",
      "ꓰ",
      "ꓱ",
      "ꓲ",
      "ꓳ",
      "ꓴ",
      "ꓵ",
      "ꓶ",
      "ꓷ",
      "ꓸ",
      "ꓹ",
      "ꓺ",
      "ꓻ",
      "ꓼ",
      "ꓽ",
      "꓾",
      "꓿",
    ]);

    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.EASY}-words`, [
      "ꓐꓯ",
      "ꓡꓲ",
      "ꓞꓳ",
      "ꓜꓴ",
      "ꓝꓱ",
      "ꓗꓰ",
      "ꓔꓲ",
      "ꓦꓳ",
      "ꓙꓲ",
      "ꓠꓴ",
      "ꓨꓲ",
      "ꓢꓳ",
      "ꓣꓱ",
      "ꓘꓰ",
      "ꓖꓲ",
      "ꓚꓳ",
      "ꓛꓴ",
      "ꓟꓱ",
      "ꓤꓰ",
      "ꓥꓲ",
    ]);

    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.EASY}-numbers`, [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
    ]);

    // Lisu sentences for MEDIUM
    this.sentencePools.set(`${LanguageCode.LI}-${DifficultyLevel.MEDIUM}`, [
      "ꓐꓯ ꓡꓲ ꓞꓳ ꓜꓴ ꓝꓱ ꓗꓰ ꓔꓲ ꓦꓳ ꓙꓲ ꓠꓴꓸ",
      "ꓨꓲ ꓢꓳ ꓣꓱ ꓘꓰ ꓖꓲ ꓚꓳ ꓛꓴ ꓟꓱ ꓤꓰ ꓥꓲꓸ",
      "ꓐꓯꓛꓲ ꓞꓳ ꓜꓴ ꓝꓱ ꓗꓰ ꓔꓲ ꓦꓳ ꓙꓲ ꓠꓴ ꓨꓲꓸ",
    ]);

    // Lisu mixed for HARD
    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.HARD}`, [
      "ꓐꓯꓛꓲꓞꓳ",
      "ꓡꓲꓜꓴꓝꓱ",
      "ꓗꓰꓔꓲꓦꓳ",
      "ꓙꓲꓠꓴꓨꓲ",
      "ꓢꓳꓣꓱꓘꓰ",
      "ꓖꓲꓚꓳꓛꓴ",
      "ꓟꓱꓤꓰꓥꓲ",
      "ꓐꓯꓡꓲꓞꓳ",
      "ꓜꓴꓝꓱꓗꓰ",
      "ꓔꓲꓦꓳꓙꓲ",
    ]);

    // Myanmar character pools for EASY
    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.EASY}-chars`, [
      "က",
      "ခ",
      "ဂ",
      "ဃ",
      "င",
      "စ",
      "ဆ",
      "ဇ",
      "ဈ",
      "ဉ",
      "ည",
      "တ",
      "ထ",
      "ဒ",
      "ဓ",
      "န",
      "ပ",
      "ဖ",
      "ဗ",
      "ဘ",
      "မ",
      "ယ",
      "ရ",
      "လ",
      "ဝ",
      "သ",
      "ဟ",
      "ဠ",
      "အ",
    ]);

    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.EASY}-words`, [
      "မ",
      "တ",
      "န",
      "အ",
      "က",
      "လ",
      "သ",
      "ပ",
      "ရ",
      "ဆ",
      "ခ",
      "ဝ",
      "ယ",
      "ဖ",
      "ဂ",
      "ဇ",
      "ဈ",
      "ဉ",
      "ည",
      "ဒ",
    ]);

    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.EASY}-numbers`, [
      "၁",
      "၂",
      "၃",
      "၄",
      "၅",
      "၆",
      "၇",
      "၈",
      "၉",
      "၀",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);

    // Myanmar sentences for MEDIUM
    this.sentencePools.set(`${LanguageCode.MY}-${DifficultyLevel.MEDIUM}`, [
      "မနက်ဖြန် ကျောင်းကို သွားမယ်။",
      "ညနေခင်း အိမ်ပြန်တော့မယ်။",
      "ထမင်းစားပြီး စာဖတ်မယ်။",
      "မိုးရွာလို့ အိမ်မှာ နေမယ်။",
      "သူငယ်ချင်းတွေနဲ့ ကစားမယ်။",
    ]);

    // Myanmar mixed for HARD
    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.HARD}`, [
      "အစိုးရ",
      "နိုင်ငံ",
      "ပညာရေး",
      "စီးပွားရေး",
      "နည်းပညာ",
      "ကျန်းမာရေး",
      "ပတ်ဝန်းကျင်",
      "လူမှုရေး",
      "ယဉ်ကျေးမှု",
      "တရားမျှတမှု",
      "လွတ်လပ်မှု",
    ]);
  }

  async generate(config: TextGenerationConfig): Promise<GeneratedText> {
    let content = "";

    // Generate content based on mode and difficulty rules
    if (config.mode === TypingMode.COMPETITION) {
      // Competition mode - admin provided content (for now use medium difficulty as placeholder)
      content = await this.generateMediumContent(config);
    } else {
      // Normal and Practice modes use the same content generation rules
      content = await this.generateContentByDifficulty(config);
    }

    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;
    const characterCount = content.length;
    const estimatedTime = this.calculateEstimatedTime(wordCount, config.difficulty);

    return {
      content,
      metadata: {
        wordCount,
        characterCount,
        difficulty: config.difficulty,
        language: config.language,
        textType: config.textType,
        estimatedTime,
        source: config.mode === TypingMode.COMPETITION ? "admin-provided" : "generated",
      },
    };
  }

  private async generateContentByDifficulty(config: TextGenerationConfig): Promise<string> {
    switch (config.difficulty) {
      case DifficultyLevel.EASY:
        return this.generateEasyContent(config);
      case DifficultyLevel.MEDIUM:
        return this.generateMediumContent(config);
      case DifficultyLevel.HARD:
        return this.generateHardContent(config);
      default:
        return this.generateMediumContent(config);
    }
  }

  /**
   * EASY: chars, words (no numbers)
   * For CHARS text type: generates left hand, then right hand practice format (min 300 chars)
   */
  private generateEasyContent(config: TextGenerationConfig): string {
    const parts: string[] = [];

    // Special handling for CHARS text type - generate left/right hand practice
    if (config.textType === TextType.CHARS) {
      const minChars = 300;
      const leftHandPool = this.wordPools.get(`${config.language}-${config.difficulty}-chars-left`) || [];
      const rightHandPool = this.wordPools.get(`${config.language}-${config.difficulty}-chars-right`) || [];

      if (leftHandPool.length > 0 && rightHandPool.length > 0) {
        // Generate left hand practice (first half)
        const leftHandCount = Math.ceil(minChars / 2);
        for (let i = 0; i < leftHandCount; i++) {
          parts.push(leftHandPool[Math.floor(Math.random() * leftHandPool.length)]);
        }

        // Generate right hand practice (second half)
        const rightHandCount = Math.ceil(minChars / 2);
        for (let i = 0; i < rightHandCount; i++) {
          parts.push(rightHandPool[Math.floor(Math.random() * rightHandPool.length)]);
        }

        return parts.join(" ");
      }
    }

    // Default behavior for WORDS or fallback
    const contentLength = Math.max(config.length || 30, 20); // Minimum 20 items

    // Mix of chars (40%) and words (60%) - no numbers in easy mode
    const charsCount = Math.floor(contentLength * 0.4);
    const wordsCount = Math.floor(contentLength * 0.6);

    // Add characters
    const charPool = this.wordPools.get(`${config.language}-${config.difficulty}-chars`) || [];
    for (let i = 0; i < charsCount && charPool.length > 0; i++) {
      parts.push(charPool[Math.floor(Math.random() * charPool.length)]);
    }

    // Add words
    const wordPool = this.wordPools.get(`${config.language}-${config.difficulty}-words`) || [];
    for (let i = 0; i < wordsCount && wordPool.length > 0; i++) {
      parts.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }

    // Numbers are excluded from easy mode

    // Shuffle and join
    this.shuffleArray(parts);
    return parts.join(" ");
  }

  /**
   * MEDIUM: sentences, paragraphs (minimum 300 words)
   */
  private generateMediumContent(config: TextGenerationConfig): string {
    const sentencePool =
      this.sentencePools.get(`${config.language}-${config.difficulty}`) ||
      this.sentencePools.get(config.language) ||
      [];

    if (sentencePool.length === 0) {
      // Fallback to easy words if no sentences available
      return this.generateEasyContent(config);
    }

    // Target at least 300 words
    const minWords = 300;
    const selectedSentences: string[] = [];
    let currentWordCount = 0;

    // Keep adding sentences until we reach at least 300 words
    while (currentWordCount < minWords) {
      const randomSentence = sentencePool[Math.floor(Math.random() * sentencePool.length)];
      selectedSentences.push(randomSentence);

      // Count words in the sentence
      const wordsInSentence = randomSentence.split(/\s+/).filter((word) => word.length > 0).length;
      currentWordCount += wordsInSentence;
    }

    return selectedSentences.join(" ");
  }

  /**
   * HARD: mixed all (numbers, lowercase, uppercase, special characters, code)
   */
  private generateHardContent(config: TextGenerationConfig): string {
    const parts: string[] = [];
    const contentLength = Math.max(config.length || 40, 25);

    // Get hard words
    const hardWordPool = this.wordPools.get(`${config.language}-${config.difficulty}`) || [];
    const codePool = this.codePools.get(`${config.language}-code`) || [];

    // Mix of: hard words (40%), code snippets (30%), mixed case (20%), special chars (10%)
    const hardWordsCount = Math.floor(contentLength * 0.4);
    const codeCount = Math.floor(contentLength * 0.3);
    const mixedCaseCount = Math.floor(contentLength * 0.2);
    const specialCount = Math.floor(contentLength * 0.1);

    // Add hard words
    for (let i = 0; i < hardWordsCount && hardWordPool.length > 0; i++) {
      parts.push(hardWordPool[Math.floor(Math.random() * hardWordPool.length)]);
    }

    // Add code snippets
    for (let i = 0; i < codeCount && codePool.length > 0; i++) {
      parts.push(codePool[Math.floor(Math.random() * codePool.length)]);
    }

    // Add mixed case words
    const baseWords = this.wordPools.get(`${config.language}-${DifficultyLevel.EASY}-words`) || [];
    for (let i = 0; i < mixedCaseCount && baseWords.length > 0; i++) {
      const word = baseWords[Math.floor(Math.random() * baseWords.length)];
      const mixedWord = this.randomizeCase(word);
      parts.push(mixedWord);
    }

    // Add numbers and special characters
    for (let i = 0; i < specialCount; i++) {
      if (Math.random() < 0.5) {
        // Add number
        parts.push(Math.floor(Math.random() * 1000).toString());
      } else {
        // Add special character combination
        const specialChar = this.specialCharPools[Math.floor(Math.random() * this.specialCharPools.length)];
        const baseWord = baseWords[Math.floor(Math.random() * baseWords.length)] || "test";
        parts.push(`${baseWord}${specialChar}${Math.floor(Math.random() * 10)}`);
      }
    }

    // Shuffle and join
    this.shuffleArray(parts);
    return parts.join(" ");
  }

  private randomizeCase(word: string): string {
    return word
      .split("")
      .map((char) => (Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase()))
      .join("");
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async supportsLanguage(language: LanguageCode): Promise<boolean> {
    return [LanguageCode.EN, LanguageCode.LI, LanguageCode.MY].includes(language);
  }

  async getAvailableTextTypes(): Promise<TextType[]> {
    return [TextType.CHARS, TextType.WORDS, TextType.NUMBERS, TextType.SENTENCES, TextType.PARAGRAPHS, TextType.CODE];
  }

  async validateContent(content: string, config: TextGenerationConfig): Promise<boolean> {
    if (!content.trim()) return false;

    // Basic validation - check if content matches language expectations
    if (config.language === LanguageCode.EN) {
      return /^[a-zA-Z0-9\s.,!?;:"'\-_+=\[\]{}|\\<>/@#$%^&*()~`]+$/.test(content);
    } else if (config.language === LanguageCode.LI) {
      return /[\u10300-\u1032F]/.test(content);
    } else if (config.language === LanguageCode.MY) {
      return /[\u1000-\u109F]/.test(content);
    }

    return true;
  }

  // Legacy methods for backward compatibility
  async validateText(text: string, language: LanguageCode): Promise<boolean> {
    if (!text.trim()) return false;

    // Basic validation - check if content matches language expectations
    if (language === LanguageCode.EN) {
      return /^[a-zA-Z0-9\s.,!?;:"'\-_+=\[\]{}|\\<>/@#$%^&*()~`]+$/.test(text);
    } else if (language === LanguageCode.LI) {
      return /[\u10300-\u1032F]/.test(text);
    } else if (language === LanguageCode.MY) {
      return /[\u1000-\u109F]/.test(text);
    }

    return true;
  }

  async getDifficultyScore(text: string, language: LanguageCode): Promise<number> {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Simple scoring based on average word length and character complexity
    let score = avgWordLength * 10;

    // Add complexity for punctuation and special characters
    const complexChars = (text.match(/[^\w\s]/g) || []).length;
    score += complexChars * 5;

    // Language-specific adjustments
    if (language === LanguageCode.LI || language === LanguageCode.MY) {
      score += 20; // Non-Latin scripts are inherently more difficult
    }

    return Math.min(score, 100); // Cap at 100
  }

  private calculateEstimatedTime(wordCount: number, difficulty: DifficultyLevel): number {
    // Adjust WPM based on difficulty
    let averageWPM = 40;
    switch (difficulty) {
      case DifficultyLevel.EASY:
        averageWPM = 50;
        break;
      case DifficultyLevel.MEDIUM:
        averageWPM = 40;
        break;
      case DifficultyLevel.HARD:
        averageWPM = 25;
        break;
    }

    const minutes = wordCount / averageWPM;
    return Math.ceil(minutes * 60); // Return seconds
  }
}
