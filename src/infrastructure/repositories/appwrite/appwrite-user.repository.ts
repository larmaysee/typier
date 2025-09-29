import { IUserRepository } from "@/domain/interfaces";
import { User, UserPreferences } from "@/domain/entities";
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
  ) {}

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
        keyboard_layouts: JSON.stringify(preferences.keyboardLayouts),
        theme: preferences.theme,
        sound_enabled: preferences.soundEnabled,
        visual_feedback: preferences.visualFeedback,
        auto_complete_enabled: preferences.autoCompleteEnabled
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
      total_tests: user.statistics.totalTests,
      best_wpm: user.statistics.bestWpm,
      average_accuracy: user.statistics.averageAccuracy,
      favorite_language: user.statistics.favoriteLanguage
    };
  }

  private toPreferencesDocument(user: User): Omit<AppwriteUserPreferencesDocument, '$id' | '$createdAt' | '$updatedAt'> {
    return {
      user_id: user.id,
      default_language: user.preferences.defaultLanguage,
      keyboard_layouts: JSON.stringify(user.preferences.keyboardLayouts),
      theme: user.preferences.theme,
      sound_enabled: user.preferences.soundEnabled,
      visual_feedback: user.preferences.visualFeedback,
      auto_complete_enabled: user.preferences.autoCompleteEnabled
    };
  }

  private fromAppwriteDocuments(
    userDoc: AppwriteUserDocument,
    preferencesDoc?: AppwriteUserPreferencesDocument | null
  ): User {
    const defaultPreferences: UserPreferences = {
      defaultLanguage: LanguageCode.EN,
      keyboardLayouts: {} as Record<LanguageCode, string>,
      theme: 'system',
      soundEnabled: false,
      visualFeedback: true,
      autoCompleteEnabled: true
    };

    return {
      id: userDoc.$id,
      username: userDoc.username,
      email: userDoc.email,
      preferences: preferencesDoc ? this.preferencesFromDocument(preferencesDoc) : defaultPreferences,
      statistics: {
        totalTests: userDoc.total_tests,
        bestWpm: userDoc.best_wpm,
        averageAccuracy: userDoc.average_accuracy,
        totalTimeTyped: 0, // This would need to be calculated from tests
        favoriteLanguage: userDoc.favorite_language as LanguageCode,
        improvementTrend: 0 // This would need to be calculated
      },
      createdAt: new Date(userDoc.$createdAt).getTime(),
      updatedAt: new Date(userDoc.$updatedAt).getTime()
    };
  }

  private preferencesFromDocument(doc: AppwriteUserPreferencesDocument): UserPreferences {
    return {
      defaultLanguage: doc.default_language as LanguageCode,
      keyboardLayouts: JSON.parse(doc.keyboard_layouts || '{}'),
      theme: doc.theme as any,
      soundEnabled: doc.sound_enabled,
      visualFeedback: doc.visual_feedback,
      autoCompleteEnabled: doc.auto_complete_enabled
    };
  }
}