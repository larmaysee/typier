import { LanguageCode } from "@/domain";
import { Account, Client, Databases, ID, Query } from "appwrite";

const client = new Client();

// Check if environment variables are available
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
} else {
  console.warn("Appwrite environment variables not configured properly");
}

const account = new Account(client);
const databases = new Databases(client);

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "typoria-db";
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || "users",
  TYPING_TESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TYPING_TESTS || "typing_tests",
  LEADERBOARDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEADERBOARDS || "leaderboards",
  USER_SETTINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_SETTINGS || "user_settings",
} as const;

// Type definitions for database documents
export interface UserDocument {
  $id: string;
  username: string;
  email: string;
  total_tests: number;
  best_wpm: number;
  average_accuracy: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface TypingTestDocument {
  $id: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  incorrect_words: number;
  total_words: number;
  duration: number;
  language: "english" | "lisu" | "myanmar";
  characters_typed: number;
  errors: number;
  test_date: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface LeaderboardDocument {
  $id: string;
  user_id: string;
  username: string;
  best_wpm: number;
  language: "english" | "lisu" | "myanmar";
  duration_category: "15" | "30" | "60" | "120";
  $createdAt: string;
  $updatedAt: string;
}

export interface UserSettingsDocument {
  $id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  preferred_language: "english" | "lisu" | "myanmar";
  default_test_duration: number;
  show_leaderboard: boolean;
  show_shift_label?: boolean;
  practice_mode?: boolean;
  allow_deletion?: boolean;
  text_type?: "chars" | "words" | "numbers" | "sentences" | "paragraphs" | "code";
  difficulty_level?: "easy" | "medium" | "hard";
  color_theme?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Utility functions to convert between frontend and database formats
export const languageCodeToDb = (code: LanguageCode): "english" | "lisu" | "myanmar" => {
  switch (code) {
    case LanguageCode.EN:
      return "english";
    case LanguageCode.MY:
      return "myanmar";
    case LanguageCode.LI:
      return "lisu";
    default:
      return "english";
  }
};

export const dbToLanguageCode = (dbLang: "english" | "lisu" | "myanmar"): LanguageCode => {
  switch (dbLang) {
    case "english":
      return LanguageCode.EN;
    case "myanmar":
      return LanguageCode.MY;
    case "lisu":
      return LanguageCode.LI;
    default:
      return LanguageCode.EN;
  }
};

// Normalize any duration to standard leaderboard categories
export const normalizeDurationCategory = (duration: number): 15 | 30 | 60 | 120 => {
  if (duration <= 15) return 15;
  else if (duration <= 30) return 30;
  else if (duration <= 60) return 60;
  else return 120;
};

// Database service functions
export class TypingDatabaseService {
  // User management
  static async createUser(userData: { username: string; email: string; userId: string }): Promise<UserDocument> {
    try {
      return (await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, userData.userId, {
        username: userData.username,
        email: userData.email,
        total_tests: 0,
        best_wpm: 0,
        average_accuracy: 0,
      })) as unknown as UserDocument;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<UserDocument | null> {
    try {
      return (await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId)) as unknown as UserDocument;
    } catch (error) {
      if ((error as { code?: number })?.code === 404) {
        return null;
      }
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async updateUser(userId: string, userData: Partial<UserDocument>): Promise<UserDocument> {
    try {
      return (await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        userData
      )) as unknown as UserDocument;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Typing test management
  static async createTypingTest(testData: {
    userId: string;
    wpm: number;
    accuracy: number;
    correctWords: number;
    incorrectWords: number;
    totalWords: number;
    duration: number;
    language: LanguageCode;
    charactersTyped: number;
    errors: number;
  }): Promise<TypingTestDocument> {
    try {
      return (await databases.createDocument(DATABASE_ID, COLLECTIONS.TYPING_TESTS, ID.unique(), {
        user_id: testData.userId,
        wpm: testData.wpm,
        accuracy: testData.accuracy,
        correct_words: testData.correctWords,
        incorrect_words: testData.incorrectWords,
        total_words: testData.totalWords,
        duration: testData.duration,
        language: languageCodeToDb(testData.language),
        characters_typed: testData.charactersTyped,
        errors: testData.errors,
        test_date: new Date().toISOString(),
      })) as unknown as TypingTestDocument;
    } catch (error) {
      console.error("Error creating typing test:", error);
      throw error;
    }
  }

  static async getUserTypingTests(
    userId: string,
    limit?: number,
    language?: LanguageCode
  ): Promise<TypingTestDocument[]> {
    try {
      const queries = [Query.equal("user_id", userId), Query.orderDesc("test_date")];

      if (language) {
        queries.push(Query.equal("language", languageCodeToDb(language)));
      }

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TYPING_TESTS, queries);

      return response.documents as unknown as TypingTestDocument[];
    } catch (error) {
      console.error("Error getting user typing tests:", error);
      throw error;
    }
  }

  static async deleteUserTypingTests(userId: string): Promise<void> {
    try {
      // Get all tests for the user and delete them individually
      // This avoids recursion by using listDocuments directly instead of getUserTypingTests
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TYPING_TESTS, [
        Query.equal("user_id", userId),
      ]);

      const deletePromises = response.documents.map((test) =>
        databases.deleteDocument(DATABASE_ID, COLLECTIONS.TYPING_TESTS, test.$id)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting user typing tests:", error);
      throw error;
    }
  }

  // Leaderboard management
  /**
   * Update or create leaderboard entry for a user
   * @param userId - User ID
   * @param username - Username for display
   * @param bestWpm - Best WPM score
   * @param language - Language used in the test
   * @param durationCategory - Test duration (will be normalized to 15/30/60/120)
   */
  static async updateLeaderboard(
    userId: string,
    username: string,
    bestWpm: number,
    language: LanguageCode,
    durationCategory: number
  ): Promise<void> {
    try {
      // Normalize duration to standard categories to match database enum
      const normalizedDuration = normalizeDurationCategory(durationCategory);
      const durationStr = normalizedDuration.toString() as "15" | "30" | "60" | "120";
      const leaderboardId = `${userId}_${languageCodeToDb(language)}_${durationStr}`;

      // Try to update existing leaderboard entry
      try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.LEADERBOARDS, leaderboardId, {
          username,
          best_wpm: bestWpm,
        });
      } catch (updateError) {
        // If entry doesn't exist, create new one
        if ((updateError as { code?: number })?.code === 404) {
          await databases.createDocument(DATABASE_ID, COLLECTIONS.LEADERBOARDS, leaderboardId, {
            user_id: userId,
            username,
            best_wpm: bestWpm,
            language: languageCodeToDb(language),
            duration_category: durationStr,
          });
        } else {
          throw updateError;
        }
      }
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      throw error;
    }
  }

  static async getLeaderboard(
    language?: LanguageCode,
    durationCategory?: number,
    limit = 50
  ): Promise<LeaderboardDocument[]> {
    try {
      const queries = [Query.orderDesc("best_wpm"), Query.limit(limit)];

      if (language) {
        queries.push(Query.equal("language", languageCodeToDb(language)));
      }

      if (durationCategory) {
        // Normalize duration to standard categories
        const normalizedDuration = normalizeDurationCategory(durationCategory);
        queries.push(Query.equal("duration_category", normalizedDuration.toString()));
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEADERBOARDS, queries);

      return response.documents as unknown as LeaderboardDocument[];
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  }

  // User settings management
  static async getUserSettings(userId: string): Promise<UserSettingsDocument | null> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USER_SETTINGS, [
        Query.equal("user_id", userId),
      ]);

      return response.documents.length > 0 ? (response.documents[0] as unknown as UserSettingsDocument) : null;
    } catch (error) {
      console.error("Error getting user settings:", error);
      return null;
    }
  }

  static async createOrUpdateUserSettings(
    userId: string,
    settings: Partial<Omit<UserSettingsDocument, "$id" | "user_id" | "$createdAt" | "$updatedAt">>
  ): Promise<UserSettingsDocument> {
    try {
      const existingSettings = await this.getUserSettings(userId);

      if (existingSettings) {
        return (await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USER_SETTINGS,
          existingSettings.$id,
          settings
        )) as unknown as UserSettingsDocument;
      } else {
        return (await databases.createDocument(DATABASE_ID, COLLECTIONS.USER_SETTINGS, ID.unique(), {
          user_id: userId,
          theme: "system",
          preferred_language: "english",
          default_test_duration: 60,
          show_leaderboard: true,
          ...settings,
        })) as unknown as UserSettingsDocument;
      }
    } catch (error) {
      console.error("Error creating/updating user settings:", error);
      throw error;
    }
  }

