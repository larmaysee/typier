import { Competition } from "../entities/competition";
import { CompetitionEntry } from "../entities/competition-entry";
import { CompetitionType } from "../enums/competition-type";
import { LanguageCode } from "../enums/language-code";

export interface ICompetitionRepository {
  create(competition: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Competition>;
  findById(id: string): Promise<Competition | null>;
  findActiveByType(type: CompetitionType): Promise<Competition[]>;
  findByLanguage(language: LanguageCode): Promise<Competition[]>;
  update(id: string, data: Partial<Competition>): Promise<Competition>;
  delete(id: string): Promise<void>;
  
  // Competition entries
  addEntry(entry: Omit<CompetitionEntry, 'id' | 'submittedAt' | 'rank'>): Promise<CompetitionEntry>;
  getEntries(competitionId: string): Promise<CompetitionEntry[]>;
  getLeaderboard(competitionId: string, limit?: number): Promise<CompetitionEntry[]>;
  getUserEntry(competitionId: string, userId: string): Promise<CompetitionEntry | null>;
}