import { 
  ITypingRepository, 
  TestFilters, 
  LeaderboardFilters, 
  LeaderboardEntry 
} from "@/domain/interfaces";
import { TypingTest } from "@/domain/entities";
import { AppwriteTypingRepository } from "../appwrite/appwrite-typing.repository";
import { LocalTypingRepository } from "../local-storage/local-typing.repository";
import type { ILogger } from "@/shared/utils/logger";

interface QueuedOperation {
  id: string;
  type: 'save' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export class HybridTypingRepository implements ITypingRepository {
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAY_MS = 5000;

  constructor(
    private appwriteRepository: AppwriteTypingRepository,
    private localRepository: LocalTypingRepository,
    private logger: ILogger,
    private storage: { getItem: (key: string) => Promise<any>; setItem: (key: string, value: any) => Promise<void> }
  ) {
    // Start background sync process
    this.startBackgroundSync();
  }

  async save(test: TypingTest): Promise<void> {
    // Always save to localStorage first for immediate access
    await this.localRepository.save(test);

    // Try to save to Appwrite, but don't fail if offline
    try {
      if (test.mode !== 'practice') {
        await this.appwriteRepository.save(test);
        this.logger.info(`Successfully saved test ${test.id} to both local and remote storage`);
      }
    } catch (error) {
      this.logger.warn('Failed to save to Appwrite, queuing for sync', error as Error);
      
      // Queue for retry when online (but only for non-practice modes)
      if (test.mode !== 'practice') {
        await this.queueForSync({
          id: `save_${test.id}`,
          type: 'save',
          data: test,
          timestamp: Date.now(),
          retryCount: 0
        });
      }
    }
  }

  async getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]> {
    try {
      // Try Appwrite first for most recent data
      const appwriteTests = await this.appwriteRepository.getUserTests(userId, filters);
      
      // Also get local tests to ensure we have everything (including practice tests and offline tests)
      const localTests = await this.localRepository.getUserTests(userId, filters);
      
      // Merge results, preferring Appwrite data for overlapping tests
      const mergedTests = this.mergeTestResults(appwriteTests, localTests);
      
      this.logger.info(`Retrieved ${mergedTests.length} tests for user ${userId} from hybrid storage`);
      return mergedTests;
    } catch (error) {
      this.logger.warn('Appwrite unavailable, using local storage only', error as Error);
      
      // Fallback to localStorage only
      return await this.localRepository.getUserTests(userId, filters);
    }
  }

  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    try {
      // Try Appwrite first for global leaderboard
      return await this.appwriteRepository.getLeaderboard(filters);
    } catch (error) {
      this.logger.warn('Appwrite unavailable, using local leaderboard', error as Error);
      
      // Fallback to local leaderboard (will be limited to this device's data)
      return await this.localRepository.getLeaderboard(filters);
    }
  }

  async getCompetitionEntries(competitionId: string): Promise<TypingTest[]> {
    try {
      // Competition entries should always come from Appwrite for consistency
      return await this.appwriteRepository.getCompetitionEntries(competitionId);
    } catch (error) {
      this.logger.warn('Appwrite unavailable, using local competition entries', error as Error);
      
      // Fallback to local storage
      return await this.localRepository.getCompetitionEntries(competitionId);
    }
  }

  async bulkSave(tests: TypingTest[]): Promise<void> {
    // Save to local storage first
    await this.localRepository.bulkSave(tests);

    // Try to save to Appwrite
    const nonPracticeTests = tests.filter(test => test.mode !== 'practice');
    
    if (nonPracticeTests.length > 0) {
      try {
        await this.appwriteRepository.bulkSave(nonPracticeTests);
        this.logger.info(`Bulk saved ${tests.length} tests to hybrid storage`);
      } catch (error) {
        this.logger.warn('Failed to bulk save to Appwrite, queuing for sync', error as Error);
        
        // Queue each test for individual sync
        for (const test of nonPracticeTests) {
          await this.queueForSync({
            id: `save_${test.id}`,
            type: 'save',
            data: test,
            timestamp: Date.now(),
            retryCount: 0
          });
        }
      }
    }
  }

  async deleteUserTest(userId: string, testId: string): Promise<void> {
    // Delete from local storage first
    await this.localRepository.deleteUserTest(userId, testId);

    // Try to delete from Appwrite
    try {
      await this.appwriteRepository.deleteUserTest(userId, testId);
      this.logger.info(`Deleted test ${testId} from hybrid storage`);
    } catch (error) {
      this.logger.warn('Failed to delete from Appwrite, queuing for sync', error as Error);
      
      // Queue for sync
      await this.queueForSync({
        id: `delete_${testId}`,
        type: 'delete',
        data: { userId, testId },
        timestamp: Date.now(),
        retryCount: 0
      });
    }
  }

  private mergeTestResults(appwriteTests: TypingTest[], localTests: TypingTest[]): TypingTest[] {
    const testMap = new Map<string, TypingTest>();

    // Add local tests first
    for (const test of localTests) {
      testMap.set(test.id, test);
    }

    // Override with Appwrite tests (more authoritative)
    for (const test of appwriteTests) {
      testMap.set(test.id, test);
    }

    // Convert back to array and sort by timestamp
    const mergedTests = Array.from(testMap.values());
    mergedTests.sort((a, b) => b.timestamp - a.timestamp);
    
    return mergedTests;
  }

  private async queueForSync(operation: QueuedOperation): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      
      // Remove existing operation with same ID to avoid duplicates
      const filteredQueue = queue.filter(op => op.id !== operation.id);
      filteredQueue.push(operation);
      
      await this.storage.setItem(this.SYNC_QUEUE_KEY, filteredQueue);
      this.logger.debug(`Queued operation for sync: ${operation.id}`);
    } catch (error) {
      this.logger.error('Failed to queue operation for sync', error as Error);
    }
  }

  private async getSyncQueue(): Promise<QueuedOperation[]> {
    try {
      return await this.storage.getItem(this.SYNC_QUEUE_KEY) || [];
    } catch {
      return [];
    }
  }

  private startBackgroundSync(): void {
    // Run sync every 30 seconds
    setInterval(async () => {
      await this.processSyncQueue();
    }, 30000);

    // Also run sync immediately
    setTimeout(async () => {
      await this.processSyncQueue();
    }, 5000);
  }

  private async processSyncQueue(): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      if (queue.length === 0) return;

      this.logger.info(`Processing sync queue with ${queue.length} operations`);

      const successfulOperations: string[] = [];
      const failedOperations: QueuedOperation[] = [];

      for (const operation of queue) {
        try {
          await this.executeQueuedOperation(operation);
          successfulOperations.push(operation.id);
          this.logger.debug(`Successfully synced operation: ${operation.id}`);
        } catch (error) {
          this.logger.warn(`Failed to sync operation: ${operation.id}`, error as Error);
          
          // Increment retry count
          operation.retryCount++;
          
          if (operation.retryCount < this.MAX_RETRY_COUNT) {
            // Add delay for retries
            operation.timestamp = Date.now() + this.RETRY_DELAY_MS;
            failedOperations.push(operation);
          } else {
            this.logger.error(`Max retries exceeded for operation: ${operation.id}`);
            // Could implement dead letter queue here
          }
        }
      }

      // Update queue with failed operations only
      if (failedOperations.length !== queue.length) {
        await this.storage.setItem(this.SYNC_QUEUE_KEY, failedOperations);
        this.logger.info(`Sync completed: ${successfulOperations.length} successful, ${failedOperations.length} remaining`);
      }
    } catch (error) {
      this.logger.error('Error processing sync queue', error as Error);
    }
  }

  private async executeQueuedOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'save':
        await this.appwriteRepository.save(operation.data);
        break;
      case 'delete':
        await this.appwriteRepository.deleteUserTest(operation.data.userId, operation.data.testId);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Public method to manually trigger sync (useful for when connectivity is restored)
  async syncNow(): Promise<void> {
    this.logger.info('Manual sync triggered');
    await this.processSyncQueue();
  }

  // Get sync queue status for UI purposes
  async getSyncStatus(): Promise<{ pending: number; lastSync: number }> {
    const queue = await this.getSyncQueue();
    return {
      pending: queue.length,
      lastSync: Math.min(...queue.map(op => op.timestamp))
    };
  }
}