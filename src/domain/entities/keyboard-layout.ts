import { LanguageCode } from "@/enums/site-config";

export enum LayoutType {
  QWERTY = "qwerty",
  DVORAK = "dvorak",
  COLEMAK = "colemak",
  SIL_BASIC = "sil_basic",
  SIL_STANDARD = "sil_standard",
  UNICODE_STANDARD = "unicode_standard",
  TRADITIONAL = "traditional",
  MYANMAR3 = "myanmar3",
  ZAWGYI = "zawgyi",
  WININNWA = "wininnwa"
}

export enum LayoutVariant {
  US = "us",
  UK = "uk",
  INTERNATIONAL = "international",
  BASIC = "basic",
  STANDARD = "standard",
  EXTENDED = "extended"
}

export interface KeyMapping {
  key: string;
  outputChar: string;
  modifiers?: string[];
  context?: string;
}

export interface LayoutMetadata {
  popularity: number;
  version: string;
  author?: string;
  description?: string;
  isRightToLeft: boolean;
  requiresComposition: boolean;
  supportsDeadKeys: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutCapabilities {
  directInput: boolean;
  composeSupport: boolean;
  transliteration: boolean;
  phoneticInput: boolean;
  contextualShaping: boolean;
  ligatureSupport: boolean;
  toneMarkInput: boolean;
  vowelOrdering: boolean;
  visualFeedback: boolean;
  audioFeedback: boolean;
  hapticFeedback: boolean;
  customizable: boolean;
  exportable: boolean;
  versionControl: boolean;
}