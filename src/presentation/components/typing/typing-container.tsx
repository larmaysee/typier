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
    setActiveChar: () => { }, // TODO: Implement properly
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
      import {useTypingSession} from "@/presentation/hooks/typing/use-typing-session";
      import {useSessionControls} from "@/presentation/hooks/typing/use-session-controls";
      import {TypingDisplay} from "./typing-display/typing-display";
      import {TypingControls} from "./typing-controls/typing-controls";
      import {TypingStats} from "./typing-stats/typing-stats";
      import {ErrorBoundary} from "./error-boundary";
      import {LoadingSpinner} from "./loading-spinner";
      import {ResultsModal} from "@/components/results-modal";
      import {FocusOverlay} from "@/components/focus-overlay";

      export function TypingContainer() {
  return (
      <ErrorBoundary>
        <TypingContainerInner />
      </ErrorBoundary>
      );
}

      function TypingContainerInner() {
  const {
        session,
        textContent,
        isFocused,
        testCompleted,
        showResults,
        lastTestResult,
        error,
        isLoading,
        inputRef,
        getRandomData,
        setState
      } = useTypingSession();

      const {
        handleInput,
        handleRefresh,
        handleFocus,
        handleBlur,
        handleKeyDown,
        closeResults,
        setSelectedTime
      } = useSessionControls({
        session,
        setState,
        inputRef,
        getRandomData
      });

  const handleFocusOverlayClick = () => {
    if (inputRef.current) {
        inputRef.current.focus();
    }
  };

      if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️ {error}</div>
        <button onClick={handleRefresh} className="px-4 py-2 bg-primary text-primary-foreground rounded">
          Try Again
        </button>
      </div>
      );
  }

      if (isLoading) {
    return <LoadingSpinner message="Initializing typing session..." />;
  }

      return (
      <>
        <FocusOverlay isVisible={!isFocused && !testCompleted} onClick={handleFocusOverlayClick} />

        <TypingDisplay
          textContent={textContent}
          session={session}
          isFocused={isFocused}
          testCompleted={testCompleted}
          inputRef={inputRef}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        <div className="flex justify-between mt-4">
          <TypingControls
            session={session}
            testCompleted={testCompleted}
            onRefresh={handleRefresh}
            onTimeChange={setSelectedTime}
          />

          <TypingStats session={session} />
        </div>

        {showResults && lastTestResult && (
          <ResultsModal
            isOpen={showResults}
            onClose={closeResults}
            result={lastTestResult}
            onStartNewTest={handleRefresh}
          />
        )}
      </>
      );
}