export interface CompetitionEntry {
  id: string;
  competitionId: string;
  userId: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  mistakes: number;
  completionTime: number; // in seconds
  layoutUsed: string;
  submittedAt: Date;
  rank?: number;
}