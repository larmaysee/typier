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
import { X, Trophy, Target, Clock, Keyboard, Award, TrendingUp } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";

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

  const getPerformanceRating = (wpm: number, accuracy: number) => {
    const score = (wpm * accuracy) / 100;
    if (score >= 60) return { rating: "Excellent", color: "text-green-500", icon: Trophy };
    if (score >= 40) return { rating: "Good", color: "text-blue-500", icon: Award };
    if (score >= 25) return { rating: "Fair", color: "text-yellow-500", icon: TrendingUp };
    return { rating: "Keep Practicing", color: "text-orange-500", icon: Target };
  };

  const performance = getPerformanceRating(result.wpm, result.accuracy);
  const PerformanceIcon = performance.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <DialogHeader className="text-center p-6 pb-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border/50 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Test Complete!
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PerformanceIcon className={`h-5 w-5 ${performance.color}`} />
            <DialogDescription className={`text-lg font-semibold ${performance.color} m-0`}>
              {performance.rating}
            </DialogDescription>
          </div>
          <DialogDescription className="text-muted-foreground">
            Great job on completing the typing test
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Enhanced Stats */}
            <div className="space-y-6">
              {/* Main Stats with Gradient Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center mb-3">
                    <Keyboard className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-semibold text-blue-900 dark:text-blue-200">WPM</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{result.wpm}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Words Per Minute</div>
                </div>

                <div className="relative overflow-hidden text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                    <span className="font-semibold text-green-900 dark:text-green-200">Accuracy</span>
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">{result.accuracy}%</div>
                  <div className="text-xs text-green-700 dark:text-green-300">Typing Precision</div>
                </div>
              </div>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm mb-1">Correct</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.correctWords}</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">words</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="font-semibold text-red-900 dark:text-red-200 text-sm mb-1">Incorrect</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.incorrectWords}</div>
                  <div className="text-xs text-red-700 dark:text-red-300">words</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 mr-1 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-900 dark:text-purple-200 text-sm">Time</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.testDuration}s</div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">duration</div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Characters Typed</div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{result.charactersTyped}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">Total Errors</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{result.errors}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Performance Chart with Enhancement */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-full">
                <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Overview
                </h3>
                <div className="p-6 bg-gradient-to-br from-muted/10 to-muted/30 rounded-xl border border-border/50 shadow-inner">
                  <PerformanceChart
                    wpm={result.wpm}
                    accuracy={result.accuracy}
                    correctWords={result.correctWords}
                    incorrectWords={result.incorrectWords}
                    testDuration={result.testDuration}
                  />
                </div>
              </div>

              {/* Language and Duration Info */}
              <div className="w-full p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3 text-center">Test Details</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Language:</span>
                    <span className="font-semibold capitalize text-slate-900 dark:text-slate-100">{result.language}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Duration:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{result.testDuration}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Total Words:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{result.totalWords}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <DialogFooter className="p-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="min-w-[140px] hover:bg-muted/80 transition-all duration-200 hover:scale-105 group"
            >
              <X className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Close
            </Button>
            <Button
              onClick={handleStartNewTest}
              size="lg"
              className="min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <Trophy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              New Test
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}