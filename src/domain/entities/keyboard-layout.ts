import { LanguageCode } from '@/enums/site-config';

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
  
  // Myanmar variants
  MYANMAR3 = 'myanmar3',
  ZAWGYI = 'zawgyi',
  UNICODE = 'unicode',
  WININNWA = 'wininnwa',
  
  // Generic
  STANDARD = 'standard',
  BASIC = 'basic',
  EXTENDED = 'extended'
}

export type FingerAssignment = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

export interface KeyPosition {
  row: number;
  column: number;
  finger: FingerAssignment;
  hand: 'left' | 'right';
}

export interface KeyMapping {
  key: string;
  character: string;
  shiftCharacter?: string;
  altCharacter?: string;
  ctrlCharacter?: string;
  position: KeyPosition;
}

export interface LayoutMetadata {
  description: string;
  author: string;
  version: string;
  compatibility: string[];
  tags: string[];
  difficulty: number;
  popularity: number;
}

export interface KeyboardLayout {
  id: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: LayoutType;
  variant: LayoutVariant;
  keyMappings: KeyMapping[];
  metadata: LayoutMetadata;
  isCustom: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}