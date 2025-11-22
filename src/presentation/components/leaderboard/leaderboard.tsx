"use client";

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LanguageCode } from "@/domain/enums/languages";
import { useLeaderboard } from "@/presentation/hooks/leaderboard/use-leaderboard";
import { Award, Calendar, Crown, Globe, Medal, RefreshCw, Target, TrendingUp, Trophy, User, Zap } from "lucide-react";

const TIME_OPTIONS = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 120, label: "2m" },
];

const TIME_FRAME_OPTIONS = [
  { value: "all", label: "All Time", icon: Globe },
  { value: "day", label: "Daily", icon: Calendar },
  { value: "week", label: "Weekly", icon: TrendingUp },
];

const LANGUAGE_OPTIONS = [
  { value: LanguageCode.LI, label: "Lisu", flag: "🗻" },
  { value: LanguageCode.EN, label: "English", flag: "🇬🇧" },
  { value: LanguageCode.MY, label: "Myanmar", flag: "🇲🇲" },
];

export function Leaderboard() {
  const { user } = useAuth();
  const { leaderboard, isLoading, error, filters, updateFilters, refresh } = useLeaderboard();

  const handleTimeFrameChange = (value: string) => {
    const timeFrame = value as "day" | "week" | "all";
    updateFilters({ timeFrame });
  };

  const handleLanguageChange = (value: string) => {
    updateFilters({ language: value as LanguageCode });
  };

  const handleDurationChange = (value: string) => {
    updateFilters({ duration: parseInt(value) });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Crown className="h-5 w-5 text-yellow-500" />;
    }
    if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    }
    if (rank === 3) {
      return <Medal className="h-5 w-5 text-amber-600" />;
    }
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "border-yellow-500/50 bg-yellow-500/5";
    if (rank === 2) return "border-gray-400/50 bg-gray-400/5";
    if (rank === 3) return "border-amber-600/50 bg-amber-600/5";
    if (rank <= 10) return "border-blue-500/30 bg-blue-500/5";
    return "border-muted";
  };

  const formatWPM = (wpm: number) => {
    return Math.round(wpm);
  };

  const formatAccuracy = (accuracy: number) => {
    return `${Math.round(accuracy)}%`;
  };

  const getPerformanceLevel = (wpm: number) => {
    if (wpm >= 100) return { label: "Master", color: "text-purple-600 dark:text-purple-400" };
    if (wpm >= 70) return { label: "Expert", color: "text-blue-600 dark:text-blue-400" };
    if (wpm >= 50) return { label: "Advanced", color: "text-green-600 dark:text-green-400" };
    if (wpm >= 30) return { label: "Intermediate", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Beginner", color: "text-gray-600 dark:text-gray-400" };
  };

  const currentUserRank = leaderboard.findIndex((entry) => entry.userId === user?.id) + 1;

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Global Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Compete with typists worldwide</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Select value={filters.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isLoading}
            className="w-8 h-8 p-0 rounded-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters - Button Group Design */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Time Frame Button Group */}
        <ButtonGroup>
          {TIME_FRAME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filters.timeFrame === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeFrameChange(option.value)}
            >
              <option.icon className="h-3 w-3" />
              {option.label}
            </Button>
          ))}
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Duration Button Group */}
        <ButtonGroup>
          {TIME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filters.duration === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleDurationChange(option.value.toString())}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Current User Rank (if logged in and ranked) */}
      {user && currentUserRank > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Your Rank</p>
                  <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Best WPM</p>
                <p className="text-xl font-semibold">{formatWPM(leaderboard[currentUserRank - 1]?.bestWPM || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-dashed animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard List */}
      {!isLoading && !error && leaderboard.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
            <p className="text-muted-foreground">Be the first to complete a test and claim the top spot!</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && leaderboard.length > 0 && (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.userId === user?.id;
            const performanceLevel = getPerformanceLevel(entry.bestWPM);

            return (
              <Card
                key={entry.userId}
                className={`transition-all hover:shadow-md ${getRankColor(entry.rank)} ${
                  isCurrentUser ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {getRankBadge(entry.rank)}
                      </div>

                      <Separator orientation="vertical" className="h-12" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {entry.displayName}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                You
                              </Badge>
                            )}
                          </p>
                          {entry.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${performanceLevel.color}`}>
                            {performanceLevel.label}
                          </span>
                          <span className="text-xs text-muted-foreground">• {entry.totalTests} tests</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Zap className="h-4 w-4" />
                          <span className="text-2xl font-bold">{formatWPM(entry.bestWPM)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">WPM</p>
                      </div>

                      <Separator orientation="vertical" className="h-12" />

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Target className="h-4 w-4" />
                          <span className="text-2xl font-bold">{formatAccuracy(entry.averageAccuracy)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>

                      <Separator orientation="vertical" className="h-12" />

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Award className="h-4 w-4" />
                          <span className="text-2xl font-bold">{Math.round(entry.score)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      {!isLoading && leaderboard.length > 0 && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              Rankings are updated in real-time. Score is calculated as: WPM × (Accuracy/100)²
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
