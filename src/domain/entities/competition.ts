/**
 * Domain entities for competition management
 * Contains competition logic, entry management, and ranking systems
 */

import { LanguageCode } from "../../enums/site-config";
import {
  CompetitionCategory,
  CompetitionStatus,
  CompetitionType,
} from "../enums/competition-types";
import { DifficultyLevel } from "../enums/typing-mode";

export interface CompetitionRules {
  readonly timeLimit: number; // in seconds
  readonly attemptsAllowed: number; // max attempts per participant
  readonly layoutLocked: boolean; // whether participants can change layouts
  readonly retakeAllowed: boolean; // whether retakes are permitted
  readonly minAccuracy?: number; // minimum accuracy to qualify
  readonly minWPM?: number; // minimum WPM to qualify
  readonly penaltyPerError: number; // WPM penalty per error
}

export interface PrizeTier {
  readonly position: number;
  readonly description: string;
  readonly value?: string;
  readonly badgeId?: string;
}

export interface CompetitionMetadata {
  readonly description: string;
  readonly rules: CompetitionRules;
  readonly prizeTiers: PrizeTier[];
  readonly tags: string[];
  readonly difficulty: DifficultyLevel;
  readonly estimatedDuration: number; // in minutes
  readonly maxParticipants?: number;
  readonly entryFee?: number;
  readonly sponsoredBy?: string;
}

