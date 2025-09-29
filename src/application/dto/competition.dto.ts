import { CompetitionType } from "../../domain/enums/competition-type";
import { LanguageCode } from "../../domain/enums/language-code";
import { KeyboardLayoutVariant } from "../../domain/enums/keyboard-layout-variant";

export interface CreateCompetitionDTO {
  name: string;
  description: string;
  type: CompetitionType;
  language: LanguageCode;
  allowedLayouts: KeyboardLayoutVariant[];
  textContent: string;
  duration: number;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
}

export interface CompetitionEntryDTO {
  competitionId: string;
  userId: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  mistakes: number;
  completionTime: number;
  layoutUsed: string;
}

export interface CompetitionLeaderboardDTO {
  competitionId: string;
  entries: CompetitionLeaderboardEntryDTO[];
  totalParticipants: number;
  userRank?: number;
}

export interface CompetitionLeaderboardEntryDTO {
  rank: number;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  submittedAt: string;
  layoutUsed: string;
}