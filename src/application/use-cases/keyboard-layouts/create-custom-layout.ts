import { LanguageCode } from "@/domain";
import { KeyboardLayout, KeyMapping, LayoutMetadata } from "@/domain/entities/keyboard-layout";
import { FingerAssignment, LayoutVariant } from "@/domain/enums/keyboard-layouts";
import { DifficultyLevel } from "@/domain/enums/typing-mode";
import { IKeyboardLayoutRepository } from "@/domain/interfaces/repositories";

export interface CreateCustomLayoutCommand {
  name: string;
  displayName: string;
  language: LanguageCode;
  basedOn?: LayoutVariant; // Optional base layout to modify
  keyMappings: CustomKeyMapping[];
  description?: string;
  authorName?: string;
  tags?: string[];
  userId?: string;
  isPublic?: boolean;
}

export interface CustomKeyMapping {
  key: string;
  character: string; // Primary character
  shiftKey?: string;
  altKey?: string;
  altGrKey?: string;
  row: number;
  column: number;
  finger: FingerAssignment;
}

export interface CreateCustomLayoutResult {
  layout: KeyboardLayout;
  validationWarnings: ValidationWarning[];
  compatibilityScore: number;
}

export interface ValidationWarning {
  type: "missing_key" | "finger_overload" | "reach_difficulty" | "frequency_mismatch";
  message: string;
  severity: "low" | "medium" | "high";
  affectedKeys: string[];
}

export class CreateCustomLayoutUseCase {
  constructor(private keyboardLayoutRepository: IKeyboardLayoutRepository) {}

  async execute(command: CreateCustomLayoutCommand): Promise<CreateCustomLayoutResult> {
    // Validate layout data
    const validationResult = await this.validateLayout(command);

    if (validationResult.hasErrors) {
      throw new Error(`Layout validation failed: ${validationResult.errors.join(", ")}`);
    }

    // Convert custom mappings to domain mappings
    const keyMappings = this.convertToKeyMappings(command.keyMappings);

    // Create metadata for the layout
    const metadata: LayoutMetadata = {
      description: command.description || `Custom ${command.language} layout`,
      author: command.authorName || "Anonymous",
      version: "1.0.0",
      tags: command.tags || ["custom"],
      difficulty: DifficultyLevel.MEDIUM,
      compatibility: ["desktop"],
      popularity: 0,
      dateCreated: Date.now(),
      lastModified: Date.now(),
    };

    const now = Date.now();
    const layoutId = this.generateLayoutId(command.name, command.userId || "anonymous");

    // Create layout entity
    const layout = KeyboardLayout.create({
      id: layoutId,
      name: command.name,
      displayName: command.displayName,
      language: command.language,
      variant: LayoutVariant.US, // Will be overridden for custom layouts
      keyMappings: keyMappings,
      metadata: metadata,
      isCustom: true,
      createdBy: command.userId || "anonymous",
      createdAt: now,
      updatedAt: now,
    });

    await this.keyboardLayoutRepository.saveCustomLayout(layout);

    // Calculate compatibility score
    const compatibilityScore = await this.calculateCompatibilityScore(layout, command.language);

    return {
      layout,
      validationWarnings: validationResult.warnings,
      compatibilityScore,
    };
  }

  private async validateLayout(command: CreateCustomLayoutCommand): Promise<ValidationResult> {
    const warnings: ValidationWarning[] = [];
    const errors: string[] = [];

    // Check for required keys
    const requiredKeys = this.getRequiredKeysForLanguage(command.language);
    const providedKeys = command.keyMappings.map((m) => m.key);
    const missingKeys = requiredKeys.filter((key) => !providedKeys.includes(key));

    if (missingKeys.length > 0) {
      warnings.push({
        type: "missing_key",
        message: `Missing required keys: ${missingKeys.join(", ")}`,
        severity: missingKeys.length > 5 ? "high" : "medium",
        affectedKeys: missingKeys,
      });
    }

    // Check finger load distribution
    const fingerLoads = this.calculateFingerLoads(command.keyMappings, command.language);
    const overloadedFingers = Object.entries(fingerLoads)
      .filter(([_, load]) => load > 0.2) // More than 20% of keys
      .map(([finger]) => finger);

    if (overloadedFingers.length > 0) {
      warnings.push({
        type: "finger_overload",
        message: `High key load on fingers: ${overloadedFingers.join(", ")}`,
        severity: "medium",
        affectedKeys: [],
      });
    }

    // Check for difficult reaches
    const difficultReaches = this.findDifficultReaches(command.keyMappings);
    if (difficultReaches.length > 0) {
      warnings.push({
        type: "reach_difficulty",
        message: `Difficult key combinations detected: ${difficultReaches.join(", ")}`,
        severity: "low",
        affectedKeys: difficultReaches,
      });
    }

    // Validate name uniqueness
    const existingLayout = await this.keyboardLayoutRepository.findById(
      this.generateLayoutId(command.name, command.userId || "anonymous")
    );

    if (existingLayout) {
      errors.push("Layout name already exists for this user");
    }

    return {
      hasErrors: errors.length > 0,
      errors,
      warnings,
    };
  }

