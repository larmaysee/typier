"use client";
import React, { useState, useMemo } from "react";
import { useTypingStatistics, TypingTestResult } from "./typing-statistics";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award, Calendar, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'all';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTests: number;
  totalTimeTyped: number;
  recentTests: TypingTestResult[];
  score: number; // Combined score for ranking
}

const Leaderboard: React.FC = () => {
  const { getTestHistory } = useTypingStatistics();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'score'>('score');

  const getFilteredTests = (tests: TypingTestResult[], filter: TimeFilter): TypingTestResult[] => {
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const msInWeek = 7 * msInDay;
    const msInMonth = 30 * msInDay;

    switch (filter) {
      case 'daily':
        return tests.filter(test => now - test.timestamp <= msInDay);
      case 'weekly':
        return tests.filter(test => now - test.timestamp <= msInWeek);
      case 'monthly':
        return tests.filter(test => now - test.timestamp <= msInMonth);
      default:
        return tests;
    }
  };

  const calculateScore = (wpm: number, accuracy: number, totalTests: number): number => {
    // Weighted score: WPM (60%) + Accuracy (30%) + Consistency bonus (10%)
    const wpmScore = Math.min(wpm / 100, 1) * 60;
    const accuracyScore = (accuracy / 100) * 30;
    const consistencyBonus = Math.min(totalTests / 50, 1) * 10;
    return Math.round(wpmScore + accuracyScore + consistencyBonus);
  };

  const leaderboardData = useMemo(() => {
    const allTests = getTestHistory();
    const filteredTests = getFilteredTests(allTests, timeFilter);

    // Group tests by user
    const userGroups = filteredTests.reduce((acc, test) => {
      if (!acc[test.userId]) {
        acc[test.userId] = [];
      }
      acc[test.userId].push(test);
      return acc;
    }, {} as Record<string, TypingTestResult[]>);

    // Calculate stats for each user
    const entries: LeaderboardEntry[] = Object.entries(userGroups).map(([userId, tests]) => {
      const bestWpm = Math.max(...tests.map(t => t.wpm));
      const averageWpm = Math.round(tests.reduce((sum, t) => sum + t.wpm, 0) / tests.length);
      const bestAccuracy = Math.max(...tests.map(t => t.accuracy));
      const averageAccuracy = Math.round(tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length);
      const totalTimeTyped = tests.reduce((sum, t) => sum + t.testDuration, 0);
      const score = calculateScore(averageWpm, averageAccuracy, tests.length);

      return {
        userId,
        userName: userId === 'anonymous_user' ? 'Anonymous' : `User ${userId.slice(-6)}`,
        bestWpm,
        averageWpm,
        bestAccuracy,
        averageAccuracy,
        totalTests: tests.length,
        totalTimeTyped,
        recentTests: tests.slice(-5),
        score
      };
    });

    // Sort by selected criteria
    return entries.sort((a, b) => {
      switch (sortBy) {
        case 'wpm':
          return b.averageWpm - a.averageWpm;
        case 'accuracy':
          return b.averageAccuracy - a.averageAccuracy;
        default:
          return b.score - a.score;
      }
    });
  }, [getTestHistory, timeFilter, sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-200 text-yellow-900 border-yellow-400 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Compete with other typists and track your progress
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('daily')}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Daily
          </Button>
          <Button
            variant={timeFilter === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('weekly')}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('monthly')}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Monthly
          </Button>
          <Button
            variant={timeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('score')}
            className="flex items-center gap-1"
          >
            <Target className="h-4 w-4" />
            Score
          </Button>
          <Button
            variant={sortBy === 'wpm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('wpm')}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            WPM
          </Button>
          <Button
            variant={sortBy === 'accuracy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('accuracy')}
            className="flex items-center gap-1"
          >
            <Target className="h-4 w-4" />
            Accuracy
          </Button>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboardData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Complete some typing tests to see the leaderboard!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 100 Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-xs text-left p-4 font-semibold">Rank</th>
                    <th className="text-xs text-left p-4 font-semibold">User</th>
                    <th className="text-xs text-center p-4 font-semibold">Avg WPM</th>
                    <th className="text-xs text-center p-4 font-semibold">Best WPM</th>
                    <th className="text-xs text-center p-4 font-semibold">Avg Accuracy</th>
                    <th className="text-xs text-center p-4 font-semibold">Best Accuracy</th>
                    <th className="text-xs text-center p-4 font-semibold">Score</th>
                    <th className="text-xs text-center p-4 font-semibold">Tests</th>
                    <th className="text-xs text-center p-4 font-semibold">Time Typed</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.slice(0, 100).map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={entry.userId}
                        className={cn(
                          "border-b hover:bg-muted/30 transition-colors",
                          rank === 1 && "bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/10 dark:to-amber-900/10",
                          rank === 2 && "bg-gray-50/50 dark:bg-gray-900/10",
                          rank === 3 && "bg-amber-50/50 dark:bg-amber-900/10"
                        )}
                      >
                        <td className="p-4 text-xs">
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                            <Badge className={getRankBadgeColor(rank)} variant="outline">
                              #{rank}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-xs">
                          <div>
                            <div className="font-medium">{entry.userName}</div>
                            <div className={cn(
                              "text-sm",
                              rank <= 3 ? "text-yellow-700 dark:text-yellow-300" : "text-slate-600 dark:text-slate-400"
                            )}>
                              ID: {entry.userId.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-bold text-blue-600 text-lg">{entry.averageWpm}</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-semibold text-blue-500">{entry.bestWpm}</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-bold text-green-600 text-lg">{entry.averageAccuracy}%</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-semibold text-green-500">{entry.bestAccuracy}%</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-bold text-purple-600 text-lg">{entry.score}</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-medium">{entry.totalTests}</div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <div className="font-medium">{formatTime(entry.totalTimeTyped)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {leaderboardData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 100 Leaderboard Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(leaderboardData.slice(0, 100).reduce((sum, entry) => sum + entry.averageWpm, 0) / Math.min(leaderboardData.length, 100))}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg WPM</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(leaderboardData.slice(0, 100).reduce((sum, entry) => sum + entry.averageAccuracy, 0) / Math.min(leaderboardData.length, 100))}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {leaderboardData.slice(0, 100).reduce((sum, entry) => sum + entry.totalTests, 0)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Tests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.min(leaderboardData.length, 100)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Top Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {leaderboardData.length > 0 ? leaderboardData[0].averageWpm : 0}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Top WPM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;