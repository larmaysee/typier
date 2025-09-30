import {
  CompetitionCategory,
  CompetitionType,
  DifficultyLevel,
  LanguageCode,
  LayoutVariant,
} from "@/domain/enums";
import {
  Competition,
  CompetitionMetadata,
} from "@/domain/entities/competition";
import { ICompetitionRepository } from "@/domain/interfaces/competition-repository.interface";

export interface CreateCompetitionCommand {
  name: string;
  description: string;
  type: CompetitionType;
  language: LanguageCode;
  allowedLayouts: LayoutVariant[];
  textContent: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
}

export class CreateCompetitionUseCase {
  constructor(private competitionRepository: ICompetitionRepository) { }

  async execute(command: CreateCompetitionCommand): Promise<Competition> {
    // Validate competition dates
    if (command.startDate >= command.endDate) {
      throw new Error("Start date must be before end date");
    }

    if (command.startDate <= new Date()) {
      throw new Error("Start date must be in the future");
    }

    // Validate duration
    if (command.duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }

    // Validate allowed layouts for language
    const validLayouts = this.getValidLayoutsForLanguage(command.language);
    const invalidLayouts = command.allowedLayouts.filter(
      (layout) => !validLayouts.includes(layout)
    );

    if (invalidLayouts.length > 0) {
      throw new Error(
        `Invalid layouts for ${command.language}: ${invalidLayouts.join(", ")}`
      );
    }

    // Generate competition ID
    const competitionId = Competition.generateId();

    // Calculate timestamps
    const startTimestamp = command.startDate.getTime();
    const endTimestamp = command.endDate.getTime();
    const registrationDeadline = startTimestamp - 24 * 60 * 60 * 1000; // 24 hours before start

    // Create metadata
    const metadata: CompetitionMetadata = {
      description: command.description,
      rules: {
        timeLimit: command.duration,
        attemptsAllowed: 3,
        layoutLocked: command.type === CompetitionType.TOURNAMENT,
        retakeAllowed: false,
        minAccuracy: 85,
        minWPM: 20,
        penaltyPerError: 5,
      },
      prizeTiers: [],
      tags: [],
      difficulty: DifficultyLevel.MEDIUM,
      estimatedDuration: Math.ceil(command.duration / 60),
      maxParticipants: command.maxParticipants,
    };

    // Create competition data for the entity
    const competitionData = {
      id: competitionId,
      name: command.name,
      type: command.type,
      category: CompetitionCategory.SPEED,
      startDate: startTimestamp,
      endDate: endTimestamp,
      registrationDeadline,
      language: command.language,
      textContent: command.textContent,
      metadata,
      createdBy: "system",
    };

    // Create the competition entity
    const competition = Competition.create(competitionData);

    // Save through repository
    return await this.competitionRepository.create(competition);
  }

  private getValidLayoutsForLanguage(language: LanguageCode): LayoutVariant[] {
    const layoutMap = {
      [LanguageCode.EN]: [
        LayoutVariant.US,
        LayoutVariant.UK,
        LayoutVariant.INTERNATIONAL,
      ],
      [LanguageCode.LI]: [
        LayoutVariant.SIL_BASIC,
        LayoutVariant.SIL_STANDARD,
        LayoutVariant.UNICODE_STANDARD,
        LayoutVariant.TRADITIONAL,
      ],
      [LanguageCode.MY]: [
        LayoutVariant.MYANMAR3,
        LayoutVariant.ZAWGYI,
        LayoutVariant.UNICODE_MYANMAR,
        LayoutVariant.WININNWA,
      ],
    };

    return layoutMap[language] || [];
  }
}
