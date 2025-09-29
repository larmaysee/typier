import { LanguageCode } from "../enums/language-code";
import { KeyboardLayoutVariant } from "../enums/keyboard-layout-variant";

export interface KeyboardLayout {
  id: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  variant: KeyboardLayoutVariant;
  keyMappings: KeyMapping[];
  isCustom: boolean;
  createdBy?: string;
  isPublic?: boolean;
  metadata: LayoutMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyMapping {
  key: string;
  shiftKey?: string;
  altKey?: string;
  altGrKey?: string;
  position: KeyPosition;
}

export interface KeyPosition {
  row: number;
  column: number;
  finger: FingerAssignment;
}

export enum FingerAssignment {
  LEFT_PINKY = "left-pinky",
  LEFT_RING = "left-ring", 
  LEFT_MIDDLE = "left-middle",
  LEFT_INDEX = "left-index",
  LEFT_THUMB = "left-thumb",
  RIGHT_THUMB = "right-thumb",
  RIGHT_INDEX = "right-index",
  RIGHT_MIDDLE = "right-middle",
  RIGHT_RING = "right-ring",
  RIGHT_PINKY = "right-pinky"
}

export interface LayoutMetadata {
  description?: string;
  author?: string;
  version: string;
  optimizedFor?: string[];
  tags?: string[];
}