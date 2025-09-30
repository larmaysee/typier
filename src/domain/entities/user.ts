/**
 * Domain entities for user management and preferences
 * Contains user account, profile, and preference business logic
 */

import { LanguageCode } from "../../enums/site-config";
import { DifficultyLevel, TypingMode } from "../enums/typing-mode";

export interface UserPreferences {
  readonly defaultLanguage: LanguageCode;
  readonly preferredLayouts: Record<LanguageCode, string>;
  readonly theme: "light" | "dark" | "system";
  readonly soundEnabled: boolean;
  readonly showKeyboard: boolean;
  readonly difficulty: DifficultyLevel;
  readonly autoSwitchLayout: boolean;
  readonly practiceReminders: boolean;
  readonly competitionNotifications: boolean;
  readonly showDetailedStats: boolean;
  readonly privacyMode: boolean;
}

export interface UserProfile {
  readonly displayName?: string;
  readonly avatar?: string;
  readonly bio?: string;
  readonly totalTests: number;
  readonly bestWPM: number;
  readonly averageAccuracy: number;
  readonly averageWPM: number;
  readonly totalTimeTyped: number; // in seconds
  readonly favoriteLanguage: LanguageCode;
  readonly joinedCompetitions: number;
  readonly competitionsWon: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly achievements: string[];
  readonly level: UserLevel;
  readonly experiencePoints: number;
}

