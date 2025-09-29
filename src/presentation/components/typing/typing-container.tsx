"use client";

import { useState } from "react";
import { FocusOverlay } from "@/components/focus-overlay";
import { ResultsModal } from "@/components/results-modal";
import DataMode from "@/components/data-mode";

// Import our new focused components
import TypingDisplay from "./typing-display/typing-display";
import TypingControls from "./typing-controls/typing-controls";
import TypingStats from "./typing-stats/typing-stats";

// Import hooks
import { useTypingSession } from "@/presentation/hooks/use-typing-session";
import { useSessionControls } from "@/presentation/hooks/use-session-controls";

export default function TypingContainer() {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  
  // Use custom hooks
  const session = useTypingSession();
  const controls = useSessionControls(isFocused, setIsFocused, session.testCompleted);

  // Props for child components
  const typingDisplayProps = {
    currentData: session.currentData,
    typedText: session.typedText,
    cursorPosition: session.cursorPosition,
    isFocused,
    testCompleted: session.testCompleted,
    config: { difficultyMode: 'sentences', practiceMode: false }, // TODO: Get from config
    inputRef: controls.inputRef,
    textContainerRef: controls.textContainerRef,
    isStartNextWord: session.isStartNextWord,
    setTypedText: session.setTypedText,
    setStartTime: session.setStartTime,
    setCorrectWords: session.setCorrectWords,
    setIncorrectWords: session.setIncorrectWords,
    setCursorPosition: session.setCursorPosition,
    setActiveChar: () => {}, // TODO: Implement properly
    setIsStartNextWord: session.setIsStartNextWord,
    setIsFocused
  };

  const typingStatsProps = {
    correctWords: session.correctWords,
    incorrectWords: session.incorrectWords,
    timeLeft: session.timeLeft,
    calculateWPM: session.calculateWPM,
    handleRefresh: session.handleRefresh
  };

  const typingControlsProps = {
    selectedTime: session.selectedTime,
    setSelectedTime: session.setSelectedTime,
    testCompleted: session.testCompleted
  };

  return (
    <>
      {/* Difficulty Mode Selector */}
      <div className="flex justify-center mb-4">
        <DataMode />
      </div>

      <TypingDisplay {...typingDisplayProps} />
      
      <div className="flex justify-between mt-4">
        <TypingControls {...typingControlsProps} />
        <TypingStats {...typingStatsProps} />
      </div>

      {session.showResults && session.lastTestResult && (
        <ResultsModal
          isOpen={session.showResults}
          onClose={() => session.setShowResults(false)}
          result={session.lastTestResult}
          onStartNewTest={session.handleRefresh}
        />
      )}

      <FocusOverlay 
        isVisible={!isFocused && !session.testCompleted}
        onClick={controls.focusInput}
      />
    </>
  );
}