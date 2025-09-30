import { LanguageCode } from "@/domain";
import { IUserRepository } from "@/domain/interfaces";
import { User, UserPreferences } from "@/domain/entities";
import { RepositoryError, NotFoundError } from "@/shared/errors";
import { LocalStorageClient } from "../../persistence/local-storage/storage-client";
import type { ILogger } from "@/shared/utils/logger";

export class LocalUserPreferencesRepository implements IUserRepository {
  private readonly USERS_KEY_PREFIX = 'users';
  private readonly PREFERENCES_KEY_PREFIX = 'user_preferences';

  constructor(
    private storage: LocalStorageClient,
    private logger: ILogger
  ) { }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.storage.getItem<User>(`${this.USERS_KEY_PREFIX}:${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user: ${id}`, error as Error);
      throw new RepositoryError('Failed to find user', error as Error);
    }
  }

  async save(user: User): Promise<void> {
    try {
      await this.storage.setItem(`${this.USERS_KEY_PREFIX}:${user.id}`, user);

      // Also save preferences separately for easier access
      await this.storage.setItem(`${this.PREFERENCES_KEY_PREFIX}:${user.id}`, user.preferences);

      this.logger.info(`Saved user to localStorage: ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to save user to localStorage', error as Error);
      throw new RepositoryError('Failed to save user', error as Error);
    }
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<void> {
    try {
      // Update the separate preferences record
      await this.storage.setItem(`${this.PREFERENCES_KEY_PREFIX}:${userId}`, preferences);

      // Also update the user record if it exists
      const userData = await this.storage.getItem<any>(`${this.USERS_KEY_PREFIX}:${userId}`);
      if (userData) {
        // Create new User instance with updated preferences
        const user = User.create(userData);
        const updatedUser = user.updatePreferences(preferences);
        await this.storage.setItem(`${this.USERS_KEY_PREFIX}:${userId}`, updatedUser);
      }

      this.logger.info(`Updated preferences for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update preferences for user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to update user preferences', error as Error);
    }
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const preferences = await this.storage.getItem<UserPreferences>(`${this.PREFERENCES_KEY_PREFIX}:${userId}`);
      return preferences;
    } catch (error) {
      this.logger.error(`Failed to get preferences for user: ${userId}`, error as Error);
      return null; // Return null to allow fallback to defaults
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.storage.removeItem(`${this.USERS_KEY_PREFIX}:${userId}`);
      await this.storage.removeItem(`${this.PREFERENCES_KEY_PREFIX}:${userId}`);
      this.logger.info(`Deleted user from localStorage: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${userId}`, error as Error);
      throw new RepositoryError('Failed to delete user', error as Error);
    }
  }

  // Utility method to create a user with default preferences
  async createUserWithDefaults(userId: string, username: string, email: string): Promise<User> {
    const user = User.create({
      id: userId,
      username,
      email
    });

    await this.save(user);
    return user;
  }
}