export class Competition {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: CompetitionType,
    public readonly category: CompetitionCategory,
    public readonly status: CompetitionStatus,
    public readonly startDate: number,
    public readonly endDate: number,
    public readonly registrationDeadline: number,
    public readonly language: LanguageCode,
    public readonly textContent: string,
    public readonly metadata: CompetitionMetadata,
    public readonly participantCount: number,
    public readonly createdBy: string,
    public readonly createdAt: number,
    public readonly updatedAt: number,
    public readonly requiredLayout?: string
  ) {
    if (!id.trim()) throw new Error("Competition ID cannot be empty");
    if (!name.trim()) throw new Error("Competition name cannot be empty");
    if (!textContent.trim()) throw new Error("Text content cannot be empty");
    if (!createdBy.trim()) throw new Error("Creator ID cannot be empty");
    if (startDate <= 0) throw new Error("Start date must be positive");
    if (endDate <= startDate)
      throw new Error("End date must be after start date");
    if (registrationDeadline <= 0)
      throw new Error("Registration deadline must be positive");
    if (registrationDeadline > startDate)
      throw new Error("Registration deadline must be before start date");
    if (participantCount < 0)
      throw new Error("Participant count cannot be negative");
    if (createdAt <= 0) throw new Error("Created timestamp must be positive");
    if (updatedAt < createdAt)
      throw new Error("Updated timestamp cannot be before created timestamp");
  }

  static create(data: {
    id: string;
    name: string;
    type: CompetitionType;
    category: CompetitionCategory;
    startDate: number;
    endDate: number;
    registrationDeadline: number;
    language: LanguageCode;
    textContent: string;
    requiredLayout?: string;
    metadata: CompetitionMetadata;
    createdBy: string;
    status?: CompetitionStatus;
    participantCount?: number;
    createdAt?: number;
    updatedAt?: number;
  }): Competition {
    const now = Date.now();

    return new Competition(
      data.id,
      data.name,
      data.type,
      data.category,
      data.status || CompetitionStatus.UPCOMING,
      data.startDate,
      data.endDate,
      data.registrationDeadline,
      data.language,
      data.textContent,
      { ...data.metadata },
      data.participantCount || 0,
      data.createdBy,
      data.createdAt || now,
      data.updatedAt || now,
      data.requiredLayout
    );
  }

  static generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  start(): Competition {
    if (this.status !== CompetitionStatus.UPCOMING) {
      throw new Error("Competition can only be started from upcoming state");
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      CompetitionStatus.ACTIVE,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      this.textContent,
      this.metadata,
      this.participantCount,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  complete(): Competition {
    if (this.status !== CompetitionStatus.ACTIVE) {
      throw new Error("Competition can only be completed from active state");
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      CompetitionStatus.COMPLETED,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      this.textContent,
      this.metadata,
      this.participantCount,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  cancel(): Competition {
    if (
      this.status === CompetitionStatus.COMPLETED ||
      this.status === CompetitionStatus.CANCELLED
    ) {
      throw new Error(
        "Cannot cancel completed or already cancelled competition"
      );
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      CompetitionStatus.CANCELLED,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      this.textContent,
      this.metadata,
      this.participantCount,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  addParticipant(): Competition {
    if (!this.canAcceptParticipants()) {
      throw new Error("Competition cannot accept new participants");
    }

    if (
      this.metadata.maxParticipants &&
      this.participantCount >= this.metadata.maxParticipants
    ) {
      throw new Error("Competition has reached maximum participants");
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      this.status,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      this.textContent,
      this.metadata,
      this.participantCount + 1,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  removeParticipant(): Competition {
    if (this.participantCount === 0) {
      throw new Error("No participants to remove");
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      this.status,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      this.textContent,
      this.metadata,
      this.participantCount - 1,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  updateTextContent(newTextContent: string): Competition {
    if (!newTextContent.trim()) {
      throw new Error("Text content cannot be empty");
    }

    if (
      this.status === CompetitionStatus.ACTIVE ||
      this.status === CompetitionStatus.COMPLETED
    ) {
      throw new Error(
        "Cannot update text content of active or completed competition"
      );
    }

    return new Competition(
      this.id,
      this.name,
      this.type,
      this.category,
      this.status,
      this.startDate,
      this.endDate,
      this.registrationDeadline,
      this.language,
      newTextContent,
      this.metadata,
      this.participantCount,
      this.createdBy,
      this.createdAt,
      Date.now(),
      this.requiredLayout
    );
  }

  getDuration(): number {
    return this.endDate - this.startDate;
  }

  getRegistrationTimeLeft(): number {
    const now = Date.now();
    if (now > this.registrationDeadline) return 0;
    return this.registrationDeadline - now;
  }

  getTimeLeft(): number {
    const now = Date.now();
    if (now > this.endDate) return 0;
    return this.endDate - now;
  }

  isRegistrationOpen(): boolean {
    const now = Date.now();
    return (
      this.status === CompetitionStatus.UPCOMING &&
      now <= this.registrationDeadline &&
      (!this.metadata.maxParticipants ||
        this.participantCount < this.metadata.maxParticipants)
    );
  }

  canAcceptParticipants(): boolean {
    return this.isRegistrationOpen();
  }

  isActive(): boolean {
    const now = Date.now();
    return (
      this.status === CompetitionStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  isCompleted(): boolean {
    return this.status === CompetitionStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === CompetitionStatus.CANCELLED;
  }

  hasStarted(): boolean {
    return Date.now() >= this.startDate;
  }

  hasEnded(): boolean {
    return Date.now() > this.endDate;
  }

  requiresSpecificLayout(): boolean {
    return !!this.requiredLayout;
  }

  allowsRetakes(): boolean {
    return this.metadata.rules.retakeAllowed;
  }

  getPrizeTier(position: number): PrizeTier | undefined {
    return this.metadata.prizeTiers.find((tier) => tier.position === position);
  }

  getMaxPrizePosition(): number {
    if (this.metadata.prizeTiers.length === 0) return 0;
    return Math.max(...this.metadata.prizeTiers.map((tier) => tier.position));
  }

  isEligibleForPrize(position: number): boolean {
    return !!this.getPrizeTier(position);
  }

  getParticipationRate(): number {
    if (!this.metadata.maxParticipants) return 0;
    return (this.participantCount / this.metadata.maxParticipants) * 100;
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.name.trim().length > 0 &&
      this.textContent.trim().length > 0 &&
      this.createdBy.trim().length > 0 &&
      this.startDate > 0 &&
      this.endDate > this.startDate &&
      this.registrationDeadline > 0 &&
      this.registrationDeadline <= this.startDate &&
      this.participantCount >= 0 &&
      this.createdAt > 0 &&
      this.updatedAt >= this.createdAt &&
      this.metadata.rules.timeLimit > 0 &&
      this.metadata.rules.attemptsAllowed > 0
    );
  }

  equals(other: Competition): boolean {
    return this.id === other.id;
  }
}

export class CompetitionEntry {
  private constructor(
    public readonly id: string,
    public readonly competitionId: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly wpm: number,
    public readonly accuracy: number,
    public readonly errors: number,
    public readonly timeElapsed: number,
    public readonly layoutUsed: string,
    public readonly attemptNumber: number,
    public readonly score: number,
    public readonly isQualified: boolean,
    public readonly submittedAt: number,
    public readonly metadata: {
      readonly consistency: number;
      readonly fingerUtilization: Record<string, number>;
      readonly mistakePattern: string[];
      readonly deviceInfo?: string;
    },
    public readonly rank?: number
  ) {
    if (!id.trim()) throw new Error("Entry ID cannot be empty");
    if (!competitionId.trim())
      throw new Error("Competition ID cannot be empty");
    if (!userId.trim()) throw new Error("User ID cannot be empty");
    if (!username.trim()) throw new Error("Username cannot be empty");
    if (wpm < 0) throw new Error("WPM cannot be negative");
    if (accuracy < 0 || accuracy > 100)
      throw new Error("Accuracy must be between 0-100");
    if (errors < 0) throw new Error("Errors cannot be negative");
    if (timeElapsed <= 0) throw new Error("Time elapsed must be positive");
    if (!layoutUsed.trim()) throw new Error("Layout used cannot be empty");
    if (attemptNumber < 1) throw new Error("Attempt number must be positive");
    if (score < 0) throw new Error("Score cannot be negative");
    if (submittedAt <= 0)
      throw new Error("Submitted timestamp must be positive");
  }

  static create(data: {
    id: string;
    competitionId: string;
    userId: string;
    username: string;
    wpm: number;
    accuracy: number;
    errors: number;
    timeElapsed: number;
    layoutUsed: string;
    attemptNumber: number;
    rank?: number;
    submittedAt?: number;
    consistency?: number;
    fingerUtilization?: Record<string, number>;
    mistakePattern?: string[];
    deviceInfo?: string;
    qualificationRules?: {
      minAccuracy?: number;
      minWPM?: number;
      penaltyPerError?: number;
    };
  }): CompetitionEntry {
    const score = CompetitionEntry.calculateScore(
      data.wpm,
      data.accuracy,
      data.errors,
      data.qualificationRules?.penaltyPerError || 0
    );

    const isQualified = CompetitionEntry.checkQualification(
      data.wpm,
      data.accuracy,
      data.qualificationRules
    );

    return new CompetitionEntry(
      data.id,
      data.competitionId,
      data.userId,
      data.username,
      data.wpm,
      data.accuracy,
      data.errors,
      data.timeElapsed,
      data.layoutUsed,
      data.attemptNumber,
      score,
      isQualified,
      data.submittedAt || Date.now(),
      {
        consistency: data.consistency || 0,
        fingerUtilization: data.fingerUtilization || {},
        mistakePattern: data.mistakePattern || [],
        deviceInfo: data.deviceInfo,
      },
      data.rank
    );
  }

  static generateId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static calculateScore(
    wpm: number,
    accuracy: number,
    errors: number,
    penaltyPerError: number = 0
  ): number {
    // Base score from WPM weighted by accuracy
    const accuracyMultiplier = accuracy / 100;
    const baseScore = wpm * accuracyMultiplier;

    // Apply error penalty
    const errorPenalty = errors * penaltyPerError;

    const finalScore = Math.max(0, baseScore - errorPenalty);
    return Math.round(finalScore * 100) / 100;
  }

  static checkQualification(
    wpm: number,
    accuracy: number,
    rules?: { minAccuracy?: number; minWPM?: number }
  ): boolean {
    if (!rules) return true;

    if (rules.minAccuracy && accuracy < rules.minAccuracy) return false;
    if (rules.minWPM && wpm < rules.minWPM) return false;

    return true;
  }

  updateRank(newRank: number): CompetitionEntry {
    if (newRank < 1) throw new Error("Rank must be positive");

    return new CompetitionEntry(
      this.id,
      this.competitionId,
      this.userId,
      this.username,
      this.wpm,
      this.accuracy,
      this.errors,
      this.timeElapsed,
      this.layoutUsed,
      this.attemptNumber,
      this.score,
      this.isQualified,
      this.submittedAt,
      this.metadata,
      newRank
    );
  }

  getErrorRate(): number {
    if (this.timeElapsed === 0) return 0;
    // Estimate characters typed from WPM and time
    const charactersTyped = (this.wpm / 60) * 5 * (this.timeElapsed / 1000); // 5 chars per word, time in seconds
    if (charactersTyped === 0) return 0;
    return (this.errors / charactersTyped) * 100;
  }

  getEffectiveWPM(): number {
    // WPM after accounting for errors
    const errorRate = this.getErrorRate() / 100;
    return this.wpm * (1 - errorRate);
  }

  getPerformanceLevel():
    | "poor"
    | "fair"
    | "good"
    | "excellent"
    | "outstanding" {
    if (this.score < 20) return "poor";
    if (this.score < 40) return "fair";
    if (this.score < 60) return "good";
    if (this.score < 80) return "excellent";
    return "outstanding";
  }

  getRankCategory():
    | "winner"
    | "top_10"
    | "top_50"
    | "qualified"
    | "participated" {
    if (!this.rank) return this.isQualified ? "qualified" : "participated";

    if (this.rank === 1) return "winner";
    if (this.rank <= 10) return "top_10";
    if (this.rank <= 50) return "top_50";
    return this.isQualified ? "qualified" : "participated";
  }

  getTypingConsistency():
    | "very_low"
    | "low"
    | "moderate"
    | "high"
    | "very_high" {
    const consistency = this.metadata.consistency;
    if (consistency < 20) return "very_low";
    if (consistency < 40) return "low";
    if (consistency < 60) return "moderate";
    if (consistency < 80) return "high";
    return "very_high";
  }

  hasWon(): boolean {
    return this.rank === 1;
  }

  isTopPerformer(threshold: number = 10): boolean {
    return !!this.rank && this.rank <= threshold;
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.competitionId.trim().length > 0 &&
      this.userId.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.wpm >= 0 &&
      this.accuracy >= 0 &&
      this.accuracy <= 100 &&
      this.errors >= 0 &&
      this.timeElapsed > 0 &&
      this.layoutUsed.trim().length > 0 &&
      this.attemptNumber >= 1 &&
      this.score >= 0 &&
      this.submittedAt > 0
    );
  }

  equals(other: CompetitionEntry): boolean {
    return this.id === other.id;
  }
}
