"use client";
import { LanguageCode } from "@/domain";
import { TypingDatabaseService, TypingTestDocument } from "@/lib/appwrite";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

export interface TypingTestResult {
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
  textType?: string; // e.g., 'words', 'sentences', 'chars'
  difficulty?: string; // e.g., 'easy', 'medium', 'hard'
  practiceMode?: boolean;
  testMode?: string; // 'time' or 'words'
  selectedTime?: number; // Selected time duration in seconds
  selectedWords?: number; // Selected word count
  syncId?: string; // Unique ID for tracking sync status
  syncedToCloud?: boolean; // Whether this record has been synced to cloud
}

export interface TypingStatistics {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeTyped: number; // in seconds
  totalCharactersTyped: number;
  totalWordsTyped: number; // total words typed across all tests
  totalErrors: number;
  recentTests: TypingTestResult[];
  improvementTrend: number; // percentage improvement over last 10 tests
}

interface TypingStatisticsContextProps {
  statistics: TypingStatistics;
  addTestResult: (result: Omit<TypingTestResult, "id" | "userId" | "timestamp">) => Promise<void>;
  getStatistics: () => TypingStatistics;
  clearStatistics: () => Promise<void>;
  getTestHistory: (limit?: number) => Promise<TypingTestResult[]>;
  getPaginatedTestHistory: (
    page: number,
    pageSize: number
  ) => Promise<{ tests: TypingTestResult[]; total: number; hasMore: boolean }>;
  syncWithDatabase: () => Promise<void>;
  getUnsyncedCount: () => number;
  isOnline: boolean;
  isSyncing: boolean;
}

const TypingStatisticsContext = createContext<TypingStatisticsContextProps | undefined>(undefined);

const STORAGE_KEY = "typoria_typing_statistics";
const PENDING_SYNC_KEY = "typoria_pending_sync";
const DEFAULT_USER_ID = "anonymous_user";

