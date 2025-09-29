import { LanguageCode } from "@/enums/site-config";

export enum LayoutType {
  QWERTY = 'qwerty',
  DVORAK = 'dvorak',
  COLEMAK = 'colemak',
  AZERTY = 'azerty',
  CUSTOM = 'custom',
  PHONETIC = 'phonetic',
  TRANSLITERATION = 'transliteration'
}

export enum LayoutVariant {
  // English variants
  US = 'us',
  UK = 'uk',
  INTERNATIONAL = 'international',
  
  // Lisu variants
  SIL_BASIC = 'sil_basic',
  SIL_STANDARD = 'sil_standard',
  UNICODE_STANDARD = 'unicode_standard',
  TRADITIONAL = 'traditional',
  LISU_BASIC = 'lisu_basic',
  
  // Myanmar variants
  MYANMAR_3 = 'myanmar3',
  ZAWGYI = 'zawgyi',
  UNICODE = 'unicode',
  WININNWA = 'wininnwa',
  
  // Generic
  STANDARD = 'standard',
  BASIC = 'basic',
  EXTENDED = 'extended'
}

export enum InputMethod {
  DIRECT = 'direct',
  COMPOSE = 'compose',
  TRANSLITERATION = 'transliteration',
  PHONETIC = 'phonetic'
}

export type KeyboardLayoutId = string;
export type FingerAssignment = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';