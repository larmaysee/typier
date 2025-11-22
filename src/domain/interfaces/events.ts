/**
 * Domain events for loose coupling and event-driven architecture
 * These events represent important domain occurrences
 */

import { LanguageCode } from "../enums/languages";
import { TypingMode } from "../enums/typing-mode";

// Base domain event interface
export interface DomainEvent<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly data: T;
  readonly timestamp: number;
  readonly version: number;
  readonly causedBy?: string; // User ID who caused the event
}

// Typing session events
export interface TypingSessionStartedEvent
  extends DomainEvent<{
    sessionId: string;
    userId: string;
    mode: TypingMode;
    language: LanguageCode;
    keyboardLayoutId: string;
    textContent: string;
    difficulty: string;
  }> {
  type: "typing.session.started";
}

export interface TypingSessionCompletedEvent
  extends DomainEvent<{
    sessionId: string;
    userId: string;
    mode: TypingMode;
    language: LanguageCode;
    wpm: number;
    accuracy: number;
    duration: number;
    errorsCount: number;
    isPersonalBest: boolean;
  }> {
  type: "typing.session.completed";
}

export interface TypingSessionPausedEvent
  extends DomainEvent<{
    sessionId: string;
    userId: string;
    pausedAt: number;
    currentProgress: number;
  }> {
  type: "typing.session.paused";
}

export interface TypingSessionResumedEvent
  extends DomainEvent<{
    sessionId: string;
    userId: string;
    resumedAt: number;
    pauseDuration: number;
  }> {
  type: "typing.session.resumed";
}

export interface TypingMistakeMadeEvent
  extends DomainEvent<{
    sessionId: string;
    userId: string;
    expectedCharacter: string;
    actualCharacter: string;
    position: number;
    timestamp: number;
  }> {
  type: "typing.mistake.made";
}

// Keyboard layout events
export interface LayoutSwitchedEvent
  extends DomainEvent<{
    sessionId?: string;
    userId: string;
    previousLayoutId?: string;
    newLayoutId: string;
    language: LanguageCode;
    reason: "user_selection" | "auto_detection" | "system_default";
  }> {
  type: "keyboard.layout.switched";
}

export interface CustomLayoutCreatedEvent
  extends DomainEvent<{
    layoutId: string;
    userId: string;
    layoutName: string;
    language: LanguageCode;
    basedOnLayoutId?: string;
  }> {
  type: "keyboard.layout.created";
}

export interface CustomLayoutUpdatedEvent
  extends DomainEvent<{
    layoutId: string;
    userId: string;
    changes: string[];
    version: number;
  }> {
  type: "keyboard.layout.updated";
}

// User events
export interface UserRegisteredEvent
  extends DomainEvent<{
    userId: string;
    username: string;
    email: string;
    preferredLanguage: LanguageCode;
    registrationSource: string;
  }> {
  type: "user.registered";
}

export interface UserPreferencesUpdatedEvent
  extends DomainEvent<{
    userId: string;
    changedFields: string[];
    previousValues: Record<string, unknown>;
    newValues: Record<string, unknown>;
  }> {
  type: "user.preferences.updated";
}

export interface PersonalBestAchievedEvent
  extends DomainEvent<{
    userId: string;
    mode: TypingMode;
    language: LanguageCode;
    metric: "wpm" | "accuracy" | "consistency";
    newValue: number;
    previousValue: number;
    improvement: number;
  }> {
  type: "user.personal_best.achieved";
}

export interface MilestoneReachedEvent
  extends DomainEvent<{
    userId: string;
    milestoneType: "tests_completed" | "wpm_threshold" | "accuracy_threshold" | "consistency_achieved";
    milestone: number;
    currentValue: number;
    description: string;
  }> {
  type: "user.milestone.reached";
}

export interface CompetitionStartedEvent
  extends DomainEvent<{
    competitionId: string;
    name: string;
    participantCount: number;
    expectedParticipants?: number;
  }> {
  type: "competition.started";
}

