import { LanguageCode } from "@/domain";
import { TypingResults, TypingTest } from "@/domain/entities";
import { LeaderboardEntry } from "@/domain/entities/statistics";
import { ITypingRepository, LeaderboardFilters, TestFilters } from "@/domain/interfaces";
import { AppwriteTypingTestDocument, COLLECTIONS } from "@/infrastructure/persistence/appwrite/collections.config";
import { AppwriteDatabaseClient } from "@/infrastructure/persistence/appwrite/database-client";
import { NotFoundError, RepositoryError } from "@/shared/errors";
import type { ILogger } from "@/shared/utils/logger";
import { Query } from "appwrite";

export class AppwriteTypingRepository implements ITypingRepository {
  constructor(private client: AppwriteDatabaseClient, private logger: ILogger) {}

  async save(test: TypingTest): Promise<void> {
    try {
      const document = this.toAppwriteDocument(test);
      await this.client.createDocument<AppwriteTypingTestDocument>(COLLECTIONS.TYPING_TESTS, document, test.id);
      this.logger.info(`Saved typing test: ${test.id}`);
    } catch (error) {
      this.logger.error("Failed to save typing test", error as Error);
      throw new RepositoryError("Failed to save typing test", error as Error);
    }
  }

  async getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]> {
    try {
      const queries = [Query.equal("user_id", userId)];

      if (filters) {
        if (filters.mode) {
          queries.push(Query.equal("mode", filters.mode));
        }
        if (filters.language) {
          queries.push(Query.equal("language", filters.language));
        }
        if (filters.difficulty) {
          queries.push(Query.equal("difficulty", filters.difficulty));
        }
        if (filters.dateFrom) {
          queries.push(Query.greaterThanEqual("$createdAt", new Date(filters.dateFrom).toISOString()));
        }
        if (filters.dateTo) {
          queries.push(Query.lessThanEqual("$createdAt", new Date(filters.dateTo).toISOString()));
        }
      }

      // Add ordering by creation date (most recent first)
      queries.push(Query.orderDesc("$createdAt"));

      const documents = await this.client.listDocuments<AppwriteTypingTestDocument>(
        COLLECTIONS.TYPING_TESTS,
        queries,
        filters?.limit,
        filters?.offset
      );

      return documents.map((doc) => this.fromAppwriteDocument(doc));
    } catch (error) {
      this.logger.error(`Failed to get tests for user: ${userId}`, error as Error);
      throw new RepositoryError("Failed to get user tests", error as Error);
    }
  }

  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    try {
      const queries = [];

      if (filters.language) {
        queries.push(Query.equal("language", filters.language));
      }
      if (filters.mode) {
        queries.push(Query.equal("mode", filters.mode));
      }

      // Handle time frame filtering
      if (filters.timeFrame && filters.timeFrame !== "all") {
        const now = new Date();
        let dateFrom: Date;

        switch (filters.timeFrame) {
          case "day":
            dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "week":
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        if (dateFrom!) {
          queries.push(Query.greaterThanEqual("$createdAt", dateFrom.toISOString()));
        }
      }

      // Order by WPM descending
      queries.push(Query.orderDesc("wpm"));

      const documents = await this.client.listDocuments<AppwriteTypingTestDocument>(
        COLLECTIONS.TYPING_TESTS,
        queries,
        filters.limit || 100
      );

      // Group by user and take their best score
      const userBestScores = new Map<string, LeaderboardEntry>();

      for (const doc of documents) {
        const existing = userBestScores.get(doc.user_id);

        if (!existing || doc.wpm > existing.bestWPM) {
          const username = await this.getUsernameById(doc.user_id);
          userBestScores.set(
            doc.user_id,
            LeaderboardEntry.create({
              userId: doc.user_id,
              username: username,
              bestWPM: doc.wpm,
              averageAccuracy: doc.accuracy,
              language: doc.language as any,
              mode: doc.mode as any,
              rank: 1, // Will be updated when sorting
              totalTests: 1, // This is simplified - in reality we'd count all tests
              lastImproved: new Date(doc.$createdAt).getTime(),
              timestamp: new Date(doc.$createdAt).getTime(),
            })
          );
        }
      }

      // Update ranks after sorting
      const sortedEntries = Array.from(userBestScores.values())
        .sort((a, b) => b.bestWPM - a.bestWPM)
        .slice(0, filters.limit || 100)
        .map((entry, index) => entry.updateRank(index + 1));

      return sortedEntries;
    } catch (error) {
      this.logger.error("Failed to get leaderboard", error as Error);
      throw new RepositoryError("Failed to get leaderboard", error as Error);
    }
  }

  async getCompetitionEntries(competitionId: string): Promise<TypingTest[]> {
    try {
      const queries = [Query.equal("competition_id", competitionId), Query.orderDesc("wpm")];

      const documents = await this.client.listDocuments<AppwriteTypingTestDocument>(COLLECTIONS.TYPING_TESTS, queries);

      return documents.map((doc) => this.fromAppwriteDocument(doc));
    } catch (error) {
      this.logger.error(`Failed to get competition entries: ${competitionId}`, error as Error);
      throw new RepositoryError("Failed to get competition entries", error as Error);
    }
  }

  async bulkSave(tests: TypingTest[]): Promise<void> {
    try {
      // Appwrite doesn't have a bulk insert, so we'll do them sequentially
      // In a real implementation, we might want to batch them for better performance
      for (const test of tests) {
        await this.save(test);
      }
      this.logger.info(`Bulk saved ${tests.length} typing tests`);
    } catch (error) {
      this.logger.error("Failed to bulk save typing tests", error as Error);
      throw new RepositoryError("Failed to bulk save typing tests", error as Error);
    }
  }

  async deleteUserTest(userId: string, testId: string): Promise<void> {
    try {
      // First verify the test belongs to the user
      const document = await this.client.getDocument<AppwriteTypingTestDocument>(COLLECTIONS.TYPING_TESTS, testId);

      if (!document) {
        throw new NotFoundError(`Typing test not found: ${testId}`);
      }

      if (document.user_id !== userId) {
        throw new RepositoryError("User does not have permission to delete this test");
      }

      await this.client.deleteDocument(COLLECTIONS.TYPING_TESTS, testId);
      this.logger.info(`Deleted typing test: ${testId}`);
    } catch (error) {
      this.logger.error(`Failed to delete typing test: ${testId}`, error as Error);
      throw error instanceof NotFoundError || error instanceof RepositoryError
        ? error
        : new RepositoryError("Failed to delete typing test", error as Error);
    }
  }

  private toAppwriteDocument(test: TypingTest): Omit<AppwriteTypingTestDocument, "$id" | "$createdAt" | "$updatedAt"> {
    return {
      user_id: test.userId,
      mode: test.mode,
      difficulty: test.difficulty,
      language: test.language,
      keyboard_layout_id: test.keyboardLayout,
      text_content: test.textContent,
      wpm: test.results.wpm,
      accuracy: test.results.accuracy,
      correct_words: test.results.correctWords,
      incorrect_words: test.results.incorrectWords,
      total_words: test.results.totalWords,
      duration: test.results.duration,
      characters_typed: test.results.charactersTyped,
      errors: test.results.errors,
      consistency: test.results.consistency,
      finger_utilization: JSON.stringify(test.results.fingerUtilization),
      competition_id: test.competitionId,
    };
  }

  private fromAppwriteDocument(doc: AppwriteTypingTestDocument): TypingTest {
    return TypingTest.create({
      id: doc.$id,
      userId: doc.user_id,
      mode: doc.mode as any,
      difficulty: doc.difficulty as any,
      language: doc.language as LanguageCode,
      keyboardLayout: doc.keyboard_layout_id,
      textContent: doc.text_content,
      results: TypingResults.create({
        wpm: doc.wpm,
        accuracy: doc.accuracy,
        correctWords: doc.correct_words,
        incorrectWords: doc.incorrect_words,
        duration: doc.duration,
        charactersTyped: doc.characters_typed,
        correctChars: doc.characters_typed - doc.errors,
        errors: doc.errors,
        consistency: doc.consistency,
        fingerUtilization: JSON.parse(doc.finger_utilization),
      }),
      timestamp: new Date(doc.$createdAt).getTime(),
      competitionId: doc.competition_id,
    });
  }

  private async getUsernameById(userId: string): Promise<string> {
    try {
      const userDoc = await this.client.getDocument(COLLECTIONS.USERS, userId);
      return (userDoc as any)?.username || "Unknown User";
    } catch {
      return "Unknown User";
    }
  }
}
