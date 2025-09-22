"use client";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { TypingDatabaseService, TypingTestDocument } from "@/lib/appwrite";
import { LanguageCode } from "@/enums/site-config";

export interface TypingTestResult {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  testDuration: number; // in seconds
  language: string;
  timestamp: number;
  charactersTyped: number;
  errors: number;
}

export interface TypingStatistics {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeTyped: number; // in seconds
  totalCharactersTyped: number;
  totalErrors: number;
  recentTests: TypingTestResult[];
  improvementTrend: number; // percentage improvement over last 10 tests
}

interface TypingStatisticsContextProps {
  statistics: TypingStatistics;
  addTestResult: (result: Omit<TypingTestResult, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  getStatistics: () => TypingStatistics;
  clearStatistics: () => Promise<void>;
  getTestHistory: (limit?: number) => Promise<TypingTestResult[]>;
  syncWithDatabase: () => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
}

const TypingStatisticsContext = createContext<TypingStatisticsContextProps | undefined>(undefined);

const STORAGE_KEY = 'typoria_typing_statistics';
const PENDING_SYNC_KEY = 'typoria_pending_sync';
const DEFAULT_USER_ID = 'anonymous_user';

// Utility functions for local storage
const getStoredData = (): TypingTestResult[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveToStorage = (data: TypingTestResult[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getPendingSyncData = (): TypingTestResult[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading pending sync data:', error);
    return [];
  }
};

const savePendingSyncData = (data: TypingTestResult[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving pending sync data:', error);
  }
};

const clearPendingSyncData = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch (error) {
    console.error('Error clearing pending sync data:', error);
  }
};

// Convert database document to frontend format
const dbDocumentToTypingTestResult = (doc: TypingTestDocument): TypingTestResult => ({
  id: doc.$id,
  userId: doc.user_id,
  wpm: doc.wpm,
  accuracy: doc.accuracy,
  correctWords: doc.correct_words,
  incorrectWords: doc.incorrect_words,
  totalWords: doc.total_words,
  testDuration: doc.duration,
  language: doc.language,
  timestamp: new Date(doc.test_date).getTime(),
  charactersTyped: doc.characters_typed,
  errors: doc.errors
});

const calculateStatistics = (tests: TypingTestResult[]): TypingStatistics => {
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
      recentTests: [],
      improvementTrend: 0,
    };
  }

