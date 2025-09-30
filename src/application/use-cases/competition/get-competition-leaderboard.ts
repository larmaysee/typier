import { CompetitionEntry } from "@/domain/entities/competition-entry";
import { Competition } from "@/domain/entities/competition";
import { ICompetitionRepository } from "@/domain/interfaces/competition-repository.interface";

export interface GetCompetitionLeaderboardQuery {
  competitionId: string;
  limit?: number;
  userId?: string; // Optional: to get user's position
}

export interface CompetitionLeaderboardResult {
  competition: Competition;
  entries: CompetitionEntry[];
  totalParticipants: number;
  userEntry?: {
    entry: CompetitionEntry;
    rank: number;
  };
  statistics: {
    averageWpm: number;
    averageAccuracy: number;
    topWpm: number;
    topAccuracy: number;
  };
}

export class GetCompetitionLeaderboardUseCase {
  constructor(
    private competitionRepository: ICompetitionRepository
  ) { }

  async execute(query: GetCompetitionLeaderboardQuery): Promise<CompetitionLeaderboardResult> {
    const competition = await this.competitionRepository.findById(query.competitionId);

    if (!competition) {
      throw new Error("Competition not found");
    }

    // Get leaderboard entries
    const entries = await this.competitionRepository.getLeaderboard(
      query.competitionId,
      query.limit
    );

    // Get all entries for statistics and user lookup
    const allEntries = await this.competitionRepository.getEntries(query.competitionId);

    // Calculate statistics
    const statistics = this.calculateStatistics(allEntries);

    // Find user entry if requested
    let userEntry: CompetitionLeaderboardResult['userEntry'];
    if (query.userId) {
      const userEntryData = await this.competitionRepository.getUserEntry(
        query.competitionId,
        query.userId
      );

      if (userEntryData) {
        const userRank = allEntries
          .sort((a, b) => this.compareEntries(a, b))
          .findIndex(e => e.id === userEntryData.id) + 1;

        userEntry = {
          entry: userEntryData,
          rank: userRank
        };
      }
    }

    return {
      competition,
      entries: entries.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })),
      totalParticipants: allEntries.length,
      userEntry,
      statistics
    };
  }

  private calculateStatistics(entries: CompetitionEntry[]) {
    if (entries.length === 0) {
      return {
        averageWpm: 0,
        averageAccuracy: 0,
        topWpm: 0,
        topAccuracy: 0
      };
    }

    const totalWpm = entries.reduce((sum, entry) => sum + entry.wpm, 0);
    const totalAccuracy = entries.reduce((sum, entry) => sum + entry.accuracy, 0);

    return {
      averageWpm: totalWpm / entries.length,
      averageAccuracy: totalAccuracy / entries.length,
      topWpm: Math.max(...entries.map(e => e.wpm)),
      topAccuracy: Math.max(...entries.map(e => e.accuracy))
    };
  }

  private compareEntries(a: CompetitionEntry, b: CompetitionEntry): number {
    // Primary sort: WPM (descending)
    if (b.wpm !== a.wpm) {
      return b.wpm - a.wpm;
    }

    // Secondary sort: Accuracy (descending)
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }

    // Tertiary sort: Completion time (ascending - faster is better)
    return a.completionTime - b.completionTime;
  }
}