// Utility functions for local storage
const getStoredData = (): TypingTestResult[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

const saveToStorage = (data: TypingTestResult[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const getPendingSyncData = (): TypingTestResult[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading pending sync data:", error);
    return [];
  }
};

const savePendingSyncData = (data: TypingTestResult[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving pending sync data:", error);
  }
};

const clearPendingSyncData = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch (error) {
    console.error("Error clearing pending sync data:", error);
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
  errors: doc.errors,
  textType: doc.text_type,
  difficulty: doc.difficulty,
  practiceMode: doc.practice_mode,
  testMode: doc.test_mode,
  selectedTime: doc.selected_time,
  selectedWords: doc.selected_words,
  syncId: doc.$id, // Use Appwrite document ID as sync ID
  syncedToCloud: true, // Data from DB is already synced
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
      totalWordsTyped: 0,
      totalErrors: 0,
      recentTests: [],
      improvementTrend: 0,
    };
  }

  const totalTests = tests.length;
  const averageWpm = Math.round(tests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
  const bestWpm = Math.max(...tests.map((test) => test.wpm));
  const averageAccuracy = Math.round(tests.reduce((sum, test) => sum + test.accuracy, 0) / totalTests);
  const bestAccuracy = Math.max(...tests.map((test) => test.accuracy));
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
    totalWordsTyped: tests.reduce((sum, test) => sum + test.totalWords, 0),
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
    totalWordsTyped: 0,
    totalErrors: 0,
    recentTests: [],
    improvementTrend: 0,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const getCurrentUserId = useCallback(() => user?.id || DEFAULT_USER_ID, [user]);

  const getUserTests = useCallback(
    (allTests: TypingTestResult[]) => {
      const userId = getCurrentUserId();
      return allTests.filter((test) => test.userId === userId);
    },
    [getCurrentUserId]
  );

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
          totalWordsTyped: 0, // Default value for new property
          recentTests: dbTests.map(dbDocumentToTypingTestResult),
        });
      } else {
        // Fallback to localStorage
        const allTests = getStoredData();
        const userTests = getUserTests(allTests);
        const newStats = calculateStatistics(userTests);
        setStatistics(newStats);
      }
    } catch (error) {
      console.error("Error updating statistics from database, falling back to localStorage:", error);
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
    console.log("sync with database");

    if (!canUseDatabase() || isSyncing) return;

    setIsSyncing(true);
    try {
      const pendingTests = getPendingSyncData();
      const syncedIds: string[] = [];

      if (pendingTests.length > 0) {
        const currentUserId = getCurrentUserId();

        console.log(`🔄 Syncing ${pendingTests.length} pending tests to cloud...`);

        // Sync each pending test
        for (const test of pendingTests) {
          try {
            // Convert language string to LanguageCode enum
            let languageCode: LanguageCode;
            switch (test.language) {
              case "english":
                languageCode = LanguageCode.EN;
                break;
              case "lisu":
                languageCode = LanguageCode.LI;
                break;
              case "myanmar":
                languageCode = LanguageCode.MY;
                break;
              default:
                languageCode = LanguageCode.EN;
                break;
            }

            const dbDoc = await TypingDatabaseService.createTypingTest({
              userId: currentUserId,
              wpm: test.wpm,
              accuracy: test.accuracy,
              correctWords: test.correctWords,
              incorrectWords: test.incorrectWords,
              totalWords: test.totalWords,
              duration: test.testDuration,
              language: languageCode,
              charactersTyped: test.charactersTyped,
              errors: test.errors,
              textType: test.textType,
              difficulty: test.difficulty,
              practiceMode: test.practiceMode,
              testMode: test.testMode,
              selectedTime: test.selectedTime,
              selectedWords: test.selectedWords,
            });

            // Track successfully synced test
            if (test.syncId) {
              syncedIds.push(test.syncId);
            }

            console.log("✅ Synced test:", { localSyncId: test.syncId, cloudId: dbDoc.$id });

            // Update leaderboard if this is a personal best
            const userStats = await TypingDatabaseService.getUserStatistics(currentUserId);
            if (test.wpm >= userStats.bestWpm) {
              await TypingDatabaseService.updateLeaderboard(
                currentUserId,
                user?.name || "Anonymous",
                test.wpm,
                languageCode,
                test.testDuration
              );
            }
          } catch (syncError) {
            console.error("❌ Error syncing test:", { syncId: test.syncId, error: syncError });
          }
        }

        // Clear pending data after successful sync
        clearPendingSyncData();

        // Update localStorage: mark synced records and remove guest records
        const allTests = getStoredData();
        const updatedTests = allTests
          .map((test) => {
            if (test.syncId && syncedIds.includes(test.syncId)) {
              return { ...test, syncedToCloud: true };
            }
            return test;
          })
          .filter((test) => test.userId !== currentUserId || test.syncedToCloud);

        saveToStorage(updatedTests);

        console.log(`✅ Sync complete: ${syncedIds.length}/${pendingTests.length} tests synced`);
      }

      setIsOnline(true);
      await updateStatistics();
    } catch (error) {
      console.error("Error syncing with database:", error);
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
      // Call syncWithDatabase directly without dependency
      if (canUseDatabase() && !isSyncing) {
        syncWithDatabase();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - handlers are stable

  const addTestResult = async (result: Omit<TypingTestResult, "id" | "userId" | "timestamp">) => {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newResult: TypingTestResult = {
      ...result,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      // Use provided values or fallback to defaults
      textType: result.textType || "words",
      difficulty: result.difficulty || "medium",
      practiceMode: result.practiceMode ?? false,
      testMode: result.testMode || "time",
      selectedTime: result.selectedTime,
      selectedWords: result.selectedWords,
      syncId: syncId,
      syncedToCloud: false, // Not synced yet
    };

    console.log("💾 Saving test result to storage:", {
      textType: newResult.textType,
      difficulty: newResult.difficulty,
      practiceMode: newResult.practiceMode,
      testMode: newResult.testMode,
      selectedTime: newResult.selectedTime,
      selectedWords: newResult.selectedWords,
    });

    try {
      if (canUseDatabase() && isOnline) {
        // Save directly to database
        const currentUserId = getCurrentUserId();

        // Convert language string to LanguageCode enum
        let languageCode: LanguageCode;
        switch (result.language) {
          case "english":
            languageCode = LanguageCode.EN;
            break;
          case "lisu":
            languageCode = LanguageCode.LI;
            break;
          case "myanmar":
            languageCode = LanguageCode.MY;
            break;
          default:
            languageCode = LanguageCode.EN;
            break;
        }

        const dbDoc = await TypingDatabaseService.createTypingTest({
          userId: currentUserId,
          wpm: result.wpm,
          accuracy: result.accuracy,
          correctWords: result.correctWords,
          incorrectWords: result.incorrectWords,
          totalWords: result.totalWords,
          duration: result.testDuration,
          language: languageCode,
          charactersTyped: result.charactersTyped,
          errors: result.errors,
          textType: newResult.textType,
          difficulty: newResult.difficulty,
          practiceMode: newResult.practiceMode,
          testMode: newResult.testMode,
          selectedTime: newResult.selectedTime,
          selectedWords: newResult.selectedWords,
        });

        // Mark as synced and update syncId with Appwrite document ID
        newResult.syncedToCloud = true;
        newResult.syncId = dbDoc.$id;

        // Update localStorage with synced status
        const allTests = getStoredData();
        const updatedTests = [...allTests, newResult];
        saveToStorage(updatedTests);

        console.log("✅ Test synced to cloud:", { syncId: newResult.syncId, cloudId: dbDoc.$id });

        // Update leaderboard if this is a personal best
        const userStats = await TypingDatabaseService.getUserStatistics(currentUserId);
        if (result.wpm >= userStats.bestWpm) {
          await TypingDatabaseService.updateLeaderboard(
            currentUserId,
            user?.name || "Anonymous",
            result.wpm,
            languageCode,
            result.testDuration
          );
        }

        // Update statistics in background (non-blocking)
        updateStatistics().catch((err) => console.error("Error updating statistics:", err));
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

        // Update local statistics immediately (synchronous)
        const currentUserId = getCurrentUserId();
        const userTests = updatedTests.filter((test) => test.userId === currentUserId);
        const newStats = calculateStatistics(userTests);
        setStatistics(newStats);
      }
    } catch (error) {
      console.error("Error saving test result:", error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const updatedTests = [...allTests, newResult];
      saveToStorage(updatedTests);

      // Update statistics immediately (synchronous)
      const currentUserId = getCurrentUserId();
      const userTests = updatedTests.filter((test) => test.userId === currentUserId);
      const newStats = calculateStatistics(userTests);
      setStatistics(newStats);
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
        const otherUserTests = allTests.filter((test) => test.userId !== currentUserId);
        saveToStorage(otherUserTests);

        // Clear pending sync data for this user
        const pendingTests = getPendingSyncData();
        const otherUserPendingTests = pendingTests.filter((test) => test.userId !== currentUserId);
        savePendingSyncData(otherUserPendingTests);

        updateStatistics();
      }
    } catch (error) {
      console.error("Error clearing statistics:", error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const currentUserId = getCurrentUserId();
      const otherUserTests = allTests.filter((test) => test.userId !== currentUserId);
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
      console.error("Error getting test history:", error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const userTests = getUserTests(allTests);
      const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
      return limit ? sortedTests.slice(0, limit) : sortedTests;
    }
  };

  const getUnsyncedCount = useCallback((): number => {
    const allTests = getStoredData();
    const userTests = getUserTests(allTests);
    return userTests.filter((test) => !test.syncedToCloud).length;
  }, [getUserTests]);

  const getPaginatedTestHistory = async (
    page: number,
    pageSize: number
  ): Promise<{ tests: TypingTestResult[]; total: number; hasMore: boolean }> => {
    try {
      // Always check localStorage first
      const allTests = getStoredData();
      const userTests = getUserTests(allTests);

      // If no localStorage data and user is authenticated, try cloud
      if (userTests.length === 0 && canUseDatabase() && isOnline) {
        const dbTests = await TypingDatabaseService.getUserTypingTests(getCurrentUserId(), 1000); // Get large batch
        const mappedTests = dbTests.map(dbDocumentToTypingTestResult);
        const sortedTests = mappedTests.sort((a, b) => b.timestamp - a.timestamp);

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTests = sortedTests.slice(startIndex, endIndex);

        return {
          tests: paginatedTests,
          total: sortedTests.length,
          hasMore: endIndex < sortedTests.length,
        };
      }

      // Use localStorage data
      const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTests = sortedTests.slice(startIndex, endIndex);

      return {
        tests: paginatedTests,
        total: sortedTests.length,
        hasMore: endIndex < sortedTests.length,
      };
    } catch (error) {
      console.error("Error getting paginated test history:", error);
      // Fallback to localStorage
      const allTests = getStoredData();
      const userTests = getUserTests(allTests);
      const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTests = sortedTests.slice(startIndex, endIndex);

      return {
        tests: paginatedTests,
        total: sortedTests.length,
        hasMore: endIndex < sortedTests.length,
      };
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
        getPaginatedTestHistory,
        syncWithDatabase,
        getUnsyncedCount,
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
    throw new Error("useTypingStatistics must be used within a TypingStatisticsProvider");
  }
  return context;
};
