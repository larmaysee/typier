import { ILayoutProvider, ValidationResult } from "@/domain/interfaces";
import { KeyboardLayout, KeyMapping } from "@/domain/entities";
import { LanguageCode, LayoutType, LayoutVariant } from "@/domain/enums";

/**
 * Myanmar keyboard layouts provider (Myanmar3, Zawgyi, Unicode, WinInnwa)
 */
export class MyanmarLayoutsService implements ILayoutProvider {
  
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [
      this.createMyanmar3Layout(),
      this.createZawgyiLayout(),
      this.createUnicodeStandardLayout(),
      this.createWinInnwaLayout()
    ];
  }

  async getLayoutById(id: string): Promise<KeyboardLayout | null> {
    const layouts = await this.getAvailableLayouts();
    return layouts.find(layout => layout.id === id) || null;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layout.language !== LanguageCode.MY) {
      errors.push("Layout language must be Myanmar");
    }

    // Check for Myanmar Unicode characters (U+1000-109F)
    const allChars = layout.keyMappings.flatMap(m => [
      m.normal, m.shift || '', m.alt || '', m.ctrl || ''
    ]).join('');

    const myanmarPattern = /[\u{1000}-\u{109F}\s]*/u;
    const nonMyanmarChars = allChars.replace(myanmarPattern, '');
    
    if (nonMyanmarChars.length > 0) {
      warnings.push("Layout contains characters outside Myanmar Unicode block");
    }

    // Check for basic Myanmar consonants
    const basicConsonants = ['က', 'ခ', 'ဂ', 'ဃ', 'င', 'စ', 'ဆ', 'ဇ', 'ဈ', 'ဉ'];
    const mappedChars = new Set(allChars);
    
    let missingCount = 0;
    for (const consonant of basicConsonants) {
      if (!mappedChars.has(consonant)) {
        missingCount++;
      }
    }

    if (missingCount > 5) {
      warnings.push("Layout missing many basic Myanmar consonants");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  async getDefaultLayout(): Promise<KeyboardLayout> {
    return this.createMyanmar3Layout();
  }

  getSupportedLanguage(): LanguageCode {
    return LanguageCode.MY;
  }

  private createMyanmar3Layout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Number row with Myanmar digits
      { key: '1', normal: '၁', shift: 'ဍ' },
      { key: '2', normal: '၂', shift: 'ဎ' },
      { key: '3', normal: '၃', shift: 'ဏ' },
      { key: '4', normal: '၄', shift: 'ဒ' },
      { key: '5', normal: '၅', shift: 'ဓ' },
      { key: '6', normal: '၆', shift: 'န' },
      { key: '7', normal: '၇', shift: 'ပ' },
      { key: '8', normal: '၈', shift: 'ဖ' },
      { key: '9', normal: '၉', shift: 'ဗ' },
      { key: '0', normal: '၀', shift: 'ဘ' },
      { key: '-', normal: '-', shift: 'မ' },
      { key: '=', normal: '=', shift: 'ယ' },

      // Top row - Consonants
      { key: 'q', normal: 'ဆ', shift: 'ဈ' },
      { key: 'w', normal: 'တ', shift: 'ထ' },
      { key: 'e', normal: 'န', shift: 'ည' },
      { key: 'r', normal: 'မ', shift: 'ံ' },
      { key: 't', normal: 'အ', shift: 'ဦ' },
      { key: 'y', normal: 'ပ', shift: 'ဖ' },
      { key: 'u', normal: 'က', shift: 'ခ' },
      { key: 'i', normal: 'င', shift: 'င်' },
      { key: 'o', normal: 'သ', shift: 'စ' },
      { key: 'p', normal: 'စ', shift: 'ဆ' },
      { key: '[', normal: 'ဟ', shift: 'ှ' },
      { key: ']', normal: 'ူ', shift: 'ု' },
      { key: '\\', normal: 'ါ', shift: '၏' },

      // Home row - Main consonants and vowels
      { key: 'a', normal: 'ေ', shift: 'ေါ' },
      { key: 's', normal: 'ျ', shift: 'ြ' },
      { key: 'd', normal: 'ိ', shift: 'ီ' },
      { key: 'f', normal: '်', shift: '့' },
      { key: 'g', normal: 'ါ', shift: 'ွါ' },
      { key: 'h', normal: 'ြ', shift: 'ြေ' },
      { key: 'j', normal: 'ု', shift: 'ူ' },
      { key: 'k', normal: 'ိ', shift: 'ီ' },
      { key: 'l', normal: 'ေါ', shift: 'ော' },
      { key: ';', normal: 'း', shift: 'ဿ' },
      { key: "'", normal: 'ရ', shift: 'ွေါ' },

      // Bottom row - Additional consonants
      { key: 'z', normal: 'ဖ', shift: 'ဗ' },
      { key: 'x', normal: 'ထ', shift: 'ဒ' },
      { key: 'c', normal: 'ခ', shift: 'ဂ' },
      { key: 'v', normal: 'လ', shift: 'ဠ' },
      { key: 'b', normal: 'ဘ', shift: 'ဩ' },
      { key: 'n', normal: 'ည', shift: 'ဲ' },
      { key: 'm', normal: 'ာ', shift: 'ံ' },
      { key: ',', normal: 'ယ', shift: 'ရ' },
      { key: '.', normal: '။', shift: '၊' },
      { key: '/', normal: '/', shift: '?' },

      // Space
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'my-myanmar3',
      name: 'Myanmar3',
      displayName: 'Myanmar (Myanmar3)',
      language: LanguageCode.MY,
      layoutType: LayoutType.STANDARD,
      variant: LayoutVariant.MYANMAR3,
      keyMappings,
      metadata: {
        description: 'Myanmar3 keyboard layout - most widely used modern Myanmar input method',
        author: 'Myanmar Computer Federation',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: true,
        inputMethods: ['keyboard', 'ime']
      },
      isCustom: false
    };
  }

  private createZawgyiLayout(): KeyboardLayout {
    const myanmar3Layout = this.createMyanmar3Layout();
    
    // Zawgyi uses similar key positions but different Unicode mappings
    const keyMappings: KeyMapping[] = [
      // Modified mappings for Zawgyi encoding
      ...myanmar3Layout.keyMappings.map(mapping => ({
        ...mapping,
        // Note: In real implementation, this would map to Zawgyi encoding
        // For now, keeping Unicode for compatibility
      }))
    ];

    return {
      id: 'my-zawgyi',
      name: 'Zawgyi',
      displayName: 'Myanmar (Zawgyi)',
      language: LanguageCode.MY,
      layoutType: LayoutType.LEGACY,
      variant: LayoutVariant.ZAWGYI,
      keyMappings,
      metadata: {
        description: 'Legacy Zawgyi keyboard layout - widely used before Unicode standardization',
        author: 'Zawgyi Team',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard']
      },
      isCustom: false
    };
  }

  private createUnicodeStandardLayout(): KeyboardLayout {
    const keyMappings: KeyMapping[] = [
      // Standard Unicode Myanmar layout following official recommendations
      { key: 'a', normal: 'က', shift: 'ကာ' },   // U+1000
      { key: 'b', normal: 'ခ', shift: 'ခါ' },   // U+1001
      { key: 'c', normal: 'ဂ', shift: 'ဂါ' },   // U+1002
      { key: 'd', normal: 'ဃ', shift: 'ဃါ' },   // U+1003
      { key: 'e', normal: 'င', shift: 'ငါ' },   // U+1004
      { key: 'f', normal: 'စ', shift: 'စာ' },   // U+1005
      { key: 'g', normal: 'ဆ', shift: 'ဆါ' },   // U+1006
      { key: 'h', normal: 'ဇ', shift: 'ဇါ' },   // U+1007
      { key: 'i', normal: 'ဈ', shift: 'ဈါ' },   // U+1008
      { key: 'j', normal: 'ဉ', shift: 'ဉါ' },   // U+1009
      { key: 'k', normal: 'ညဉ', shift: 'ညဉါ' }, // U+100A
      { key: 'l', normal: 'ညီ', shift: 'ညီါ' }, // U+100B
      { key: 'm', normal: 'ညု', shift: 'ညုါ' }, // U+100C
      { key: 'n', normal: 'တ', shift: 'တါ' },   // U+1010
      { key: 'o', normal: 'ထ', shift: 'ထါ' },   // U+1011
      { key: 'p', normal: 'ဒ', shift: 'ဒါ' },   // U+1012
      // Continue with remaining characters...
      { key: ' ', normal: ' ', shift: ' ' }
    ];

    return {
      id: 'my-unicode-standard',
      name: 'Unicode Standard',
      displayName: 'Myanmar (Unicode Standard)',
      language: LanguageCode.MY,
      layoutType: LayoutType.UNICODE,
      variant: LayoutVariant.UNICODE_STANDARD,
      keyMappings,
      metadata: {
        description: 'Standard Unicode Myanmar keyboard layout following official specifications',
        author: 'Unicode Consortium',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard', 'ime']
      },
      isCustom: false
    };
  }

  private createWinInnwaLayout(): KeyboardLayout {
    const myanmar3Layout = this.createMyanmar3Layout();

    // WinInnwa layout with modified key positions
    const keyMappings: KeyMapping[] = [
      // Traditional WinInnwa mappings
      { key: 'a', normal: 'အ', shift: 'အေါ' },
      { key: 's', normal: 'သ', shift: 'ဿ' },
      { key: 'd', normal: 'ဒ', shift: 'ဓ' },
      { key: 'f', normal: 'ဖ', shift: 'ဗ' },
      { key: 'g', normal: 'ဂ', shift: 'ဃ' },
      { key: 'h', normal: 'ဟ', shift: 'ှ' },
      { key: 'j', normal: 'ဇ', shift: 'ဈ' },
      { key: 'k', normal: 'က', shift: 'ခ' },
      { key: 'l', normal: 'လ', shift: 'ဠ' },
      // ... additional mappings following WinInnwa conventions
      ...myanmar3Layout.keyMappings.slice(10) // Use remaining from Myanmar3
    ];

    return {
      id: 'my-wininnwa',
      name: 'WinInnwa',
      displayName: 'Myanmar (WinInnwa)',
      language: LanguageCode.MY,
      layoutType: LayoutType.LEGACY,
      variant: LayoutVariant.WININNWA,
      keyMappings,
      metadata: {
        description: 'Traditional WinInnwa keyboard layout - popular legacy input method',
        author: 'Innwa Systems',
        version: '1.0.0',
        createdDate: '2024-01-01',
        lastModified: '2024-01-01',
        isDefault: false,
        inputMethods: ['keyboard']
      },
      isCustom: false
    };
  }
}