  // Statistics calculations
  static async getUserStatistics(userId: string) {
    try {
      const tests = await this.getUserTypingTests(userId);

      if (tests.length === 0) {
        return {
          totalTests: 0,
          averageWpm: 0,
          bestWpm: 0,
          averageAccuracy: 0,
          bestAccuracy: 0,
          totalTimeTyped: 0,
          totalCharactersTyped: 0,
          totalErrors: 0,
          improvementTrend: 0,
        };
      }

      const totalTests = tests.length;
      const averageWpm = Math.round(tests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
      const bestWpm = Math.max(...tests.map((test) => test.wpm));
      const averageAccuracy = Math.round(tests.reduce((sum, test) => sum + test.accuracy, 0) / totalTests);
      const bestAccuracy = Math.max(...tests.map((test) => test.accuracy));
      const totalTimeTyped = tests.reduce((sum, test) => sum + test.duration, 0);
      const totalCharactersTyped = tests.reduce((sum, test) => sum + test.characters_typed, 0);
      const totalErrors = tests.reduce((sum, test) => sum + test.errors, 0);

      // Calculate improvement trend (last 10 tests vs previous 10 tests)
      let improvementTrend = 0;
      if (totalTests >= 10) {
        const recent10 = tests.slice(0, 10); // Already ordered by date desc
        const previous10 = tests.slice(10, 20);

        if (previous10.length > 0) {
          const recentAvgWpm = recent10.reduce((sum, test) => sum + test.wpm, 0) / recent10.length;
          const previousAvgWpm = previous10.reduce((sum, test) => sum + test.wpm, 0) / previous10.length;
          improvementTrend = Math.round(((recentAvgWpm - previousAvgWpm) / previousAvgWpm) * 100);
        }
      }

      return {
        totalTests,
        averageWpm,
        bestWpm,
        averageAccuracy,
        bestAccuracy,
        totalTimeTyped,
        totalCharactersTyped,
        totalErrors,
        improvementTrend,
      };
    } catch (error) {
      console.error("Error calculating user statistics:", error);
      throw error;
    }
  }
}

export { account, databases };
