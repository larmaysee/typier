import { LanguageCode } from "@/domain";
import { LayoutVariant } from "@/domain/enums/keyboard-layouts";

export interface KeyboardLayoutDto {
  id: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: string;
  variant: LayoutVariant;
  isCustom: boolean;
  metadata: {
    description: string;
    author: string;
    version: string;
    compatibility: string[];
    tags: string[];
    difficulty: number;
    popularity: number;
  };
  createdBy?: string;
}

export interface AvailableLayoutsDto {
  layouts: KeyboardLayoutDto[];
  preferredLayoutId: string | null;
  defaultLayoutId: string;
}

export interface SwitchLayoutDto {
  sessionId: string;
  layoutId: string;
  userId?: string;
}

export interface CustomLayoutDto {
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: string;
  baseLayoutId?: string;
  keyMappings: Array<{
    key: string;
    character: string;
    shiftCharacter?: string;
    altCharacter?: string;
  }>;
  metadata: {
    description: string;
    author: string;
  };
}

export interface LayoutCompatibilityDto {
  layoutId: string;
  textContent: string;
  isCompatible: boolean;
  compatibilityScore: number;
  missingCharacters: string[];
  recommendations?: string[];
}
