"use client";

import { LeaderboardEntry } from "@/domain/entities/statistics";
import { LanguageCode } from "@/domain/enums/languages";
import { ITypingRepository, LeaderboardFilters } from "@/domain/interfaces/typing-repository";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { useCallback, useEffect, useState } from "react";

export interface LeaderboardHookFilters extends LeaderboardFilters {
  duration?: number; // 15, 30, 60, etc. in seconds
}

export function useLeaderboard() {
  const { resolve, serviceTokens } = useDependencyInjection();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<LeaderboardHookFilters>({
    timeFrame: "all",
    language: LanguageCode.LI, // Default to Lisu
    duration: 30,
    limit: 50,
  });

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Resolve repository inside the function to avoid dependency issues
      const repository = resolve<ITypingRepository>(serviceTokens.TYPING_REPOSITORY);

      // Build filters without duration (repository doesn't support it yet)
      const repoFilters: LeaderboardFilters = {
        language: filters.language,
        timeFrame: filters.timeFrame,
        limit: filters.limit,
      };

      const entries = await repository.getLeaderboard(repoFilters);

      // Client-side filtering by duration if needed
      const filteredEntries = entries;
      // Note: Duration filtering would require test duration to be part of LeaderboardEntry
      // For now, we'll display all entries and implement duration filtering when backend supports it

      setLeaderboard(filteredEntries);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const updateFilters = useCallback((newFilters: Partial<LeaderboardHookFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    filters,
    updateFilters,
    refresh,
  };
}
