/**
 * Mock implementation of ITextGenerationService for development and testing
 */

import { ITextGenerationService, TextGenerationConfig } from "../../../domain/interfaces/services";
import { DifficultyLevel, TypingMode, TextType } from "../../../domain/enums/typing-mode";
import { LanguageCode } from "@/domain";

export class MockTextGenerationService implements ITextGenerationService {
  private wordPools: Map<string, string[]> = new Map();
  private sentencePools: Map<string, string[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // English word pools
    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.EASY}`, [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'how',
      'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did'
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.MEDIUM}`, [
      'about', 'after', 'again', 'before', 'being', 'below', 'between', 'called',
      'could', 'different', 'during', 'every', 'first', 'found', 'government',
      'great', 'group', 'important', 'large', 'little', 'long', 'make',
      'number', 'other', 'people', 'place', 'right', 'school', 'small', 'system'
    ]);

    this.wordPools.set(`${LanguageCode.EN}-${DifficultyLevel.HARD}`, [
      'acknowledge', 'administrative', 'consequently', 'development', 'environment',
      'extraordinary', 'fundamentally', 'governmental', 'hypothetically', 'implementation',
      'jurisdiction', 'knowledgeable', 'manufacturer', 'neighborhood', 'organization',
      'psychological', 'questionable', 'revolutionary', 'sophisticated', 'technological',
      'unconsciously', 'vocabulary', 'western', 'xerography', 'yesterday', 'zoological'
    ]);

    // Lisu word pools
    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.EASY}`, [
      'ꓐꓯ', 'ꓡꓲ', 'ꓞꓳ', 'ꓜꓴ', 'ꓝꓱ', 'ꓗꓰ', 'ꓔꓲ', 'ꓦꓳ', 'ꓙꓲ', 'ꓠꓴ',
      'ꓨꓲ', 'ꓢꓳ', 'ꓣꓱ', 'ꓘꓰ', 'ꓖꓲ', 'ꓚꓳ', 'ꓛꓴ', 'ꓟꓱ', 'ꓤꓰ', 'ꓥꓲ'
    ]);

    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.MEDIUM}`, [
      'ꓐꓯꓛꓲ', 'ꓡꓲꓞꓳ', 'ꓜꓴꓝꓱ', 'ꓗꓰꓔꓲ', 'ꓦꓳꓙꓲ', 'ꓠꓴꓨꓲ', 'ꓢꓳꓣꓱ',
      'ꓘꓰꓖꓲ', 'ꓚꓳꓛꓴ', 'ꓟꓱꓤꓰ', 'ꓥꓲꓐꓯ', 'ꓡꓲꓞꓳ', 'ꓜꓴꓝꓱ', 'ꓗꓰꓔꓲ'
    ]);

    this.wordPools.set(`${LanguageCode.LI}-${DifficultyLevel.HARD}`, [
      'ꓐꓯꓛꓲꓞꓳ', 'ꓡꓲꓜꓴꓝꓱ', 'ꓗꓰꓔꓲꓦꓳ', 'ꓙꓲꓠꓴꓨꓲ', 'ꓢꓳꓣꓱꓘꓰ',
      'ꓖꓲꓚꓳꓛꓴ', 'ꓟꓱꓤꓰꓥꓲ', 'ꓐꓯꓡꓲꓞꓳ', 'ꓜꓴꓝꓱꓗꓰ', 'ꓔꓲꓦꓳꓙꓲ'
    ]);

    // Myanmar word pools
    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.EASY}`, [
      'မ', 'တ', 'န', 'အ', 'က', 'လ', 'သ', 'ပ', 'ရ', 'ဆ',
      'ခ', 'ဝ', 'ယ', 'ဖ', 'ဂ', 'ဇ', 'ဈ', 'ဉ', 'ည', 'ဒ'
    ]);

    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.MEDIUM}`, [
      'မနက်', 'ညနေ', 'အိမ်', 'ကျောင်း', 'သမီး', 'သား', 'အမေ', 'အဖေ',
      'လူ', 'ရေ', 'ထမင်း', 'စာ', 'အလုပ်', 'မြို့', 'ကား', 'ဘတ်စ်'
    ]);

    this.wordPools.set(`${LanguageCode.MY}-${DifficultyLevel.HARD}`, [
      'အစိုးရ', 'နိုင်ငံ', 'ပညာရေး', 'စီးပွားရေး', 'နည်းပညာ', 'ကျန်းမာရေး',
      'ပတ်ဝန်းကျင်', 'လူမှုရေး', 'ယဉ်ကျေးမှု', 'တရားမျှတမှု', 'လွတ်လပ်မှု'
    ]);

    // Sentence pools
    this.sentencePools.set(LanguageCode.EN, [
      'The quick brown fox jumps over the lazy dog.',
      'A journey of a thousand miles begins with a single step.',
      'To be or not to be, that is the question.',
      'All that glitters is not gold.',
      'Knowledge is power and power is knowledge.',
      'Practice makes perfect when perfect practice is maintained.',
      'The pen is mightier than the sword in many situations.',
      'Time flies when you are having fun with friends.',
      'Better late than never, but never late is better.',
      'Actions speak louder than words in most cases.'
    ]);

    this.sentencePools.set(LanguageCode.LI, [
      'ꓐꓯ ꓡꓲ ꓞꓳ ꓜꓴ ꓝꓱ ꓗꓰ ꓔꓲ ꓦꓳ ꓙꓲ ꓠꓴ.',
      'ꓨꓲ ꓢꓳ ꓣꓱ ꓘꓰ ꓖꓲ ꓚꓳ ꓛꓴ ꓟꓱ ꓤꓰ ꓥꓲ.',
      'ꓐꓯꓛꓲ ꓞꓳ ꓜꓴ ꓝꓱ ꓗꓰ ꓔꓲ ꓦꓳ ꓙꓲ ꓠꓴ ꓨꓲ.',
    ]);

    this.sentencePools.set(LanguageCode.MY, [
      'မနက်ဖြန် ကျောင်းကို သွားမယ်။',
      'ညနေခင်း အိမ်ပြန်တော့မယ်။',
      'ထမင်းစားပြီး စာဖတ်မယ်။',
      'မိုးရွာလို့ အိမ်မှာ နေမယ်။',
      'သူငယ်ချင်းတွေနဲ့ ကစားမယ်။'
    ]);
  }

  async generate(config: TextGenerationConfig): Promise<string> {
    const wordPool = this.getWordPool(config.language, config.difficulty, config.customWords);
    const words = this.selectRandomWords(wordPool, config.length);

    let content = words.join(' ');

    // Add punctuation for higher difficulties
    if (config.difficulty !== DifficultyLevel.EASY) {
      content = this.addPunctuation(content, config.language);
    }

    return content;
  }

  async validateText(text: string, language: LanguageCode): Promise<boolean> {
    if (!text.trim()) return false;

    // Basic validation - check if content matches language expectations
    if (language === LanguageCode.EN) {
      return /^[a-zA-Z0-9\s.,!?;:"'-]+$/.test(text);
    } else if (language === LanguageCode.LI) {
      return /[\u10300-\u1032F]/.test(text);
    } else if (language === LanguageCode.MY) {
      return /[\u1000-\u109F]/.test(text);
    }

    return true;
  }

  async getDifficultyScore(text: string, language: LanguageCode): Promise<number> {
    const words = text.split(/\s+/).filter(word => word.length > 0);
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

  private getWordPool(language: LanguageCode, difficulty: DifficultyLevel, customWords?: string[]): string[] {
    if (customWords && customWords.length > 0) {
      return customWords;
    }

    const key = `${language}-${difficulty}`;
    return this.wordPools.get(key) || this.wordPools.get(`${LanguageCode.EN}-${DifficultyLevel.MEDIUM}`)!;
  }

  private selectRandomWords(wordPool: string[], count: number): string[] {
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * wordPool.length);
      selected.push(wordPool[randomIndex]);
    }
    return selected;
  }

  private selectWordsWithSeed(wordPool: string[], count: number, seed: number): string[] {
    const selected: string[] = [];
    let currentSeed = seed;

    for (let i = 0; i < count; i++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280; // Simple LCG
      const index = currentSeed % wordPool.length;
      selected.push(wordPool[index]);
    }
    return selected;
  }

  private selectRandomSentences(sentencePool: string[], count: number): string[] {
    const selected: string[] = [];
    const usedIndices = new Set<number>();

    while (selected.length < count && usedIndices.size < sentencePool.length) {
      const randomIndex = Math.floor(Math.random() * sentencePool.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selected.push(sentencePool[randomIndex]);
      }
    }
    return selected;
  }

  private addPunctuation(text: string, language: LanguageCode): string {
    const punctuation = language === LanguageCode.EN
      ? ['.', ',', '!', '?', ';', ':']
      : ['။', '၊', '၏', '၌', '၍', '၎'];

    const words = text.split(' ');
    const result: string[] = [];

    words.forEach((word, index) => {
      result.push(word);
      if (Math.random() < 0.15 && index < words.length - 1) {
        const randomPunct = punctuation[Math.floor(Math.random() * punctuation.length)];
        result[result.length - 1] += randomPunct;
      }
    });

    return result.join(' ');
  }

  private addNumbers(text: string): string {
    const words = text.split(' ');
    const result: string[] = [];

    words.forEach((word, index) => {
      result.push(word);
      if (Math.random() < 0.1 && index < words.length - 1) {
        const randomNumber = Math.floor(Math.random() * 1000).toString();
        result.push(randomNumber);
      }
    });

    return result.join(' ');
  }

  private getCompetitionSeed(competitionId: string): number {
    // Generate consistent seed from competition ID
    let hash = 0;
    for (let i = 0; i < competitionId.length; i++) {
      const char = competitionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateEstimatedTime(wordCount: number): number {
    // Rough estimate: 40 WPM average
    const averageWPM = 40;
    const minutes = wordCount / averageWPM;
    return Math.ceil(minutes * 60); // Return seconds
  }
}