  const totalTests = tests.length;
  const averageWpm = Math.round(tests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
  const bestWpm = Math.max(...tests.map(test => test.wpm));
  const averageAccuracy = Math.round(tests.reduce((sum, test) => sum + test.accuracy, 0) / totalTests);
  const bestAccuracy = Math.max(...tests.map(test => test.accuracy));
  const totalTimeTyped = tests.reduce((sum, test) => sum + test.testDuration, 0);
  const totalCharactersTyped = tests.reduce((sum, test) => sum + test.charactersTyped, 0);
  const totalErrors = tests.reduce((sum, test) => sum + test.errors, 0);

  // Calculate improvement trend (last 10 tests vs previous 10 tests)
  let improvementTrend = 0;
  if (totalTests >= 10) {
    const recent10 = tests.slice(-10);
    const previous10 = tests.slice(-20, -10);

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
    recentTests: tests.slice(-10).reverse(), // Last 10 tests, most recent first
    improvementTrend,
  };
};

export const TypingStatisticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<TypingStatistics>({
    totalTests: 0,
    averageWpm: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    totalTimeTyped: 0,
    totalCharactersTyped: 0,
    totalErrors: 0,
    recentTests: [],
    improvementTrend: 0,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const getCurrentUserId = useCallback(() => user?.id || DEFAULT_USER_ID, [user]);

  const getUserTests = useCallback((allTests: TypingTestResult[]) => {
    const userId = getCurrentUserId();
    return allTests.filter(test => test.userId === userId);
  }, [getCurrentUserId]);

  // Check if Appwrite is available and user is authenticated
  const canUseDatabase = useCallback(() => {
    return user && process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  }, [user]);

  const updateStatistics = useCallback(async () => {
    try {
      if (canUseDatabase()) {
        // Try to get statistics from database
        const dbStats = await TypingDatabaseService.getUserStatistics(getCurrentUserId());
        const dbTests = await TypingDatabaseService.getUserTypingTests(getCurrentUserId(), 10);

        setStatistics({
          ...dbStats,
          recentTests: dbTests.map(dbDocumentToTypingTestResult)
        });
      } else {
        // Fallback to localStorage
        const allTests = getStoredData();
        const userTests = getUserTests(allTests);
        const newStats = calculateStatistics(userTests);
        setStatistics(newStats);
      }
    } catch (error) {
      console.error('Error updating statistics from database, falling back to localStorage:', error);
      // Fallback to localStorage on error
      const allTests = getStoredData();
      const userTests = getUserTests(allTests);
      const newStats = calculateStatistics(userTests);
      setStatistics(newStats);
      setIsOnline(false);
    }
  }, [getUserTests, getCurrentUserId, canUseDatabase]);

  // Sync pending data when user comes online or authenticates
  const syncWithDatabase = useCallback(async () => {
    if (!canUseDatabase() || isSyncing) return;

    setIsSyncing(true);
    try {
      const pendingTests = getPendingSyncData();

      if (pendingTests.length > 0) {
        const currentUserId = getCurrentUserId();

        // Sync each pending test
        for (const test of pendingTests) {
          try {
            // Convert language string to LanguageCode enum
            let languageCode: LanguageCode;
            switch (test.language) {
              case 'english': languageCode = LanguageCode.EN; break;
              case 'lisu': languageCode = LanguageCode.LI; break;
              case 'myanmar': languageCode = LanguageCode.MY; break;
              default: languageCode = LanguageCode.EN; break;
            }

            await TypingDatabaseService.createTypingTest({
              userId: currentUserId,
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

            // Update leaderboard if this is a personal best
            const userStats = await TypingDatabaseService.getUserStatistics(currentUserId);
            if (test.wpm >= userStats.bestWpm) {
              await TypingDatabaseService.updateLeaderboard(
                currentUserId,
                user?.name || 'Anonymous',
                test.wpm,
                languageCode,
                test.testDuration
              );
            }
          } catch (syncError) {
            console.error('Error syncing individual test:', syncError);
          }
        }

        // Clear pending data after successful sync
        clearPendingSyncData();

        // Remove synced data from localStorage
        const allTests = getStoredData();
        const otherUserTests = allTests.filter(test => test.userId !== currentUserId);
        saveToStorage(otherUserTests);
      }

      setIsOnline(true);
      await updateStatistics();
    } catch (error) {
      console.error('Error syncing with database:', error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  }, [canUseDatabase, getCurrentUserId, updateStatistics, user, isSyncing]);

  useEffect(() => {
    updateStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user changes, not the function itself

  useEffect(() => {
    // Sync when user authenticates or comes online
    if (canUseDatabase()) {
      syncWithDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user changes for authentication status

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncWithDatabase();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWithDatabase]);

  const addTestResult = async (result: Omit<TypingTestResult, 'id' | 'userId' | 'timestamp'>) => {
    const newResult: TypingTestResult = {
      ...result,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
    };

    try {
      if (canUseDatabase() && isOnline) {
        // Save directly to database
        const currentUserId = getCurrentUserId();

        // Convert language string to LanguageCode enum
        let languageCode: LanguageCode;
        switch (result.language) {
          case 'english': languageCode = LanguageCode.EN; break;
          case 'lisu': languageCode = LanguageCode.LI; break;
          case 'myanmar': languageCode = LanguageCode.MY; break;
          default: languageCode = LanguageCode.EN; break;
        }

        await TypingDatabaseService.createTypingTest({
          userId: currentUserId,
          wpm: result.wpm,
          accuracy: result.accuracy,
          correctWords: result.correctWords,
          incorrectWords: result.incorrectWords,
          totalWords: result.totalWords,
          duration: result.testDuration,
          language: languageCode,
          charactersTyped: result.charactersTyped,
          errors: result.errors
        });

        // Update leaderboard if this is a personal best
        const userStats = await TypingDatabaseService.getUserStatistics(currentUserId);
        if (result.wpm >= userStats.bestWpm) {
          await TypingDatabaseService.updateLeaderboard(
            currentUserId,
            user?.name || 'Anonymous',
            result.wpm,
            languageCode,
            result.testDuration
          );
        }

        await updateStatistics();
      } else {
        // Save to localStorage and pending sync
        const allTests = getStoredData();
        const updatedTests = [...allTests, newResult];
        saveToStorage(updatedTests);

        // Add to pending sync if user exists but offline
        if (user && !isOnline) {
          const pendingTests = getPendingSyncData();
          savePendingSyncData([...pendingTests, newResult]);
        }

        // Update local statistics
        const currentUserId = getCurrentUserId();
        const userTests = updatedTests.filter(test => test.userId === currentUserId);
        const newStats = calculateStatistics(userTests);
        setStatistics(newStats);
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const updatedTests = [...allTests, newResult];
      saveToStorage(updatedTests);
      updateStatistics();
    }
  };

  const getStatistics = (): TypingStatistics => {
    return statistics;
  };

  const clearStatistics = async () => {
    try {
      if (canUseDatabase() && isOnline) {
        await TypingDatabaseService.deleteUserTypingTests(getCurrentUserId());
        await updateStatistics();
      } else {
        // Clear from localStorage
        const allTests = getStoredData();
        const currentUserId = getCurrentUserId();
        const otherUserTests = allTests.filter(test => test.userId !== currentUserId);
        saveToStorage(otherUserTests);

        // Clear pending sync data for this user
        const pendingTests = getPendingSyncData();
        const otherUserPendingTests = pendingTests.filter(test => test.userId !== currentUserId);
        savePendingSyncData(otherUserPendingTests);

        updateStatistics();
      }
    } catch (error) {
      console.error('Error clearing statistics:', error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const currentUserId = getCurrentUserId();
      const otherUserTests = allTests.filter(test => test.userId !== currentUserId);
      saveToStorage(otherUserTests);
      updateStatistics();
    }
  };

  const getTestHistory = async (limit?: number): Promise<TypingTestResult[]> => {
    try {
      if (canUseDatabase() && isOnline) {
        const dbTests = await TypingDatabaseService.getUserTypingTests(getCurrentUserId(), limit);
        return dbTests.map(dbDocumentToTypingTestResult);
      } else {
        // Fallback to localStorage
        const allTests = getStoredData();
        const userTests = getUserTests(allTests);
        const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
        return limit ? sortedTests.slice(0, limit) : sortedTests;
      }
    } catch (error) {
      console.error('Error getting test history:', error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const userTests = getUserTests(allTests);
      const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
      return limit ? sortedTests.slice(0, limit) : sortedTests;
    }
  };

  return (
    <TypingStatisticsContext.Provider
      value={{
        statistics,
        addTestResult,
        getStatistics,
        clearStatistics,
        getTestHistory,
        syncWithDatabase,
        isOnline,
        isSyncing,
      }}
    >
      {children}
    </TypingStatisticsContext.Provider>
  );
};

export const useTypingStatistics = (): TypingStatisticsContextProps => {
  const context = useContext(TypingStatisticsContext);
  if (!context) {
    throw new Error('useTypingStatistics must be used within a TypingStatisticsProvider');
  }
  return context;
};