  private convertToKeyMappings(customMappings: CustomKeyMapping[]): KeyMapping[] {
    return customMappings.map((mapping) => ({
      key: mapping.key,
      character: mapping.character,
      shiftCharacter: mapping.shiftKey,
      altCharacter: mapping.altKey,
      ctrlCharacter: mapping.altGrKey,
      position: {
        row: mapping.row,
        column: mapping.column,
        finger: mapping.finger,
        hand: mapping.finger.toString().startsWith("left") ? ("left" as const) : ("right" as const),
      },
    }));
  }

  private generateLayoutId(name: string, createdBy: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `custom-${createdBy}-${cleanName}`;
  }

  private getRequiredKeysForLanguage(language: LanguageCode): string[] {
    const baseKeys = [
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
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      " ",
    ];

    const languageSpecific: Record<LanguageCode, string[]> = {
      [LanguageCode.EN]: [...baseKeys, ".", ",", "?", "!", ";", ":"],
      [LanguageCode.LI]: [
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
      ],
      [LanguageCode.MY]: [
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
        "ညဉ",
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
        "်",
        "္",
      ],
    };

    return languageSpecific[language] || baseKeys;
  }

  private calculateFingerLoads(mappings: CustomKeyMapping[], language: LanguageCode): Record<string, number> {
    const fingerCounts: Record<string, number> = {};
    const totalKeys = mappings.length;

    // Get frequency data for the language
    const keyFrequencies = this.getKeyFrequencies(language);

    mappings.forEach((mapping) => {
      const finger = mapping.finger;
      const frequency = keyFrequencies[mapping.key] || 0.001; // Default low frequency

      if (!fingerCounts[finger]) {
        fingerCounts[finger] = 0;
      }
      fingerCounts[finger] += frequency;
    });

    // Convert to percentages
    const fingerLoads: Record<string, number> = {};
    Object.entries(fingerCounts).forEach(([finger, count]) => {
      fingerLoads[finger] = count / totalKeys;
    });

    return fingerLoads;
  }

  private getKeyFrequencies(language: LanguageCode): Record<string, number> {
    // Simplified frequency data - in real implementation, this would come from linguistic analysis
    const frequencies: Record<LanguageCode, Record<string, number>> = {
      [LanguageCode.EN]: {
        e: 0.12,
        t: 0.09,
        a: 0.08,
        o: 0.075,
        i: 0.07,
        n: 0.067,
        s: 0.063,
        h: 0.061,
        r: 0.06,
        d: 0.043,
        l: 0.04,
        " ": 0.2,
      },
      [LanguageCode.LI]: {
        ꓐ: 0.08,
        ꓡ: 0.07,
        ꓬ: 0.06,
        ꓠ: 0.05,
        " ": 0.15,
      },
      [LanguageCode.MY]: {
        က: 0.06,
        မ: 0.05,
        န: 0.04,
        တ: 0.04,
        " ": 0.15,
      },
    };

    return frequencies[language] || {};
  }

  private findDifficultReaches(mappings: CustomKeyMapping[]): string[] {
    const difficultCombinations: string[] = [];

    // Find keys that require awkward finger movements
    mappings.forEach((mapping) => {
      const { row, column, finger } = mapping;

      // Check for excessive stretches
      if (finger === FingerAssignment.LEFT_PINKY && column > 2) {
        difficultCombinations.push(mapping.key);
      }
      if (finger === FingerAssignment.RIGHT_PINKY && column < 10) {
        difficultCombinations.push(mapping.key);
      }

      // Check for awkward row positions
      if ((finger.includes("INDEX") && row > 3) || (finger.includes("PINKY") && row > 2)) {
        difficultCombinations.push(mapping.key);
      }
    });

    return difficultCombinations;
  }

  private async calculateCompatibilityScore(layout: KeyboardLayout, language: LanguageCode): Promise<number> {
    let score = 100; // Start with perfect score

    // Deduct points for missing common keys
    const requiredKeys = this.getRequiredKeysForLanguage(language);
    const layoutKeys = layout.keyMappings.map((m) => m.key);
    const missingKeys = requiredKeys.filter((key) => !layoutKeys.includes(key));
    score -= missingKeys.length * 5;

    // Deduct points for poor finger distribution
    const fingerLoads = this.calculateFingerLoads(
      layout.keyMappings.map((m) => ({
        key: m.key,
        character: m.character,
        shiftKey: m.shiftCharacter,
        altKey: m.altCharacter,
        altGrKey: m.ctrlCharacter,
        row: m.position.row,
        column: m.position.column,
        finger: m.position.finger,
      })),
      language
    );

    const maxLoad = Math.max(...Object.values(fingerLoads));
    if (maxLoad > 0.25) score -= 20;
    if (maxLoad > 0.3) score -= 30;

    // Bonus points for good design
    if (Object.keys(fingerLoads).length >= 8) score += 10; // Uses all fingers

    return Math.max(0, Math.min(100, score));
  }
}

interface ValidationResult {
  hasErrors: boolean;
  errors: string[];
  warnings: ValidationWarning[];
}
