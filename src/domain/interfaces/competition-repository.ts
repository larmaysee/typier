import { Competition, CompetitionEntry } from "../entities/competition";


export interface ICompetitionRepository {
  findActive(): Promise<Competition[]>;
  findById(id: string): Promise<Competition | null>;
  save(competition: Competition): Promise<void>;
  getEntries(competitionId: string): Promise<CompetitionEntry[]>;
  submitEntry(entry: CompetitionEntry): Promise<void>;
  getLeaderboard(competitionId: string, limit?: number): Promise<CompetitionEntry[]>;
}