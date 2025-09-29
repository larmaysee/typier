import { Competition } from "../../../domain/entities/competition";
import { ICompetitionRepository } from "../../../domain/interfaces/competition-repository.interface";

export interface JoinCompetitionCommand {
  competitionId: string;
  userId: string;
}

export interface JoinCompetitionResult {
  competition: Competition;
  canJoin: boolean;
  reason?: string;
}

export class JoinCompetitionUseCase {
  constructor(
    private competitionRepository: ICompetitionRepository
  ) {}

  async execute(command: JoinCompetitionCommand): Promise<JoinCompetitionResult> {
    const competition = await this.competitionRepository.findById(command.competitionId);

    if (!competition) {
      return {
        competition: null as any,
        canJoin: false,
        reason: "Competition not found"
      };
    }

    // Check if competition is active
    if (!competition.isActive) {
      return {
        competition,
        canJoin: false,
        reason: "Competition is not active"
      };
    }

    // Check if competition has started
    const now = new Date();
    if (now < competition.startDate) {
      return {
        competition,
        canJoin: false,
        reason: "Competition has not started yet"
      };
    }

    // Check if competition has ended
    if (now > competition.endDate) {
      return {
        competition,
        canJoin: false,
        reason: "Competition has ended"
      };
    }

    // Check if user has already joined
    const existingEntry = await this.competitionRepository.getUserEntry(
      command.competitionId,
      command.userId
    );

    if (existingEntry) {
      return {
        competition,
        canJoin: false,
        reason: "User has already joined this competition"
      };
    }

    // Check participant limit
    if (competition.maxParticipants) {
      const entries = await this.competitionRepository.getEntries(command.competitionId);
      if (entries.length >= competition.maxParticipants) {
        return {
          competition,
          canJoin: false,
          reason: "Competition has reached maximum participants"
        };
      }
    }

    return {
      competition,
      canJoin: true
    };
  }
}