export interface CompetitionEntrySubmittedEvent
  extends DomainEvent<{
    competitionId: string;
    userId: string;
    username: string;
    wpm: number;
    accuracy: number;
    rank?: number;
    isFirstEntry: boolean;
  }> {
  type: "competition.entry.submitted";
}

export interface CompetitionCompletedEvent
  extends DomainEvent<{
    competitionId: string;
    name: string;
    totalParticipants: number;
    winnerUserId: string;
    winnerUsername: string;
    winnerScore: number;
  }> {
  type: "competition.completed";
}

export interface CompetitionRankingUpdatedEvent
  extends DomainEvent<{
    competitionId: string;
    userId: string;
    previousRank?: number;
    newRank: number;
    rankChange: number;
    currentScore: number;
  }> {
  type: "competition.ranking.updated";
}

// Leaderboard events
export interface LeaderboardPositionChangedEvent
  extends DomainEvent<{
    userId: string;
    username: string;
    language: LanguageCode;
    mode: TypingMode;
    previousRank?: number;
    newRank: number;
    currentWPM: number;
    rankChange: number;
  }> {
  type: "leaderboard.position.changed";
}

export interface NewLeaderboardRecordEvent
  extends DomainEvent<{
    userId: string;
    username: string;
    language: LanguageCode;
    mode: TypingMode;
    metric: "wpm" | "accuracy";
    newRecord: number;
    previousRecord?: number;
    improvement: number;
  }> {
  type: "leaderboard.record.new";
}

// System events
export interface SystemMaintenanceScheduledEvent
  extends DomainEvent<{
    scheduledFor: number;
    duration: number;
    description: string;
    affectedServices: string[];
  }> {
  type: "system.maintenance.scheduled";
}

export interface ErrorOccurredEvent
  extends DomainEvent<{
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    userId?: string;
    sessionId?: string;
    severity: "low" | "medium" | "high" | "critical";
    context: Record<string, unknown>;
  }> {
  type: "system.error.occurred";
}

// Event factory functions for creating events
export class DomainEvents {
  private static createEvent<T>(type: string, aggregateId: string, data: T, causedBy?: string): DomainEvent<T> {
    return {
      id: this.generateEventId(),
      type,
      aggregateId,
      data,
      timestamp: Date.now(),
      version: 1,
      causedBy,
    };
  }

  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Factory methods for commonly used events
  static typingSessionStarted(
    sessionId: string,
    userId: string,
    mode: TypingMode,
    language: LanguageCode,
    keyboardLayoutId: string,
    textContent: string,
    difficulty: string
  ): TypingSessionStartedEvent {
    return this.createEvent(
      "typing.session.started",
      sessionId,
      {
        sessionId,
        userId,
        mode,
        language,
        keyboardLayoutId,
        textContent,
        difficulty,
      },
      userId
    ) as TypingSessionStartedEvent;
  }

  static layoutSwitched(
    userId: string,
    newLayoutId: string,
    language: LanguageCode,
    previousLayoutId?: string,
    sessionId?: string,
    reason: "user_selection" | "auto_detection" | "system_default" = "user_selection"
  ): LayoutSwitchedEvent {
    return this.createEvent(
      "keyboard.layout.switched",
      userId,
      {
        sessionId,
        userId,
        previousLayoutId,
        newLayoutId,
        language,
        reason,
      },
      userId
    ) as LayoutSwitchedEvent;
  }

  static personalBestAchieved(
    userId: string,
    mode: TypingMode,
    language: LanguageCode,
    metric: "wpm" | "accuracy" | "consistency",
    newValue: number,
    previousValue: number
  ): PersonalBestAchievedEvent {
    return this.createEvent(
      "user.personal_best.achieved",
      userId,
      {
        userId,
        mode,
        language,
        metric,
        newValue,
        previousValue,
        improvement: newValue - previousValue,
      },
      userId
    ) as PersonalBestAchievedEvent;
  }
}

// Event handler type
export interface EventHandler<T = unknown> {
  (event: DomainEvent<T>): Promise<void> | void;
}

// Event bus interface
export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler<unknown>): void;
}
