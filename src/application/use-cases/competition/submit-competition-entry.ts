import { CompetitionEntry } from "@/domain/entities/competition-entry";
import { ICompetitionRepository } from "@/domain/interfaces/competition-repository.interface";

export interface SubmitCompetitionEntryCommand {
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

export interface SubmitCompetitionEntryResult {
  entry: CompetitionEntry;
  rank: number;
  improvement?: {
    previousRank?: number;
    rankChange: number;
  };
}

export class SubmitCompetitionEntryUseCase {
  constructor(private competitionRepository: ICompetitionRepository) { }

  async execute(
    command: SubmitCompetitionEntryCommand
  ): Promise<SubmitCompetitionEntryResult> {
    // Validate competition exists and is active
    const competition = await this.competitionRepository.findById(
      command.competitionId
    );

    if (!competition) {
      throw new Error("Competition not found");
    }

    if (!competition.isActive) {
      throw new Error("Competition is not active");
    }

    // Check if competition is still running
    const now = Date.now();
    if (now < competition.startDate || now > competition.endDate) {
      throw new Error("Competition is not currently running");
    }

    // Validate layout is allowed in competition (if required layout is specified)
    if (
      competition.requiredLayout &&
      command.layoutUsed !== competition.requiredLayout
    ) {
      throw new Error(
        `Competition requires ${competition.requiredLayout} layout, but ${command.layoutUsed} was used`
      );
    }

    // Validate typing metrics
    if (command.wpm < 0 || command.accuracy < 0 || command.accuracy > 100) {
      throw new Error("Invalid typing metrics");
    }

    if (command.completionTime > competition.metadata.rules.timeLimit) {
      throw new Error("Completion time exceeds competition time limit");
    }

    // Check for existing entry (for updates)
    const existingEntry = await this.competitionRepository.getUserEntry(
      command.competitionId,
      command.userId
    );

    let previousRank: number | undefined;
    if (existingEntry) {
      previousRank = existingEntry.rank;
    }

    // Create or update entry
    const entryData = {
      competitionId: command.competitionId,
      userId: command.userId,
      wpm: command.wpm,
      accuracy: command.accuracy,
      correctWords: command.correctWords,
      incorrectWords: command.incorrectWords,
      totalWords: command.totalWords,
      mistakes: command.mistakes,
      completionTime: command.completionTime,
      layoutUsed: command.layoutUsed,
    };

    const entry = await this.competitionRepository.addEntry(entryData);

    // Calculate new ranking
    const leaderboard = await this.competitionRepository.getLeaderboard(
      command.competitionId
    );
    const currentRank = leaderboard.findIndex((e) => e.id === entry.id) + 1;

    return {
      entry: { ...entry, rank: currentRank },
      rank: currentRank,
      improvement: previousRank
        ? {
          previousRank,
          rankChange: previousRank - currentRank,
        }
        : undefined,
    };
  }
}
