"use client";
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
  addTestResult: (result: Omit<TypingTestResult, 'id' | 'userId' | 'timestamp'>) => void;
  getStatistics: () => TypingStatistics;
  clearStatistics: () => void;
  getTestHistory: (limit?: number) => TypingTestResult[];
}

const TypingStatisticsContext = createContext<TypingStatisticsContextProps | undefined>(undefined);

const STORAGE_KEY = 'typoria_typing_statistics';
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

  const getCurrentUserId = useCallback(() => user?.id || DEFAULT_USER_ID, [user]);

  const getUserTests = useCallback((allTests: TypingTestResult[]) => {
    const userId = getCurrentUserId();
    return allTests.filter(test => test.userId === userId);
  }, [getCurrentUserId]);

  const updateStatistics = useCallback(() => {
    const allTests = getStoredData();
    const userTests = getUserTests(allTests);
    const newStats = calculateStatistics(userTests);
    setStatistics(newStats);
  }, [getUserTests]);

  useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  const addTestResult = (result: Omit<TypingTestResult, 'id' | 'userId' | 'timestamp'>) => {
    const newResult: TypingTestResult = {
      ...result,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
    };

    const allTests = getStoredData();
    const updatedTests = [...allTests, newResult];
    saveToStorage(updatedTests);
    updateStatistics();
  };

  const getStatistics = (): TypingStatistics => {
    return statistics;
  };

  const clearStatistics = () => {
    const allTests = getStoredData();
    const userId = getCurrentUserId();
    const otherUserTests = allTests.filter(test => test.userId !== userId);
    saveToStorage(otherUserTests);
    updateStatistics();
  };

  const getTestHistory = (limit?: number): TypingTestResult[] => {
    const allTests = getStoredData();
    const userTests = getUserTests(allTests);
    const sortedTests = userTests.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sortedTests.slice(0, limit) : sortedTests;
  };

  return (
    <TypingStatisticsContext.Provider
      value={{
        statistics,
        addTestResult,
        getStatistics,
        clearStatistics,
        getTestHistory,
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