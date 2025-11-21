import { LayoutCompatibilityResponseDTO } from "@/application/dto/keyboard-layouts.dto";
import { GetLayoutCompatibilityQueryDTO } from "@/application/dto/queries.dto";
import { KeyboardLayout, LanguageCode, TypingMode } from "@/domain";
import { IKeyboardLayoutRepository } from "@/domain/interfaces/repositories";

export class ValidateLayoutCompatibilityUseCase {
  constructor(private layoutRepository: IKeyboardLayoutRepository) {}

  async execute(query: GetLayoutCompatibilityQueryDTO): Promise<LayoutCompatibilityResponseDTO> {
    const { layoutId, targetLanguage, mode } = query;

    // 1. Get the layout to validate
    const layout = await this.layoutRepository.findById(layoutId);
    if (!layout) {
      return {
        isCompatible: false,
        compatibilityScore: 0,
        issues: [
          {
            type: "error",
            message: `Layout not found: ${layoutId}`,
          },
        ],
        recommendations: [],
      };
    }

    // 2. Perform validation checks
    const validationResults = await this.performValidationChecks(layout, targetLanguage, mode);

    // 3. Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(validationResults);

    // 4. Generate recommendations
    const recommendations = this.generateRecommendations(validationResults, layout, mode);

    return {
      isCompatible: compatibilityScore >= 70, // 70% threshold for compatibility
      compatibilityScore,
      issues: validationResults.issues,
      recommendations,
    };
  }

  private async performValidationChecks(
    layout: KeyboardLayout,
    targetLanguage: LanguageCode,
    mode: TypingMode
  ): Promise<{
    issues: Array<{ type: "error" | "warning" | "info"; message: string; affectedKeys?: string[] }>;
    checks: {
      languageMatch: boolean;
      modeCompatibility: boolean;
      characterSupport: boolean;
      layoutIntegrity: boolean;
      performanceOptimized: boolean;
    };
  }> {
    const issues: Array<{ type: "error" | "warning" | "info"; message: string; affectedKeys?: string[] }> = [];

    // Language compatibility check
    const languageMatch = layout.language === targetLanguage;
    if (!languageMatch) {
      issues.push({
        type: "error",
        message: `Layout language (${layout.language}) does not match target language (${targetLanguage})`,
      });
    }

    // Mode compatibility check
    const modeCompatibility = this.checkModeCompatibility(layout, mode);
    if (!modeCompatibility.isCompatible) {
      issues.push({
        type: modeCompatibility.severity,
        message: modeCompatibility.message,
      });
    }

    // Character support validation
    const characterSupport = await this.validateCharacterSupport(layout, targetLanguage);
    if (characterSupport.missingChars.length > 0) {
      issues.push({
        type: "warning",
        message: `Layout may not support all required characters for ${targetLanguage}`,
        affectedKeys: characterSupport.missingChars,
      });
    }

    // Layout integrity check
    const layoutIntegrity = this.validateLayoutIntegrity(layout);
    if (!layoutIntegrity.isValid) {
      issues.push({
        type: "error",
        message: "Layout has structural issues",
        affectedKeys: layoutIntegrity.problematicKeys,
      });
    }

    // Performance optimization check
    const performanceOptimized = this.checkPerformanceOptimization(layout);
    if (performanceOptimized.warnings.length > 0) {
      performanceOptimized.warnings.forEach((warning) => {
        issues.push({
          type: "info",
          message: warning,
        });
      });
    }

    return {
      issues,
      checks: {
        languageMatch,
        modeCompatibility: modeCompatibility.isCompatible,
        characterSupport: characterSupport.missingChars.length === 0,
        layoutIntegrity: layoutIntegrity.isValid,
        performanceOptimized: performanceOptimized.warnings.length === 0,
      },
    };
  }

