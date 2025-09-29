import { LanguageCode } from "@/enums/site-config";
import { DifficultyLevel, LayoutType, LayoutVariant, FingerAssignment } from "../enums";

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

export interface KeyMapping {
  key: string;           // Physical key (e.g., 'q', 'w', 'e')
  character: string;     // Output character
  shiftCharacter?: string;  // Character with Shift
  altCharacter?: string;    // Character with Alt/Option
  ctrlCharacter?: string;   // Character with Ctrl
  position: KeyPosition;
}

export interface KeyPosition {
  row: number;
  column: number;
  finger: FingerAssignment;
  hand: 'left' | 'right';
}

export interface LayoutMetadata {
  description: string;
  author: string;
  version: string;
  compatibility: string[];  // Compatible systems
  tags: string[];
  difficulty: DifficultyLevel;
  popularity: number;
}