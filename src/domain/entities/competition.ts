import { CompetitionType } from "../enums/competition-type";
import { LanguageCode } from "../enums/language-code";
import { KeyboardLayoutVariant } from "../enums/keyboard-layout-variant";

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: CompetitionType;
  language: LanguageCode;
  allowedLayouts: KeyboardLayoutVariant[];
  textContent: string;
  duration: number; // in seconds
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}