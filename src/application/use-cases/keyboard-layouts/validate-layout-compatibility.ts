import { IKeyboardLayoutRepository } from '@/domain/interfaces/repositories';
import { ILayoutManagerService } from '@/domain/interfaces/services';
import { ValidateLayoutCompatibilityQuery } from '@/application/queries/typing.queries';
import { LayoutCompatibilityDto } from '@/application/dto/keyboard-layout.dto';

export class ValidateLayoutCompatibilityUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private layoutManager: ILayoutManagerService
  ) {}

  async execute(query: ValidateLayoutCompatibilityQuery): Promise<LayoutCompatibilityDto> {
    const { layoutId, textContent } = query;

    // 1. Validate layout exists
    const layout = await this.layoutRepository.findById(layoutId);
    if (!layout) {
      throw new Error(`Layout not found: ${layoutId}`);
    }

    // 2. Check basic compatibility
    const isCompatible = await this.layoutManager.isCompatible(layoutId, textContent);

    // 3. Analyze text content for compatibility details
    const analysisResult = this.analyzeTextCompatibility(layout, textContent);

    return {
      layoutId,
      textContent: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : ''), // Truncate for response
      isCompatible,
      compatibilityScore: analysisResult.score,
      missingCharacters: analysisResult.missingChars,
      recommendations: analysisResult.recommendations
    };
  }

  private analyzeTextCompatibility(layout: any, textContent: string): {
    score: number;
    missingChars: string[];
    recommendations: string[];
  } {
    // Extract unique characters from text content
    const textChars = new Set(textContent.split(''));
    
    // Get available characters from layout
    const layoutChars = new Set();
    for (const mapping of layout.keyMappings || []) {
      layoutChars.add(mapping.character);
      if (mapping.shiftCharacter) {
        layoutChars.add(mapping.shiftCharacter);
      }
      if (mapping.altCharacter) {
        layoutChars.add(mapping.altCharacter);
      }
    }

    // Find missing characters
    const missingChars: string[] = [];
    const unsupportedChars: string[] = [];

    for (const char of textChars) {
      // Skip whitespace and common punctuation that's usually available
      if (char === ' ' || char === '\n' || char === '\t') {
        continue;
      }

      if (!layoutChars.has(char)) {
        missingChars.push(char);
        
        // Check if it's a complex character that might need special input methods
        if (this.isComplexCharacter(char)) {
          unsupportedChars.push(char);
        }
      }
    }

    // Calculate compatibility score
    const totalUniqueChars = textChars.size;
    const supportedChars = totalUniqueChars - missingChars.length;
    const score = totalUniqueChars > 0 ? Math.round((supportedChars / totalUniqueChars) * 100) : 100;

    // Generate recommendations
    const recommendations = this.generateRecommendations(layout, missingChars, unsupportedChars);

    return {
      score,
      missingChars: [...new Set(missingChars)].slice(0, 20), // Limit to first 20 unique missing chars
      recommendations
    };
  }

  private isComplexCharacter(char: string): boolean {
    const codePoint = char.codePointAt(0);
    if (!codePoint) return false;

    // Unicode blocks for complex scripts
    const complexScriptRanges = [
      [0x0900, 0x097F], // Devanagari
      [0x0980, 0x09FF], // Bengali
      [0x1000, 0x109F], // Myanmar
      [0xA4D0, 0xA4FF], // Lisu
      [0x0E00, 0x0E7F], // Thai
      [0x3400, 0x4DBF], // CJK Extension A
      [0x4E00, 0x9FFF], // CJK Unified Ideographs
    ];

    return complexScriptRanges.some(([start, end]) => codePoint >= start && codePoint <= end);
  }

  private generateRecommendations(layout: any, missingChars: string[], unsupportedChars: string[]): string[] {
    const recommendations: string[] = [];

    if (missingChars.length === 0) {
      recommendations.push('Layout is fully compatible with the text content');
      return recommendations;
    }

    if (missingChars.length > 0 && missingChars.length <= 5) {
      recommendations.push(`Consider adding mappings for: ${missingChars.join(', ')}`);
    }

    if (unsupportedChars.length > 0) {
      recommendations.push('Text contains complex characters that may require specialized input methods');
    }

    if (missingChars.length > 10) {
      recommendations.push('Many characters are missing - consider using a different layout');
      recommendations.push(`Alternative layouts for ${layout.language} might be more suitable`);
    }

    // Layout-specific recommendations
    if (layout.layoutType === 'custom' && missingChars.length > 0) {
      recommendations.push('Custom layout can be modified to include missing characters');
    }

    if (layout.layoutType === 'qwerty' && layout.language !== 'en' && missingChars.length > 0) {
      recommendations.push('Consider using a native layout for this language');
    }

    return recommendations;
  }
}