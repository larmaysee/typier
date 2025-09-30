import { IUserRepository } from "@/domain/interfaces";
import { DifficultyLevel, User, UserPreferences } from "@/domain/entities";
import { RepositoryError } from "@/shared/errors";
import { AppwriteDatabaseClient } from "../../persistence/appwrite/database-client";
import {
  COLLECTIONS,
  AppwriteUserDocument,
  AppwriteUserPreferencesDocument
} from "../../persistence/appwrite/collections.config";
import type { ILogger } from "@/shared/utils/logger";
import { LanguageCode } from "@/enums/site-config";

export class AppwriteUserRepository implements IUserRepository {
  constructor(
    private client: AppwriteDatabaseClient,
    private logger: ILogger
  ) { }

  async findById(id: string): Promise<User | null> {
    try {
      const userDoc = await this.client.getDocument<AppwriteUserDocument>(
        COLLECTIONS.USERS,
        id
      );

      if (!userDoc) {
        return null;
      }

      const preferencesDoc = await this.client.getDocument<AppwriteUserPreferencesDocument>(
        COLLECTIONS.USER_PREFERENCES,
        id
      );

      return this.fromAppwriteDocuments(userDoc, preferencesDoc);
    } catch (error) {
      this.logger.error(`Failed to find user: ${id}`, error as Error);
      throw new RepositoryError('Failed to find user', error as Error);
    }
  }

  async save(user: User): Promise<void> {
    try {
      const userDoc = this.toUserDocument(user);
      const preferencesDoc = this.toPreferencesDocument(user);

      await this.client.createDocument<AppwriteUserDocument>(
        COLLECTIONS.USERS,
        userDoc,
        user.id
      );

      await this.client.createDocument<AppwriteUserPreferencesDocument>(
        COLLECTIONS.USER_PREFERENCES,
        preferencesDoc,
        user.id
      );

      this.logger.info(`Saved user: ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to save user', error as Error);
      throw new RepositoryError('Failed to save user', error as Error);
    }
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<void> {
    try {
      const preferencesDoc = {
        user_id: userId,
        default_language: preferences.defaultLanguage,
        keyboard_layouts: JSON.stringify(preferences.preferredLayouts),
        theme: preferences.theme,
        sound_enabled: preferences.soundEnabled,
        visual_feedback: true, // Default value since not in domain model
        auto_complete_enabled: false // Default value since not in domain model
      };

      await this.client.updateDocument<AppwriteUserPreferencesDocument>(
        COLLECTIONS.USER_PREFERENCES,
        userId,
        preferencesDoc
      );

      this.logger.info(`Updated preferences for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update preferences for user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to update user preferences', error as Error);
    }
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const preferencesDoc = await this.client.getDocument<AppwriteUserPreferencesDocument>(
        COLLECTIONS.USER_PREFERENCES,
        userId
      );

      if (!preferencesDoc) {
        return null;
      }

      return this.preferencesFromDocument(preferencesDoc);
    } catch (error) {
      this.logger.error(`Failed to get preferences for user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to get user preferences', error as Error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user document
      await this.client.deleteDocument(COLLECTIONS.USERS, userId);

      // Delete user preferences
      try {
        await this.client.deleteDocument(COLLECTIONS.USER_PREFERENCES, userId);
      } catch {
        // Preferences might not exist, that's ok
      }

      this.logger.info(`Deleted user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to delete user', error as Error);
    }
  }

  private toUserDocument(user: User): Omit<AppwriteUserDocument, '$id' | '$createdAt' | '$updatedAt'> {
    return {
      username: user.username,
      email: user.email,
      total_tests: user.profile.totalTests,
      best_wpm: user.profile.bestWPM,
      average_accuracy: user.profile.averageAccuracy,
      favorite_language: user.profile.favoriteLanguage
    };
  }

  private toPreferencesDocument(user: User): Omit<AppwriteUserPreferencesDocument, '$id' | '$createdAt' | '$updatedAt'> {
    return {
      user_id: user.id,
      default_language: user.preferences.defaultLanguage,
      keyboard_layouts: JSON.stringify(user.preferences.preferredLayouts),
      theme: user.preferences.theme,
      sound_enabled: user.preferences.soundEnabled,
      visual_feedback: true, // Default value since not in domain model
      auto_complete_enabled: false // Default value since not in domain model
    };
  }

  private fromAppwriteDocuments(
    userDoc: AppwriteUserDocument,
    preferencesDoc?: AppwriteUserPreferencesDocument | null
  ): User {
    const defaultPreferences: UserPreferences = {
      defaultLanguage: LanguageCode.EN,
      preferredLayouts: {} as Record<LanguageCode, string>,
      theme: 'system',
      soundEnabled: false,
      showKeyboard: true,
      difficulty: DifficultyLevel.MEDIUM,
      autoSwitchLayout: false,
      practiceReminders: true,
      competitionNotifications: true,
      showDetailedStats: true,
      privacyMode: false
    };

    return User.create({
      id: userDoc.$id,
      username: userDoc.username,
      email: userDoc.email,
      preferences: preferencesDoc ? this.preferencesFromDocument(preferencesDoc) : defaultPreferences,
      profile: {
        totalTests: userDoc.total_tests,
        bestWPM: userDoc.best_wpm,
        averageAccuracy: userDoc.average_accuracy,
        averageWPM: userDoc.best_wpm, // Simplified - should be calculated
        totalTimeTyped: 0, // This would need to be calculated from tests
        favoriteLanguage: userDoc.favorite_language as LanguageCode,
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
      },
      createdAt: new Date(userDoc.$createdAt).getTime(),
      updatedAt: new Date(userDoc.$updatedAt).getTime()
    });
  }

  private preferencesFromDocument(doc: AppwriteUserPreferencesDocument): UserPreferences {
    return {
      defaultLanguage: doc.default_language as LanguageCode,
      preferredLayouts: JSON.parse(doc.keyboard_layouts || '{}'),
      theme: doc.theme as any,
      soundEnabled: doc.sound_enabled,
      showKeyboard: true, // Default value since not in document
      difficulty: DifficultyLevel.MEDIUM, // Default value since not in document
      autoSwitchLayout: false, // Default value since not in document
      practiceReminders: true, // Default value since not in document
      competitionNotifications: true, // Default value since not in document
      showDetailedStats: true, // Default value since not in document
      privacyMode: false // Default value since not in document
    };
  }
}