  private checkModeCompatibility(
    layout: KeyboardLayout,
    mode: TypingMode
  ): {
    isCompatible: boolean;
    severity: "error" | "warning" | "info";
    message: string;
  } {
    if (mode === TypingMode.COMPETITION) {
      if (layout.isCustom) {
        return {
          isCompatible: false,
          severity: "error",
          message: "Custom layouts are not allowed in competition mode",
        };
      }

      if (layout.metadata.version !== "1.0") {
        return {
          isCompatible: false,
          severity: "warning",
          message: "Only standard layout versions are recommended for competition mode",
        };
      }
    }

    if (mode === TypingMode.PRACTICE) {
      return {
        isCompatible: true,
        severity: "info",
        message: "Layout may provide limited feedback in practice mode",
      };
    }

    return {
      isCompatible: true,
      severity: "info",
      message: "Layout is compatible with the selected mode",
    };
  }

  private async validateCharacterSupport(
    layout: KeyboardLayout,
    language: LanguageCode
  ): Promise<{
    missingChars: string[];
    supportedChars: string[];
  }> {
    // Get required character set for the language
    const requiredChars = this.getRequiredCharacterSet(language);
    const layoutChars = new Set(layout.keyMappings.map((mapping) => mapping.character));

    const missingChars = requiredChars.filter((char) => !layoutChars.has(char));
    const supportedChars = requiredChars.filter((char) => layoutChars.has(char));

    return { missingChars, supportedChars };
  }

  private validateLayoutIntegrity(layout: KeyboardLayout): {
    isValid: boolean;
    problematicKeys: string[];
  } {
    const problematicKeys: string[] = [];

    // Check for duplicate key mappings
    const keyMap = new Map();
    layout.keyMappings.forEach((mapping) => {
      if (keyMap.has(mapping.key)) {
        problematicKeys.push(mapping.key);
      }
      keyMap.set(mapping.key, mapping);
    });

    // Check for essential keys
    const essentialKeys = ["space", "backspace", "enter"];
    essentialKeys.forEach((key) => {
      if (!keyMap.has(key) && !keyMap.has(`{${key}}`)) {
        problematicKeys.push(key);
      }
    });

    return {
      isValid: problematicKeys.length === 0,
      problematicKeys,
    };
  }

  private checkPerformanceOptimization(layout: KeyboardLayout): {
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check layout efficiency metrics
    if (layout.metadata.popularity < 30) {
      warnings.push("This layout has low popularity, which may indicate suboptimal design");
    }

    if (layout.keyMappings.length > 100) {
      warnings.push("Layout has many key mappings, which may impact performance");
    }

    return { warnings };
  }

  private calculateCompatibilityScore(results: {
    issues: Array<{ type: "error" | "warning" | "info"; message: string; affectedKeys?: string[] }>;
  }): number {
    let score = 100;

    // Deduct points for each issue
    results.issues.forEach((issue) => {
      switch (issue.type) {
        case "error":
          score -= 30;
          break;
        case "warning":
          score -= 15;
          break;
        case "info":
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  private generateRecommendations(
    results: {
      issues: Array<{ type: "error" | "warning" | "info"; message: string; affectedKeys?: string[] }>;
    },
    layout: KeyboardLayout,
    mode: TypingMode
  ): Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> {
    const recommendations: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }> = [];

    // Generate recommendations based on issues found
    const hasErrors = results.issues.some((issue) => issue.type === "error");
    const hasWarnings = results.issues.some((issue) => issue.type === "warning");

    if (hasErrors) {
      recommendations.push({
        title: "Consider Alternative Layout",
        description: "This layout has compatibility issues. Consider using a different layout for better performance.",
        priority: "high",
      });
    }

    if (hasWarnings && mode === TypingMode.COMPETITION) {
      recommendations.push({
        title: "Use Standard Layout for Competition",
        description: "For competition mode, use a standard, well-tested layout to ensure fair play.",
        priority: "medium",
      });
    }

    if (!hasErrors && !hasWarnings) {
      recommendations.push({
        title: "Layout Ready to Use",
        description: "This layout is fully compatible and optimized for your selected mode.",
        priority: "low",
      });
    }

    return recommendations;
  }

  private getRequiredCharacterSet(language: LanguageCode): string[] {
    // Basic character sets for each language
    const characterSets = {
      [LanguageCode.EN]: [
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
        " ",
      ],
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
        " ",
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
        "ညီ",
        "ညု",
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
        " ",
      ],
    };

    return characterSets[language] || [];
  }
}
