import { TypingDatabaseService } from "./appwrite";
import { LanguageCode } from "@/enums/site-config";

export interface LegacyTypingTestResult {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  testDuration: number;
  language: string;
  timestamp: number;
  charactersTyped: number;
  errors: number;
}

export class DataMigrationService {
  private static STORAGE_KEY = 'typoria_typing_statistics';
  private static MIGRATION_STATUS_KEY = 'typoria_migration_status';

  /**
   * Check if migration has already been completed for a user
   */
  static hasMigrationCompleted(userId: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const migrationStatus = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      if (!migrationStatus) return false;

      const status = JSON.parse(migrationStatus);
      return status[userId] === 'completed';
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as completed for a user
   */
  static markMigrationCompleted(userId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const migrationStatus = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      const status = migrationStatus ? JSON.parse(migrationStatus) : {};

      status[userId] = 'completed';
      status[`${userId}_timestamp`] = Date.now();

      localStorage.setItem(this.MIGRATION_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error marking migration completed:', error);
    }
  }

  /**
   * Get legacy data from localStorage
   */
  static getLegacyData(): LegacyTypingTestResult[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading legacy data:', error);
      return [];
    }
  }

  /**
   * Convert legacy language string to LanguageCode enum
   */
  static convertLanguageCode(legacyLanguage: string): LanguageCode {
    switch (legacyLanguage.toLowerCase()) {
      case 'english':
      case 'en':
        return LanguageCode.EN;
      case 'lisu':
      case 'li':
        return LanguageCode.LI;
      case 'myanmar':
      case 'my':
        return LanguageCode.MY;
      default:
        console.warn(`Unknown language: ${legacyLanguage}, defaulting to English`);
        return LanguageCode.EN;
    }
  }

  /**
   * Migrate user's data from localStorage to Appwrite database
   */
  static async migrateUserData(userId: string, userName: string): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
      // Check if migration already completed
      if (this.hasMigrationCompleted(userId)) {
        return {
          success: true,
          migratedCount: 0,
          errors: ['Migration already completed for this user']
        };
      }

      // Get legacy data
      const legacyData = this.getLegacyData();
      const userTests = legacyData.filter(test => test.userId === userId);

      if (userTests.length === 0) {
        this.markMigrationCompleted(userId);
        return {
          success: true,
          migratedCount: 0,
          errors: ['No data to migrate']
        };
      }

      console.log(`Starting migration for user ${userId}: ${userTests.length} tests`);

      // Sort tests by timestamp to maintain chronological order
      const sortedTests = userTests.sort((a, b) => a.timestamp - b.timestamp);

      // Migrate each test
      for (const test of sortedTests) {
        try {
          const languageCode = this.convertLanguageCode(test.language);

          await TypingDatabaseService.createTypingTest({
            userId,
            wpm: test.wpm,
            accuracy: test.accuracy,
            correctWords: test.correctWords,
            incorrectWords: test.incorrectWords,
            totalWords: test.totalWords,
            duration: test.testDuration,
            language: languageCode,
            charactersTyped: test.charactersTyped,
            errors: test.errors
          });

          migratedCount++;
        } catch (testError) {
          console.error(`Error migrating test ${test.id}:`, testError);
          errors.push(`Failed to migrate test ${test.id}: ${testError}`);
        }
      }

      // Update leaderboard with best scores
      await this.updateLeaderboardsAfterMigration(userId, userName, sortedTests);

      // Mark migration as completed
      this.markMigrationCompleted(userId);

      console.log(`Migration completed for user ${userId}: ${migratedCount}/${userTests.length} tests migrated`);

      return {
        success: errors.length === 0 || migratedCount > 0,
        migratedCount,
        errors
      };

    } catch (error) {
      console.error('Migration failed:', error);
      errors.push(`Migration failed: ${error}`);

      return {
        success: false,
        migratedCount,
        errors
      };
    }
  }

  /**
   * Update leaderboards with best scores from migrated data
   */
  private static async updateLeaderboardsAfterMigration(
    userId: string,
    userName: string,
    tests: LegacyTypingTestResult[]
  ): Promise<void> {
    try {
      // Group tests by language and duration to find best WPM for each category
      const leaderboardEntries = new Map<string, { bestWpm: number; language: LanguageCode; duration: number }>();

      for (const test of tests) {
        const language = this.convertLanguageCode(test.language);
        const duration = test.testDuration;

        // Normalize duration to standard categories
        let durationCategory: number;
        if (duration <= 15) durationCategory = 15;
        else if (duration <= 30) durationCategory = 30;
        else if (duration <= 60) durationCategory = 60;
        else durationCategory = 120;

        const key = `${language}_${durationCategory}`;
        const existing = leaderboardEntries.get(key);

        if (!existing || test.wpm > existing.bestWpm) {
          leaderboardEntries.set(key, {
            bestWpm: test.wpm,
            language,
            duration: durationCategory
          });
        }
      }

      // Update leaderboard for each category
      for (const entry of leaderboardEntries.values()) {
        try {
          await TypingDatabaseService.updateLeaderboard(
            userId,
            userName,
            entry.bestWpm,
            entry.language,
            entry.duration
          );
        } catch (leaderboardError) {
          console.error('Error updating leaderboard:', leaderboardError);
        }
      }
    } catch (error) {
      console.error('Error updating leaderboards after migration:', error);
    }
  }

  /**
   * Backup current localStorage data before migration
   */
  static backupLocalData(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const backup = {
        typingStatistics: localStorage.getItem(this.STORAGE_KEY),
        migrationStatus: localStorage.getItem(this.MIGRATION_STATUS_KEY),
        timestamp: Date.now(),
        version: '1.0'
      };

      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  /**
   * Restore data from backup
   */
  static restoreFromBackup(backupData: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const backup = JSON.parse(backupData);

      if (backup.typingStatistics) {
        localStorage.setItem(this.STORAGE_KEY, backup.typingStatistics);
      }

      if (backup.migrationStatus) {
        localStorage.setItem(this.MIGRATION_STATUS_KEY, backup.migrationStatus);
      }

      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Clean up migrated data from localStorage (optional)
   */
  static cleanupMigratedData(userId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const legacyData = this.getLegacyData();
      const remainingData = legacyData.filter(test => test.userId !== userId);

      if (remainingData.length === 0) {
        localStorage.removeItem(this.STORAGE_KEY);
      } else {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingData));
      }

      console.log(`Cleaned up migrated data for user ${userId}`);
    } catch (error) {
      console.error('Error cleaning up migrated data:', error);
    }
  }

  /**
   * Get migration status for all users
   */
  static getMigrationStatus(): Record<string, { migrated: boolean; timestamp: number }> {
    if (typeof window === 'undefined') return {};

    try {
      const migrationStatus = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      return migrationStatus ? JSON.parse(migrationStatus) : {};
    } catch (error) {
      console.error('Error getting migration status:', error);
      return {};
    }
  }

  /**
   * Reset migration status (for testing purposes)
   */
  static resetMigrationStatus(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.MIGRATION_STATUS_KEY);
      console.log('Migration status reset');
    } catch (error) {
      console.error('Error resetting migration status:', error);
    }
  }
}