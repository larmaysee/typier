"use client";
import React, { useState, useEffect } from "react";
import { useTypingStatistics, TypingTestResult } from "./typing-statistics";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { BarChart3, Clock, Target, TrendingUp, Zap, RotateCcw, Calendar } from "lucide-react";
import TooltipWrapper from "./tooltip-wrapper";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''
              }`} />
            {trend > 0 ? '+' : ''}{trend}% from last 10 tests
          </div>
        )}
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
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function StatisticsDashboard() {
  const { statistics, clearStatistics, getTestHistory } = useTypingStatistics();
  const [recentTests, setRecentTests] = useState<TypingTestResult[]>([]);

  useEffect(() => {
    const loadRecentTests = async () => {
      try {
        const tests = await getTestHistory(5);
        setRecentTests(tests);
      } catch (error) {
        console.error('Failed to load recent tests:', error);
        setRecentTests([]);
      }
    };

    loadRecentTests();
  }, [getTestHistory, statistics.totalTests]); // Reload when totalTests changes

  const handleClearStats = () => {
    if (window.confirm('Are you sure you want to clear all your typing statistics? This action cannot be undone.')) {
      clearStatistics();
    }
  };

  if (statistics.totalTests === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Typing Statistics
          </CardTitle>
          <CardDescription>
            Complete a typing test to see your performance statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-slate-600 dark:text-slate-400">No typing tests completed yet</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Start typing to track your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Typing Statistics
          </h2>
          <p className="text-muted-foreground">
            Track your typing performance and improvement over time
          </p>
        </div>
        <TooltipWrapper tooltip="Clear all statistics">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearStats}
            className="text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Stats
          </Button>
        </TooltipWrapper>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average WPM"
          value={statistics.averageWpm}
          description="Words per minute"
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          trend={statistics.improvementTrend}
        />
        <StatCard
          title="Best WPM"
          value={statistics.bestWpm}
          description="Personal record"
          icon={<Target className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Average Accuracy"
          value={`${statistics.averageAccuracy}%`}
          description="Typing accuracy"
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="Total Time"
          value={formatTime(statistics.totalTimeTyped)}
          description="Time spent typing"
          icon={<Clock className="h-4 w-4 text-orange-600" />}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Overall typing performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Tests Completed</span>
              <Badge variant="secondary">{statistics.totalTests}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Best Accuracy</span>
              <Badge variant="secondary">{statistics.bestAccuracy}%</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Characters Typed</span>
              <Badge variant="secondary">{statistics.totalCharactersTyped.toLocaleString()}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Errors</span>
              <Badge variant="secondary">{statistics.totalErrors}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Error Rate</span>
              <Badge variant="secondary">
                {statistics.totalCharactersTyped > 0
                  ? ((statistics.totalErrors / statistics.totalCharactersTyped) * 100).toFixed(2)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <CardDescription>Your last 5 typing test results</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(test.timestamp)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.language.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{test.wpm}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{test.accuracy}%</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">ACC</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{test.testDuration}s</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">TIME</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No recent tests available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}