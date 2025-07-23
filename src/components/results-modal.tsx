"use client";

import { Button } from "@/components/ui/button";
import { X, Trophy, Target, Clock, Keyboard } from "lucide-react";

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
  if (!isOpen) return null;

  const handleStartNewTest = () => {
    onStartNewTest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
            <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Test Completed!</h2>
          <p className="text-muted-foreground mt-1">Great job on your typing test</p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-2">
              <Keyboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {result.wpm}
            </div>
            <div className="text-sm text-muted-foreground">WPM</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full mb-2">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.accuracy}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {result.correctWords}
            </div>
            <div className="text-sm text-muted-foreground">Correct Words</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-2">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {result.testDuration}s
            </div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Words:</span>
              <span className="font-medium">{result.totalWords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Errors:</span>
              <span className="font-medium text-red-600 dark:text-red-400">{result.errors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Characters:</span>
              <span className="font-medium">{result.charactersTyped}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <span className="font-medium uppercase">{result.language}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button 
            onClick={handleStartNewTest}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Start New Test
          </Button>
        </div>
      </div>
    </div>
  );
}