"use client";
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Calendar,
  Clock,
  Crown,
  Flame,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { PerformanceChart } from "./performance-chart";
import TooltipWrapper from "./tooltip-wrapper";
import { TypingTestResult, useTypingStatistics } from "./typing-statistics";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  variant?: "default" | "gradient" | "minimal";
  badgeColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  badgeColor,
}) => {
  const getCardClassName = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800";
      case "minimal":
        return "border-dashed hover:border-solid transition-all duration-300";
      default:
        return "hover:shadow-md transition-all duration-200";
    }
  };

  return (
    <Card className={getCardClassName()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={badgeColor ? `p-2 rounded-lg ${badgeColor}` : "p-2 rounded-lg bg-muted"}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-baseline gap-1">
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
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== undefined && trend !== 0 && <p className="text-xs text-muted-foreground mt-1">from last 10 tests</p>}
      </CardContent>
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
  const { statistics, clearStatistics, getTestHistory } = useTypingStatistics();
  const [recentTests, setRecentTests] = useState<TypingTestResult[]>([]);
  const [allTests, setAllTests] = useState<TypingTestResult[]>([]);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const recent = await getTestHistory(5);
        const all = await getTestHistory(50); // Get more for streak calculation
        setRecentTests(recent);
        setAllTests(all);
      } catch (error) {
        console.error("Failed to load test data:", error);
        setRecentTests([]);
        setAllTests([]);
      }
    };

    loadTestData();
  }, [getTestHistory, statistics.totalTests]);

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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Typing Statistics
          </CardTitle>
          <CardDescription>Complete a typing test to see your performance statistics</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Typing Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Track your typing performance and improvement over time</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 ${performanceLevel.color}`}>
              {performanceLevel.icon}
              <span className="text-sm font-medium">{performanceLevel.level} Typist</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {statistics.totalTests} tests completed
            </Badge>
          </div>
        </div>
        <TooltipWrapper tooltip="Clear all statistics">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearStats}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Stats
          </Button>
        </TooltipWrapper>
      </div>

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Speed"
          value={statistics.averageWpm}
          description="words per minute"
          icon={<Zap className="h-4 w-4" />}
          trend={statistics.improvementTrend}
          variant="gradient"
          badgeColor="bg-blue-100 dark:bg-blue-900"
        />
        <StatCard
          title="Best Speed"
          value={statistics.bestWpm}
          description="personal record"
          icon={<Award className="h-4 w-4" />}
          badgeColor="bg-green-100 dark:bg-green-900"
        />
        <StatCard
          title="Accuracy"
          value={`${statistics.averageAccuracy}%`}
          description="average precision"
          icon={<Target className="h-4 w-4" />}
          badgeColor="bg-purple-100 dark:bg-purple-900"
        />
        <StatCard
          title="Practice Time"
          value={formatTime(statistics.totalTimeTyped)}
          description="total time typed"
          icon={<Clock className="h-4 w-4" />}
          badgeColor="bg-orange-100 dark:bg-orange-900"
        />
      </div>

      {/* Activity & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak & Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Activity Streak
            </CardTitle>
            <CardDescription>Your typing consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{streakData.current}</div>
              <p className="text-sm text-muted-foreground">Current streak (days)</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold">{streakData.best}</div>
                <p className="text-xs text-muted-foreground">Best streak</p>
              </div>
              <div>
                <div className="text-xl font-semibold">{streakData.recent}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>

            {streakData.current > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-3 rounded-lg border">
                <p className="text-sm text-center">🔥 Keep the momentum going!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Performance Breakdown
            </CardTitle>
            <CardDescription>Detailed typing metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatLargeNumber(statistics.totalCharactersTyped)}
                </div>
                <p className="text-xs text-muted-foreground">Characters</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.totalWordsTyped || Math.floor(statistics.totalCharactersTyped / 5)}
                </div>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.totalErrors}</div>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{errorRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </div>
            </div>

            <Separator />

            {/* Progress indicators */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Speed Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {statistics.averageWpm} / {statistics.bestWpm} WPM
                  </span>
                </div>
                <Progress value={(statistics.averageWpm / Math.max(statistics.bestWpm, 100)) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm text-muted-foreground">{statistics.averageAccuracy}%</span>
                </div>
                <Progress value={statistics.averageAccuracy} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests & Latest Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Recent Tests
            </CardTitle>
            <CardDescription>Your latest typing sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(test.timestamp)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.language.toUpperCase()}
                      </Badge>
                      {index === 0 && (
                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">{test.wpm}</div>
                        <div className="text-xs text-muted-foreground">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600 dark:text-green-400">{test.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">ACC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600 dark:text-orange-400">{test.testDuration}s</div>
                        <div className="text-xs text-muted-foreground">TIME</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent tests available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Latest Performance
            </CardTitle>
            <CardDescription>Visual breakdown of your last test</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <PerformanceChart
                wpm={recentTests[0].wpm}
                accuracy={recentTests[0].accuracy}
                correctWords={recentTests[0].correctWords}
                incorrectWords={recentTests[0].incorrectWords}
                testDuration={recentTests[0].testDuration}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Complete a test to see performance chart</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
