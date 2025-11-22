"use client";

import { PerformanceChart } from "@/components/performance-chart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, CheckCircle2, Clock, Languages, Target, TrendingUp, Trophy, XCircle } from "lucide-react";
import { Badge } from "./ui/badge";

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
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent
        className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden outline-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 w-10 h-10">
              <PerformanceIcon className={`h-6 w-6 ${performance.color}`} />
            </div>{" "}
            <span>Results</span>
            <Badge className="ml-2 bg-primary/10 text-primary font-semibold hover:bg-primary/20">
              {performance.rating}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Performance Graph */}
        <div className="mb-4">
          <PerformanceChart
            wpm={result.wpm}
            accuracy={result.accuracy}
            correctWords={result.correctWords}
            incorrectWords={result.incorrectWords}
            testDuration={result.testDuration}
          />
        </div>

        {/* Detailed Stats */}
        <div className="space-y-4">
          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-2 border border-dashed px-4 py-2 rounded-lg bg-muted/30">
            <div className="text-center px-4 flex gap-4 items-center border-r border-dashed">
              <div className="flex items-center justify-center w-10 h-10 bg-muted/50 rounded-full">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col justify-center items-start">
                <span className="text-xs font-semibold text-muted-foreground">Time</span>
                <div className="text-lg font-bold text-foreground">{result.testDuration}s</div>
              </div>
            </div>

            <div className="px-4 flex gap-4 items-center border-r border-dashed ">
              <div className="p-2 rounded-full bg-primary/10">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Total Words</div>
                <div className="font-semibold">{result.totalWords}</div>
              </div>
            </div>

            <div className="px-4 flex gap-4 items-center border-r border-dashed">
              <div className="p-2 rounded-full bg-purple-500/10">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground line-clamp-1">Characters Typed</div>
                <div className="font-semibold">{result.charactersTyped}</div>
              </div>
            </div>

            <div className="px-4 flex gap-4 items-center">
              <div className="p-2 rounded-full bg-amber-500/10">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">CPM</div>
                <div className="font-semibold">{safeCharsPerMin}</div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Languages className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Language</div>
                  <div className="font-semibold capitalize">{result.language}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
                <div className="p-2 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                  <div className="font-semibold">{safeSuccessRate}%</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
                <div className="p-2 rounded-full bg-red-500/10">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Incorrect Words</div>
                  <div className="font-semibold">{result.incorrectWords}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Target className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                  <div className="font-semibold">{safeErrorRate}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <DialogFooter className="pt-4">
          <Button onClick={handleStartNewTest} className="" tabIndex={-1}>
            <Trophy className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
