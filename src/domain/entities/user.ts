export interface User {
  id: string;
  username: string;
  email: string;
  totalTests: number;
  bestWpm: number;
  averageAccuracy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  preferredLanguage: 'english' | 'lisu' | 'myanmar';
  defaultTestDuration: number;
  showLeaderboard: boolean;
  showShiftLabel?: boolean;
  practiceMode?: boolean;
  difficultyMode?: 'chars' | 'syntaxs';
  colorTheme?: string;
  keyboardLayouts: Record<string, string>; // language -> preferred layout ID
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  user: User;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserStatistics {
  userId: string;
  totalTests: number;
  totalTimeTyped: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  totalCharactersTyped: number;
  improvementRate: number;
  lastTestDate: Date;
  createdAt: Date;
  updatedAt: Date;
}