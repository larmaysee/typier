"use client";
import React, { useState, useEffect } from "react";
import { useTypingStatistics, TypingTestResult } from "./typing-statistics";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award, Calendar, Clock, Target, Zap, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDetailModal } from "./user-detail-modal";

interface UserStats {
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTests: number;
}

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // User detail modal state
  const [selectedUser, setSelectedUser] = useState<{
    userId: string;
    username: string;
    stats?: UserStats;
  } | null>(null);

  // Leaderboard data state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setLoading(true);
      try {
        const allTests = await getTestHistory();
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
        const sortedEntries = entries.sort((a, b) => {
          switch (sortBy) {
            case 'wpm':
              return b.averageWpm - a.averageWpm;
            case 'accuracy':
              return b.averageAccuracy - a.averageAccuracy;
            default:
              return b.score - a.score;
          }
        });

        setLeaderboardData(sortedEntries);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
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

  // Pagination helper functions
  const getTotalPages = () => Math.ceil(leaderboardData.length / itemsPerPage);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return leaderboardData.slice(startIndex, endIndex);
  };

  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleUserClick = (entry: LeaderboardEntry) => {
    setSelectedUser({
      userId: entry.userId,
      username: entry.userName,
      stats: {
        bestWpm: entry.bestWpm,
        averageWpm: entry.averageWpm,
        bestAccuracy: entry.bestAccuracy,
        averageAccuracy: entry.averageAccuracy,
        totalTests: entry.totalTests
      }
    });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, sortBy]);

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
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </CardContent>
        </Card>
      ) : leaderboardData.length === 0 ? (
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
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Players
                </div>
                <Badge variant="outline" className="text-xs">
                  {leaderboardData.length} {leaderboardData.length === 1 ? 'player' : 'players'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold text-sm">Rank</th>
                      <th className="text-left p-3 font-semibold text-sm">User</th>
                      <th className="text-center p-3 font-semibold text-sm">Avg WPM</th>
                      <th className="text-center p-3 font-semibold text-sm">Best WPM</th>
                      <th className="text-center p-3 font-semibold text-sm">Accuracy</th>
                      <th className="text-center p-3 font-semibold text-sm">Tests</th>
                      <th className="text-center p-3 font-semibold text-sm">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().map((entry) => {
                      const globalRank = leaderboardData.findIndex(e => e.userId === entry.userId) + 1;
                      return (
                        <tr
                          key={entry.userId}
                          className={cn(
                            "border-b hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
                            globalRank === 1 && "bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/10 dark:to-amber-900/10",
                            globalRank === 2 && "bg-gray-50/50 dark:bg-gray-900/10",
                            globalRank === 3 && "bg-amber-50/50 dark:bg-amber-900/10"
                          )}
                          onClick={() => handleUserClick(entry)}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getRankIcon(globalRank)}
                              <Badge className={getRankBadgeColor(globalRank)} variant="outline">
                                #{globalRank}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium group-hover:text-primary transition-colors">{entry.userName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {entry.totalTests} {entry.totalTests === 1 ? 'test' : 'tests'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="font-bold text-blue-600">{entry.averageWpm}</div>
                            <div className="text-xs text-muted-foreground">avg</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="font-bold text-blue-500">{entry.bestWpm}</div>
                            <div className="text-xs text-muted-foreground">best</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="font-bold text-green-600">{entry.averageAccuracy}%</div>
                            <div className="text-xs text-muted-foreground">avg</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="font-medium">{entry.totalTests}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(entry.totalTimeTyped)}</div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="font-bold text-purple-600">{entry.score}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, leaderboardData.length)} of {leaderboardData.length} players
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, idx) => (
                        <Button
                          key={idx}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                          disabled={pageNum === '...'}
                          className="min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                      disabled={currentPage === getTotalPages()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(getTotalPages())}
                      disabled={currentPage === getTotalPages()}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Detail Modal */}
          {selectedUser && (
            <UserDetailModal
              isOpen={!!selectedUser}
              onClose={() => setSelectedUser(null)}
              userId={selectedUser.userId}
              username={selectedUser.username}
              initialStats={selectedUser.stats}
            />
          )}
        </>
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