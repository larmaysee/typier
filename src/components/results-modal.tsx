"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, Clock, Keyboard, Target, TrendingUp, Trophy, X } from "lucide-react";

// Interface for modal display - only includes properties needed for display
interface TestResultDisplay {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  testDuration: number;
  language: string;
  charactersTyped: number;
  errors: number;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResultDisplay;
  onStartNewTest: () => void;
}

export function ResultsModal({ isOpen, onClose, result, onStartNewTest }: ResultsModalProps) {
  const handleStartNewTest = () => {
    onStartNewTest();
    onClose();
  };

  // Add debugging
  console.log("🎯 [ResultsModal] Received result:", result);

  const getPerformanceRating = (wpm: number, accuracy: number) => {
    const score = (wpm * accuracy) / 100;
    if (score >= 60) return { rating: "Excellent", color: "text-green-500", icon: Trophy };
    if (score >= 40) return { rating: "Good", color: "text-blue-500", icon: Award };
    if (score >= 25) return { rating: "Fair", color: "text-yellow-500", icon: TrendingUp };
    return { rating: "Keep Practicing", color: "text-orange-500", icon: Target };
  };

  const performance = getPerformanceRating(result.wpm, result.accuracy);
  const PerformanceIcon = performance.icon;

  // Safe calculations to prevent NaN
  const safeSuccessRate = result.totalWords > 0 ? ((result.correctWords / result.totalWords) * 100).toFixed(1) : "0.0";
  const safeCharsPerMin = result.testDuration > 0 ? Math.round((result.charactersTyped / result.testDuration) * 60) : 0;
  const safeErrorRate =
    result.charactersTyped > 0 ? ((result.errors / result.charactersTyped) * 100).toFixed(1) : "0.0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {/* Compact Header */}
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Test Complete!</DialogTitle>
          <div className="flex items-center justify-center gap-2">
            <PerformanceIcon className={`h-4 w-4 ${performance.color}`} />
            <DialogDescription className={`font-semibold ${performance.color}`}>{performance.rating}</DialogDescription>
          </div>
        </DialogHeader>

        {/* Compact Stats Grid */}
        <div className="space-y-6">
          {/* Primary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-200">WPM</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{result.wpm}</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Words Per Minute</div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900 dark:text-green-200">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{result.accuracy.toFixed(1)}%</div>
              <div className="text-xs text-green-700 dark:text-green-300">Typing Precision</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Correct</div>
              <div className="text-xl font-bold text-emerald-600">{result.correctWords}</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">words</div>
            </div>

            <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">Errors</div>
              <div className="text-xl font-bold text-red-600">{result.errors}</div>
              <div className="text-xs text-red-700 dark:text-red-300">mistakes</div>
            </div>

            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">Time</span>
              </div>
              <div className="text-xl font-bold text-purple-600">{result.testDuration}s</div>
              <div className="text-xs text-purple-700 dark:text-purple-300">duration</div>
            </div>

            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Chars</div>
              <div className="text-xl font-bold text-indigo-600">{result.charactersTyped}</div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300">typed</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Words:</span>
                  <span className="font-semibold">{result.totalWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Incorrect Words:</span>
                  <span className="font-semibold">{result.incorrectWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Language:</span>
                  <span className="font-semibold capitalize">{result.language}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Success Rate:</span>
                  <span className="font-semibold">{safeSuccessRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Chars per Min:</span>
                  <span className="font-semibold">{safeCharsPerMin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Error Rate:</span>
                  <span className="font-semibold">{safeErrorRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <DialogFooter className="pt-6">
          <div className="flex gap-3 w-full">
            <Button onClick={onClose} variant="outline" className="flex-1 hover:bg-muted/80">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={handleStartNewTest}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Trophy className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
