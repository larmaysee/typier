"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, Keyboard, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";
import { cn } from "@/lib/utils";

interface FinalResultProps {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  testDuration: number;
  language: string;
  charactersTyped: number;
  errors: number;
  previousBestWpm?: number;
  previousBestAccuracy?: number;
}

export default function FinalResult({
  wpm,
  accuracy,
  correctWords,
  incorrectWords,
  totalWords,
  testDuration,
  language,
  charactersTyped,
  errors,
  previousBestWpm = 0,
  previousBestAccuracy = 0,
}: FinalResultProps) {
  const isPersonalBestWpm = wpm > previousBestWpm;
  const isPersonalBestAccuracy = accuracy > previousBestAccuracy;
  const wpmTrend = wpm - previousBestWpm;
  const accuracyTrend = accuracy - previousBestAccuracy;

  const getPerformanceRating = (wpm: number, accuracy: number): {
    rating: string;
    color: string;
    description: string
  } => {
    if (wpm >= 80 && accuracy >= 95) {
      return { rating: "Excellent", color: "text-green-600", description: "Outstanding performance!" };
    } else if (wpm >= 60 && accuracy >= 90) {
      return { rating: "Great", color: "text-blue-600", description: "Well done!" };
    } else if (wpm >= 40 && accuracy >= 85) {
      return { rating: "Good", color: "text-yellow-600", description: "Keep practicing!" };
    } else if (wpm >= 20 && accuracy >= 75) {
      return { rating: "Fair", color: "text-orange-600", description: "Room for improvement" };
    } else {
      return { rating: "Needs Practice", color: "text-red-600", description: "Keep going!" };
    }
  };

  const performance = getPerformanceRating(wpm, accuracy);

  return (
    <div className="space-y-6">
      {/* Header with Performance Rating */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Test Complete!</h2>
        </div>
        <Badge variant="outline" className={cn("text-lg px-4 py-2", performance.color)}>
          {performance.rating}
        </Badge>
        <p className="text-muted-foreground">{performance.description}</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <Keyboard className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">WPM</span>
                  {isPersonalBestWpm && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      NEW BEST!
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-bold text-blue-500 mb-2">{wpm}</div>
                {previousBestWpm > 0 && (
                  <div className="flex items-center justify-center text-sm">
                    {wpmTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : wpmTrend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    <span className={wpmTrend > 0 ? "text-green-600" : wpmTrend < 0 ? "text-red-600" : "text-gray-600"}>
                      {wpmTrend > 0 ? "+" : ""}{wpmTrend}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                  {isPersonalBestAccuracy && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      NEW BEST!
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-bold text-green-500 mb-2">{accuracy}%</div>
                {previousBestAccuracy > 0 && (
                  <div className="flex items-center justify-center text-sm">
                    {accuracyTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : accuracyTrend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    <span className={accuracyTrend > 0 ? "text-green-600" : accuracyTrend < 0 ? "text-red-600" : "text-gray-600"}>
                      {accuracyTrend > 0 ? "+" : ""}{accuracyTrend.toFixed(1)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Words:</span>
                  <span className="font-semibold text-green-600">{correctWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incorrect Words:</span>
                  <span className="font-semibold text-red-500">{incorrectWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Words:</span>
                  <span className="font-semibold">{totalWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-semibold">{charactersTyped}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="font-semibold text-red-500">{errors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {testDuration}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-semibold capitalize">{language}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <div className="flex items-center justify-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg text-center">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PerformanceChart
                wpm={wpm}
                accuracy={accuracy}
                correctWords={correctWords}
                incorrectWords={incorrectWords}
                testDuration={testDuration}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievement Badges */}
      {(isPersonalBestWpm || isPersonalBestAccuracy) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              New Achievements!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {isPersonalBestWpm && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                  🎉 Personal Best WPM: {wpm}
                </Badge>
              )}
              {isPersonalBestAccuracy && (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">
                  🎯 Personal Best Accuracy: {accuracy}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
