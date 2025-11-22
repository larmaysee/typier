"use client";
import {
  Activity,
  Award,
  Brain,
  Calendar,
  Clock,
  Cloud,
  Crown,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import TooltipWrapper from "./tooltip-wrapper";
import { TypingTestResult, useTypingStatistics } from "./typing-statistics";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  iconColor?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  iconColor = "text-primary",
  bgColor = "bg-primary/10",
}) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200 bg-muted/10 px-2 py-2 border border-dashed rounded-xl">
      <div className="flex flex-row items-center gap-2">
        <div className={`p-2.5 rounded-md ${bgColor} ${iconColor}`}>{icon}</div>
        <div>
          <div className="text-md font-bold flex items-baseline gap-1">
            {value}
            {trend !== undefined && trend !== 0 && (
              <div
                className={`flex items-center text-xs ml-2 ${
                  trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className="text-xs font-medium text-muted-foreground">{title}</div>
        </div>
      </div>
    </Card>
  );
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const getPerformanceLevel = (wpm: number): { level: string; color: string; icon: React.ReactNode } => {
  if (wpm >= 80)
    return { level: "Expert", color: "text-purple-600 dark:text-purple-400", icon: <Crown className="h-4 w-4" /> };
  if (wpm >= 60)
    return { level: "Advanced", color: "text-blue-600 dark:text-blue-400", icon: <Award className="h-4 w-4" /> };
  if (wpm >= 40)
    return { level: "Intermediate", color: "text-green-600 dark:text-green-400", icon: <Target className="h-4 w-4" /> };
  if (wpm >= 20)
    return { level: "Beginner", color: "text-yellow-600 dark:text-yellow-400", icon: <Activity className="h-4 w-4" /> };
  return { level: "Learning", color: "text-gray-600 dark:text-gray-400", icon: <Brain className="h-4 w-4" /> };
};

const getStreakData = (tests: TypingTestResult[]): { current: number; best: number; recent: number } => {
  if (tests.length === 0) return { current: 0, best: 0, recent: 0 };

  // Sort tests by timestamp
  const sortedTests = [...tests].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate current streak (consecutive days with tests)
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;

  // Group tests by day
  const testsByDay = new Map<string, TypingTestResult[]>();
  sortedTests.forEach((test) => {
    const day = new Date(test.timestamp).toDateString();
    if (!testsByDay.has(day)) {
      testsByDay.set(day, []);
    }
    testsByDay.get(day)!.push(test);
  });

  const uniqueDays = Array.from(testsByDay.keys()).sort();

  // Calculate streaks
  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0 || new Date(uniqueDays[i]).getTime() - new Date(uniqueDays[i - 1]).getTime() <= msPerDay + 1000) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  // Calculate current streak from today backwards
  const todayStr = today.toDateString();
  if (testsByDay.has(todayStr)) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
      const daysDiff = (new Date(uniqueDays[i + 1]).getTime() - new Date(uniqueDays[i]).getTime()) / msPerDay;
      if (daysDiff <= 1.1) {
        // Allow for small time differences
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Recent activity (last 7 days)
  const weekAgo = today.getTime() - 7 * msPerDay;
  const recentTests = tests.filter((test) => test.timestamp >= weekAgo);

  return {
    current: currentStreak,
    best: bestStreak,
    recent: recentTests.length,
  };
};

export default function StatisticsDashboard() {
  const {
    statistics,
    clearStatistics,
    getTestHistory,
    getPaginatedTestHistory,
    syncWithDatabase,
    getUnsyncedCount,
    isOnline,
    isSyncing,
  } = useTypingStatistics();
  const [recentTests, setRecentTests] = useState<TypingTestResult[]>([]);
  const [allTests, setAllTests] = useState<TypingTestResult[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTests, setTotalTests] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const loadTestData = async () => {
      setIsLoading(true);
      try {
        const all = await getTestHistory(50); // Get for streak calculation
        setAllTests(all);

        // Load paginated data
        const paginated = await getPaginatedTestHistory(currentPage, pageSize);
        setRecentTests(paginated.tests);
        setTotalTests(paginated.total);
        setHasMore(paginated.hasMore);
      } catch {
        console.error("Failed to load test data");
        setRecentTests([]);
        setAllTests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [getTestHistory, getPaginatedTestHistory, statistics.totalTests, currentPage]);

  useEffect(() => {
    // Check for unsynced tests
    const checkUnsyncedTests = () => {
      try {
        const count = getUnsyncedCount();
        setUnsyncedCount(count);
      } catch {
        setUnsyncedCount(0);
      }
    };

    checkUnsyncedTests();
    // Recheck when sync status changes or tests are updated
    const interval = setInterval(checkUnsyncedTests, 2000);
    return () => clearInterval(interval);
  }, [isSyncing, getUnsyncedCount, statistics.totalTests]);

  const handleClearStats = () => {
    if (window.confirm("Are you sure you want to clear all your typing statistics? This action cannot be undone.")) {
      clearStatistics();
    }
  };

  // Calculate enhanced metrics
  const performanceLevel = getPerformanceLevel(statistics.averageWpm);
  const streakData = getStreakData(allTests);
  const errorRate =
    statistics.totalCharactersTyped > 0 ? (statistics.totalErrors / statistics.totalCharactersTyped) * 100 : 0;

  if (statistics.totalTests === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Target className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No typing tests completed yet</h3>
        <p className="text-muted-foreground mb-6">Start typing to track your progress and unlock insights!</p>
        <Badge variant="outline" className="text-xs">
          Ready to begin your typing journey?
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-3">
            Typing Analytics
            {!isOnline && (
              <Badge variant="outline" className="text-xs">
                Offline
              </Badge>
            )}
            {isSyncing && (
              <Badge variant="secondary" className="text-xs">
                Syncing...
              </Badge>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <TooltipWrapper tooltip="Sync local data to cloud">
            <Button
              variant="outline"
              size="sm"
              onClick={syncWithDatabase}
              disabled={isSyncing || !isOnline || unsyncedCount === 0}
              className="border-dashed"
            >
              <Cloud className={`h-4 w-4 mr-2 ${isSyncing ? "animate-pulse" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync to Cloud"}
              {unsyncedCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 text-xs">
                  {unsyncedCount}
                </Badge>
              )}
            </Button>
          </TooltipWrapper>
          <TooltipWrapper tooltip="Clear all statistics">
            <Button variant="secondary" size="sm" onClick={handleClearStats} className="bg-destructive text-white">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Stats
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Speed"
          value={statistics.averageWpm}
          icon={<Zap className="h-4 w-4" />}
          trend={statistics.improvementTrend}
          iconColor="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Best Speed"
          value={statistics.bestWpm}
          icon={<Award className="h-4 w-4" />}
          iconColor="text-yellow-600 dark:text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatCard
          title="Accuracy"
          value={`${statistics.averageAccuracy}%`}
          icon={<Target className="h-4 w-4" />}
          iconColor="text-green-600 dark:text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          title="Practice Time"
          value={formatTime(statistics.totalTimeTyped)}
          icon={<Clock className="h-4 w-4" />}
          iconColor="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-500/10"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Button variant="outline" size={"sm"} className="border border-dashed">
            Current Streak - 🔥 {streakData.current} Day{streakData.current !== 1 ? "s" : ""}
          </Button>

          <div className="flex items-center gap-2 border border-dashed px-3 py-1 rounded-md">
            <div className={`flex items-center gap-1 font-normal text-sm ${performanceLevel.color}`}>
              {performanceLevel.icon}
              <span>{performanceLevel.level}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="text-xs text-muted-foreground">
              Typed Words: {formatLargeNumber(statistics.totalWordsTyped)}
            </div>

            <Separator orientation="vertical" className="h-5" />
            <div className="text-xs text-muted-foreground">
              Typed Chars: {formatLargeNumber(statistics.totalCharactersTyped)}
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="text-xs text-muted-foreground">
              Errors: {formatLargeNumber(statistics.totalErrors)} ({errorRate.toFixed(2)}%)
            </div>

            <Separator orientation="vertical" className="h-5" />
            <div className="text-xs text-muted-foreground">Taken: {statistics.totalTests}</div>
          </div>
        </div>

        {/* Recent Tests - Full Width */}
        <div className="border-none p-0">
          <div className="pb-3">
            <CardTitle className="text-base flex items-center justify-between border-b border-dashed pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                Typing History
              </div>
              <Badge variant="secondary" className="text-xs">
                {totalTests} total
              </Badge>
            </CardTitle>
          </div>
          <div className="pb-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
                <p className="text-sm">Loading tests...</p>
              </div>
            ) : recentTests.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {recentTests.map((test, index) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between px-3 py-1 bg-muted/30 rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          {(currentPage - 1) * pageSize + index + 1}.
                        </div>
                        {!test.syncedToCloud && (
                          <TooltipWrapper tooltip="Not synced to cloud yet">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                          </TooltipWrapper>
                        )}
                        {test.syncedToCloud && (
                          <TooltipWrapper tooltip="Synced to cloud">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </TooltipWrapper>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatDate(test.timestamp)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs h-5 font-normal">
                          {test.language.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs h-5 capitalize font-normal">
                          {test.textType || "words"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs h-5 capitalize font-normal ${
                            test.difficulty === "easy"
                              ? "border-green-500/50 text-green-700 dark:text-green-400"
                              : test.difficulty === "hard"
                              ? "border-red-500/50 text-red-700 dark:text-red-400"
                              : "border-yellow-500/50 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {test.difficulty || "medium"}
                        </Badge>
                        {test.practiceMode ? (
                          <Badge className="text-xs h-5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-normal">
                            Practice
                          </Badge>
                        ) : (
                          <Badge className="text-xs h-5 bg-primary/10 text-primary font-normal">Normal</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{test.wpm}</div>
                          <div className="text-xs text-muted-foreground">WPM</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{test.accuracy}%</div>
                          <div className="text-xs text-muted-foreground">ACC</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{test.testDuration}s</div>
                          <div className="text-xs text-muted-foreground">TIME</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400">{test.errors}</div>
                          <div className="text-xs text-muted-foreground">ERR</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalTests > pageSize && (
                  <div className="flex items-center justify-between pt-4 border-t border-dashed">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalTests)} of{" "}
                      {totalTests}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(totalTests / pageSize)) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={isLoading}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        {Math.ceil(totalTests / pageSize) > 5 && (
                          <span className="text-muted-foreground px-2">...</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!hasMore || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tests available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
