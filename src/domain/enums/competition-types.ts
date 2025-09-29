/**
 * Domain enums for competition system
 */

export enum CompetitionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special',
  TOURNAMENT = 'tournament'
}

export enum CompetitionStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CompetitionCategory {
  SPEED = 'speed',          // Fastest WPM
  ACCURACY = 'accuracy',    // Highest accuracy
  CONSISTENCY = 'consistency', // Most consistent performance
  ENDURANCE = 'endurance'   // Longest sustained performance
}