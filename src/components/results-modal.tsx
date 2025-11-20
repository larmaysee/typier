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
    if (score >= 60) return { rating: "Excellent", color: "text-primary", icon: Trophy };
    if (score >= 40) return { rating: "Good", color: "text-primary", icon: Award };
    if (score >= 25) return { rating: "Fair", color: "text-primary", icon: TrendingUp };
    return { rating: "Keep Practicing", color: "text-primary", icon: Target };
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
            <div className="p-2 rounded-full bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
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
            <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">WPM</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{result.wpm}</div>
              <div className="text-xs text-muted-foreground">Words Per Minute</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{result.accuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Typing Precision</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Correct</div>
              <div className="text-xl font-bold text-foreground">{result.correctWords}</div>
              <div className="text-xs text-muted-foreground">words</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Errors</div>
              <div className="text-xl font-bold text-foreground">{result.errors}</div>
              <div className="text-xs text-muted-foreground">mistakes</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">Time</span>
              </div>
              <div className="text-xl font-bold text-foreground">{result.testDuration}s</div>
              <div className="text-xs text-muted-foreground">duration</div>
            </div>

            <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Chars</div>
              <div className="text-xl font-bold text-foreground">{result.charactersTyped}</div>
              <div className="text-xs text-muted-foreground">typed</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Words:</span>
                  <span className="font-semibold">{result.totalWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incorrect Words:</span>
                  <span className="font-semibold">{result.incorrectWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-semibold capitalize">{result.language}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-semibold">{safeSuccessRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chars per Min:</span>
                  <span className="font-semibold">{safeCharsPerMin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span className="font-semibold">{safeErrorRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <DialogFooter className="pt-6">
          <div className="flex gap-3 w-full">
            <Button onClick={onClose} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handleStartNewTest} className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
