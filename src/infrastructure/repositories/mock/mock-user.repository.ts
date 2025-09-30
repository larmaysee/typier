/**
 * Mock implementation of IUserRepository for development and testing
 */

import { IUserRepository } from "../../../domain/interfaces/repositories";
import { User, UserPreferences, UserProfile } from "../../../domain/entities/user";
import { TypingStatistics } from "../../../domain/entities/statistics";
import { TypingMode } from "../../../domain/enums/typing-mode";
import { LanguageCode } from "@/domain";

export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private userStats: Map<string, TypingStatistics> = new Map();

  constructor() {
    // Add anonymous user for guests
    this.users.set("anonymous", User.create({
      id: "anonymous",
      username: "anonymous",
      email: "anonymous@guest.local",
      profile: {
        displayName: "Guest User",
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
          progress: 0
        },
        experiencePoints: 0
      }
    }));

    // Add some test users
    this.users.set("user1", User.create({
      id: "user1",
      username: "testuser1",
      email: "test1@example.com",
      profile: {
        displayName: "Test User 1",
        totalTests: 45,
        bestWPM: 65,
        averageAccuracy: 96.5,
        averageWPM: 58,
        totalTimeTyped: 3600,
        favoriteLanguage: LanguageCode.EN,
        joinedCompetitions: 5,
        competitionsWon: 1,
        currentStreak: 7,
        longestStreak: 14,
        achievements: ["speed_demon", "accuracy_master"],
        level: {
          current: 5,
          name: "Advanced",
          requiredXP: 400,
          nextLevelXP: 500,
          progress: 80
        },
        experiencePoints: 480
      }
    }));

    // Add mock statistics
    this.userStats.set("user1", TypingStatistics.create({
      userId: "user1",
      language: LanguageCode.EN,
      mode: TypingMode.NORMAL,
      totalTests: 45,
      averageWPM: 58,
      bestWPM: 65,
      worstWPM: 25,
      averageAccuracy: 96.5,
      bestAccuracy: 100,
      worstAccuracy: 85,
      totalTimeTyped: 3600,
      totalCharactersTyped: 25000,
      totalErrors: 150,
      improvementRate: 2.5,
      consistencyScore: 85,
      preferredTimeOfDay: 14,
      streak: 7,
      longestStreak: 14,
      performanceTrends: [],
      lastUpdated: Date.now()
    }));
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      const updatedUser = user.updatePreferences(preferences);
      this.users.set(userId, updatedUser);
    }
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const user = await this.findById(userId);
    return user?.preferences || null;
  }

  async updateProfile(userId: string, profile: UserProfile): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      const updatedUser = user.updateProfile(profile);
      this.users.set(userId, updatedUser);
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getStatistics(userId: string): Promise<TypingStatistics | null> {
    return this.userStats.get(userId) || null;
  }

  async updateStatistics(userId: string, stats: Partial<TypingStatistics>): Promise<void> {
    const currentStats = this.userStats.get(userId);
    if (currentStats) {
      // Create updated statistics - in a real implementation, this would be more sophisticated
      const updatedStats = TypingStatistics.create({
        userId: currentStats.userId,
        language: currentStats.language,
        mode: currentStats.mode,
        totalTests: stats.totalTests ?? currentStats.totalTests,
        averageWPM: stats.averageWPM ?? currentStats.averageWPM,
        bestWPM: stats.bestWPM ?? currentStats.bestWPM,
        worstWPM: stats.worstWPM ?? currentStats.worstWPM,
        averageAccuracy: stats.averageAccuracy ?? currentStats.averageAccuracy,
        bestAccuracy: stats.bestAccuracy ?? currentStats.bestAccuracy,
        worstAccuracy: stats.worstAccuracy ?? currentStats.worstAccuracy,
        totalTimeTyped: stats.totalTimeTyped ?? currentStats.totalTimeTyped,
        totalCharactersTyped: stats.totalCharactersTyped ?? currentStats.totalCharactersTyped,
        totalErrors: stats.totalErrors ?? currentStats.totalErrors,
        improvementRate: stats.improvementRate ?? currentStats.improvementRate,
        consistencyScore: stats.consistencyScore ?? currentStats.consistencyScore,
        preferredTimeOfDay: stats.preferredTimeOfDay ?? currentStats.preferredTimeOfDay,
        streak: stats.streak ?? currentStats.streak,
        longestStreak: stats.longestStreak ?? currentStats.longestStreak,
        performanceTrends: stats.performanceTrends ?? currentStats.performanceTrends,
        lastUpdated: Date.now()
      });
      this.userStats.set(userId, updatedStats);
    }
  }
}