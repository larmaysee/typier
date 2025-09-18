"use client";

import { Button } from "@/components/ui/button";
import { X, Trophy, Target, Clock, Keyboard } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleStartNewTest = () => {
    onStartNewTest();
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
            <h2 className="text-2xl font-bold">Test Complete!</h2>
          </div>
          <p className="text-muted-foreground">Great job on completing the typing test</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Stats */}
          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Keyboard className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">WPM</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{result.wpm}</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                </div>
                <div className="text-3xl font-bold text-green-500">{result.accuracy}%</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-3 bg-muted/30 rounded">
                <div className="font-medium text-muted-foreground">Correct</div>
                <div className="text-lg font-semibold text-green-600">{result.correctWords}</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded">
                <div className="font-medium text-muted-foreground">Incorrect</div>
                <div className="text-lg font-semibold text-red-500">{result.incorrectWords}</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-medium text-muted-foreground">Time</span>
                </div>
                <div className="text-lg font-semibold">{result.testDuration}s</div>
              </div>
            </div>
          </div>

          {/* Right Column - Performance Chart */}
          <div className="flex items-center justify-center">
            <PerformanceChart 
              wpm={result.wpm}
              accuracy={result.accuracy}
              correctWords={result.correctWords}
              incorrectWords={result.incorrectWords}
              testDuration={result.testDuration}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="min-w-[120px]"
          >
            Close
          </Button>
          <Button 
            onClick={handleStartNewTest} 
            className="min-w-[120px]"
          >
            New Test
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}