export interface UserLevel {
  readonly current: number;
  readonly name: string;
  readonly requiredXP: number;
  readonly nextLevelXP: number;
  readonly progress: number; // 0-100 percentage to next level
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly profile: UserProfile,
    public readonly preferences: UserPreferences,
    public readonly isEmailVerified: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: number,
    public readonly updatedAt: number
  ) {
    if (!id.trim()) throw new Error("User ID cannot be empty");
    if (!username.trim()) throw new Error("Username cannot be empty");
    if (!email.trim()) throw new Error("Email cannot be empty");
    if (!this.isValidEmail(email)) throw new Error("Invalid email format");
    if (username.length < 3)
      throw new Error("Username must be at least 3 characters");
    if (username.length > 30)
      throw new Error("Username must be at most 30 characters");
    if (!this.isValidUsername(username))
      throw new Error("Username contains invalid characters");
    if (createdAt <= 0) throw new Error("Created timestamp must be positive");
    if (updatedAt < createdAt)
      throw new Error("Updated timestamp cannot be before created timestamp");
  }

  static create(data: {
    id: string;
    username: string;
    email: string;
    profile?: Partial<UserProfile>;
    preferences?: Partial<UserPreferences>;
    isEmailVerified?: boolean;
    isActive?: boolean;
    createdAt?: number;
    updatedAt?: number;
  }): User {
    const now = Date.now();

    const defaultProfile: UserProfile = {
      totalTests: 0,
      bestWPM: 0,
      averageAccuracy: 0,
      averageWPM: 0,
      totalTimeTyped: 0,
      favoriteLanguage: LanguageCode.EN,
      joinedCompetitions: 0,
      competitionsWon: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      level: {
        current: 1,
        name: "Beginner",
        requiredXP: 0,
        nextLevelXP: 100,
        progress: 0,
      },
      experiencePoints: 0,
      ...data.profile,
    };

    const defaultPreferences: UserPreferences = {
      defaultLanguage: LanguageCode.EN,
      preferredLayouts: {
        [LanguageCode.EN]: "qwerty-us",
        [LanguageCode.MY]: "myanmar3",
        [LanguageCode.LI]: "sil-basic",
      },
      theme: "system",
      soundEnabled: true,
      showKeyboard: true,
      difficulty: DifficultyLevel.MEDIUM,
      autoSwitchLayout: false,
      practiceReminders: true,
      competitionNotifications: true,
      showDetailedStats: true,
      privacyMode: false,
      ...data.preferences,
    };

    return new User(
      data.id,
      data.username,
      data.email,
      defaultProfile,
      defaultPreferences,
      data.isEmailVerified || false,
      data.isActive !== false,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  static generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {
    // Allow alphanumeric, underscore, and hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
  }

  updateProfile(updates: Partial<UserProfile>): User {
    const updatedProfile = { ...this.profile, ...updates };

    return new User(
      this.id,
      this.username,
      this.email,
      updatedProfile,
      this.preferences,
      this.isEmailVerified,
      this.isActive,
      this.createdAt,
      Date.now()
    );
  }

  updatePreferences(updates: Partial<UserPreferences>): User {
    const updatedPreferences = { ...this.preferences, ...updates };

    return new User(
      this.id,
      this.username,
      this.email,
      this.profile,
      updatedPreferences,
      this.isEmailVerified,
      this.isActive,
      this.createdAt,
      Date.now()
    );
  }

  setPreferredLayout(language: LanguageCode, layoutId: string): User {
    const updatedLayouts = { ...this.preferences.preferredLayouts };
    updatedLayouts[language] = layoutId;

    return this.updatePreferences({
      preferredLayouts: updatedLayouts,
    });
  }

  recordTestResult(
    wpm: number,
    accuracy: number,
    timeTyped: number,
    mode: TypingMode
  ): User {
    const isNewBest = wpm > this.profile.bestWPM;
    const newTotalTests = this.profile.totalTests + 1;
    const newTotalTime = this.profile.totalTimeTyped + timeTyped;

    // Calculate new average WPM
    const previousTotalWPM = this.profile.averageWPM * this.profile.totalTests;
    const newAverageWPM = (previousTotalWPM + wpm) / newTotalTests;

    // Calculate new average accuracy
    const previousTotalAccuracy =
      this.profile.averageAccuracy * this.profile.totalTests;
    const newAverageAccuracy =
      (previousTotalAccuracy + accuracy) / newTotalTests;

    // Update streak
    let newCurrentStreak = this.profile.currentStreak;
    let newLongestStreak = this.profile.longestStreak;

    if (accuracy >= 90) {
      // Consider 90%+ accuracy as maintaining streak
      newCurrentStreak++;
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else {
      newCurrentStreak = 0;
    }

    // Calculate experience points (only for non-practice modes)
    let newXP = this.profile.experiencePoints;
    if (mode !== TypingMode.PRACTICE) {
      const baseXP = Math.floor(wpm / 10) + Math.floor(accuracy / 10);
      const bonusXP = isNewBest ? 50 : 0;
      newXP += baseXP + bonusXP;
    }

    const updatedProfile: UserProfile = {
      ...this.profile,
      totalTests: newTotalTests,
      bestWPM: Math.max(this.profile.bestWPM, wpm),
      averageWPM: Math.round(newAverageWPM * 100) / 100,
      averageAccuracy: Math.round(newAverageAccuracy * 100) / 100,
      totalTimeTyped: newTotalTime,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      experiencePoints: newXP,
      level: this.calculateLevel(newXP),
    };

    return new User(
      this.id,
      this.username,
      this.email,
      updatedProfile,
      this.preferences,
      this.isEmailVerified,
      this.isActive,
      this.createdAt,
      Date.now()
    );
  }

  private calculateLevel(experiencePoints: number): UserLevel {
    // Simple level calculation: level = floor(sqrt(XP/100)) + 1
    const level = Math.floor(Math.sqrt(experiencePoints / 100)) + 1;
    const requiredXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progress =
      ((experiencePoints - requiredXP) / (nextLevelXP - requiredXP)) * 100;

    const levelNames = [
      "Beginner",
      "Novice",
      "Apprentice",
      "Intermediate",
      "Advanced",
      "Expert",
      "Master",
      "Grandmaster",
      "Legend",
      "Ultimate",
    ];

    const levelName =
      levelNames[Math.min(level - 1, levelNames.length - 1)] || "Ultimate";

    return {
      current: level,
      name: levelName,
      requiredXP,
      nextLevelXP,
      progress: Math.min(Math.max(progress, 0), 100),
    };
  }

  addAchievement(achievementId: string): User {
    if (this.profile.achievements.includes(achievementId)) {
      return this; // Already has this achievement
    }

    const updatedAchievements = [...this.profile.achievements, achievementId];
    const bonusXP = 25; // Bonus XP for earning achievement

    return this.updateProfile({
      achievements: updatedAchievements,
      experiencePoints: this.profile.experiencePoints + bonusXP,
      level: this.calculateLevel(this.profile.experiencePoints + bonusXP),
    });
  }

  joinCompetition(): User {
    return this.updateProfile({
      joinedCompetitions: this.profile.joinedCompetitions + 1,
    });
  }

  winCompetition(): User {
    const bonusXP = 100; // Large XP bonus for winning competition

    return this.updateProfile({
      competitionsWon: this.profile.competitionsWon + 1,
      experiencePoints: this.profile.experiencePoints + bonusXP,
      level: this.calculateLevel(this.profile.experiencePoints + bonusXP),
    });
  }

  verifyEmail(): User {
    if (this.isEmailVerified) {
      return this;
    }

    return new User(
      this.id,
      this.username,
      this.email,
      this.profile,
      this.preferences,
      true,
      this.isActive,
      this.createdAt,
      Date.now()
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.profile,
      this.preferences,
      this.isEmailVerified,
      false,
      this.createdAt,
      Date.now()
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.profile,
      this.preferences,
      this.isEmailVerified,
      true,
      this.createdAt,
      Date.now()
    );
  }

  getPreferredLayout(language: LanguageCode): string {
    return this.preferences.preferredLayouts[language] || "default";
  }

  hasAchievement(achievementId: string): boolean {
    return this.profile.achievements.includes(achievementId);
  }

  canJoinCompetition(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  getTypingEfficiency(): number {
    if (this.profile.totalTimeTyped === 0) return 0;
    // Calculate characters per minute based on average WPM
    const charactersPerMinute = this.profile.averageWPM * 5; // 5 characters per word average
    return Math.round(charactersPerMinute * 100) / 100;
  }

  getTypingLevel(): "beginner" | "intermediate" | "advanced" | "expert" {
    const avgWPM = this.profile.averageWPM;
    if (avgWPM < 20) return "beginner";
    if (avgWPM < 40) return "intermediate";
    if (avgWPM < 70) return "advanced";
    return "expert";
  }

  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.username.trim().length >= 3 &&
      this.username.trim().length <= 30 &&
      this.isValidEmail(this.email) &&
      this.isValidUsername(this.username) &&
      this.createdAt > 0 &&
      this.updatedAt >= this.createdAt &&
      this.profile.totalTests >= 0 &&
      this.profile.bestWPM >= 0 &&
      this.profile.averageAccuracy >= 0 &&
      this.profile.averageAccuracy <= 100
    );
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
