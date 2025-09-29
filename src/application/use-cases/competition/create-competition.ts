import { Competition } from "../../../domain/entities/competition";
import { CompetitionType } from "../../../domain/enums/competition-type";
import { LanguageCode } from "../../../domain/enums/language-code";
import { KeyboardLayoutVariant } from "../../../domain/enums/keyboard-layout-variant";
import { ICompetitionRepository } from "../../../domain/interfaces/competition-repository.interface";

export interface CreateCompetitionCommand {
  name: string;
  description: string;
  type: CompetitionType;
  language: LanguageCode;
  allowedLayouts: KeyboardLayoutVariant[];
  textContent: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
}

export class CreateCompetitionUseCase {
  constructor(
    private competitionRepository: ICompetitionRepository
  ) {}

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
      layout => !validLayouts.includes(layout)
    );

    if (invalidLayouts.length > 0) {
      throw new Error(`Invalid layouts for ${command.language}: ${invalidLayouts.join(", ")}`);
    }

    const competitionData = {
      ...command,
      isActive: true
    };

    return await this.competitionRepository.create(competitionData);
  }

  private getValidLayoutsForLanguage(language: LanguageCode): KeyboardLayoutVariant[] {
    const layoutMap = {
      [LanguageCode.EN]: [
        KeyboardLayoutVariant.QWERTY_US,
        KeyboardLayoutVariant.QWERTY_UK,
        KeyboardLayoutVariant.QWERTY_INTL,
        KeyboardLayoutVariant.DVORAK,
        KeyboardLayoutVariant.COLEMAK
      ],
      [LanguageCode.LI]: [
        KeyboardLayoutVariant.SIL_BASIC,
        KeyboardLayoutVariant.SIL_STANDARD,
        KeyboardLayoutVariant.UNICODE_STANDARD,
        KeyboardLayoutVariant.TRADITIONAL
      ],
      [LanguageCode.MY]: [
        KeyboardLayoutVariant.MYANMAR3,
        KeyboardLayoutVariant.ZAWGYI,
        KeyboardLayoutVariant.UNICODE_STANDARD_MY,
        KeyboardLayoutVariant.WININNWA
      ]
    };

    return layoutMap[language] || [];
  }
}