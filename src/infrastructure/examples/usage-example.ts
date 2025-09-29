/**
 * Example usage of the Infrastructure Layer with Repository Pattern
 * 
 * This file demonstrates how to use the implemented repository pattern
 * with offline support and automatic synchronization.
 */

import { container } from '@/infrastructure';
import type { ITypingRepository, IUserRepository, IKeyboardLayoutRepository } from '@/domain/interfaces';
import type { TypingTest, User } from '@/domain/entities';
import { LanguageCode } from '@/enums/site-config';

export class TypingService {
  private typingRepository: ITypingRepository;
  private userRepository: IUserRepository;
  private keyboardLayoutRepository: IKeyboardLayoutRepository;

  constructor() {
    // Resolve repositories from DI container
    this.typingRepository = container.resolve<ITypingRepository>('TypingRepository');
    this.userRepository = container.resolve<IUserRepository>('UserRepository');
    this.keyboardLayoutRepository = container.resolve<IKeyboardLayoutRepository>('KeyboardLayoutRepository');
  }

  /**
   * Save a typing test - works offline and syncs automatically
   */
  async saveTypingTest(test: TypingTest): Promise<void> {
    try {
      // This will:
      // 1. Always save to localStorage immediately
      // 2. Try to save to Appwrite if online
      // 3. Queue for sync if offline
      await this.typingRepository.save(test);
      console.log(`Saved typing test: ${test.id}`);
    } catch (error) {
      console.error('Failed to save typing test:', error);
      throw error;
    }
  }

  /**
   * Get user tests - tries online first, falls back to offline
   */
  async getUserTests(userId: string, language?: LanguageCode): Promise<TypingTest[]> {
    try {
      const filters = language ? { language } : undefined;
      
      // This will:
      // 1. Try to get from Appwrite first (most recent data)
      // 2. Fall back to localStorage if offline
      // 3. Merge results for hybrid approach
      const tests = await this.typingRepository.getUserTests(userId, filters);
      
      console.log(`Retrieved ${tests.length} tests for user ${userId}`);
      return tests;
    } catch (error) {
      console.error('Failed to get user tests:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard - online first, local fallback
   */
  async getLeaderboard(language?: LanguageCode): Promise<any[]> {
    try {
      const filters = {
        language,
        timeFrame: 'all' as const,
        limit: 50
      };

      // This will:
      // 1. Try to get global leaderboard from Appwrite
      // 2. Fall back to local leaderboard (limited to device data)
      const leaderboard = await this.typingRepository.getLeaderboard(filters);
      
      console.log(`Retrieved leaderboard with ${leaderboard.length} entries`);
      return leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get available keyboard layouts for a language
   */
  async getKeyboardLayouts(language: LanguageCode): Promise<any[]> {
    try {
      const layouts = await this.keyboardLayoutRepository.getAvailableLayouts(language);
      console.log(`Retrieved ${layouts.length} layouts for ${language}`);
      return layouts;
    } catch (error) {
      console.error('Failed to get keyboard layouts:', error);
      throw error;
    }
  }

  /**
   * Set user's preferred keyboard layout
   */
  async setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void> {
    try {
      await this.keyboardLayoutRepository.setUserPreferredLayout(userId, language, layoutId);
      console.log(`Set preferred layout for user ${userId}: ${layoutId}`);
    } catch (error) {
      console.error('Failed to set preferred layout:', error);
      throw error;
    }
  }

  /**
   * Save or update user preferences
   */
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      await this.userRepository.updatePreferences(userId, preferences);
      console.log(`Updated preferences for user ${userId}`);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Check sync status for offline operations (if using hybrid repository)
   */
  async getSyncStatus(): Promise<{ pending: number; lastSync: number } | null> {
    try {
      // Check if we're using the hybrid repository
      if ('getSyncStatus' in this.typingRepository) {
        return await (this.typingRepository as any).getSyncStatus();
      }
      return null;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  /**
   * Manually trigger sync (useful when connectivity is restored)
   */
  async syncNow(): Promise<void> {
    try {
      // Check if we're using the hybrid repository
      if ('syncNow' in this.typingRepository) {
        await (this.typingRepository as any).syncNow();
        console.log('Manual sync completed');
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }
}

// Example usage:
/*
const typingService = new TypingService();

// Save a typing test (works offline)
await typingService.saveTypingTest({
  id: 'test-123',
  userId: 'user-456',
  mode: 'normal',
  difficulty: 'medium',
  language: LanguageCode.EN,
  keyboardLayoutId: 'en_qwerty_us',
  textContent: 'Sample text...',
  results: {
    wpm: 65,
    accuracy: 0.95,
    // ... other results
  },
  timestamp: Date.now()
});

// Get user tests (hybrid online/offline)
const tests = await typingService.getUserTests('user-456', LanguageCode.EN);

// Get leaderboard (online first, offline fallback)
const leaderboard = await typingService.getLeaderboard(LanguageCode.EN);

// Check sync status
const syncStatus = await typingService.getSyncStatus();
if (syncStatus && syncStatus.pending > 0) {
  console.log(`${syncStatus.pending} operations pending sync`);
  
  // Manually trigger sync if needed
  await typingService.syncNow();
}
*/