"use client";

import { FocusOverlay } from "@/components/focus-overlay";
import { ResultsModal } from "@/components/results-modal";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { ErrorBoundary } from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";
import { TypingControls } from "./typing-controls/typing-controls";
import TypingDisplay from "./typing-display/typing-display";
import TypingStats from "./typing-stats/typing-stats";
import ModernKeyboard from "@/components/modern-keyboard";
import { PracticeModeProvider } from "@/components/pratice-mode";

export function TypingContainer() {
  return (
    <ErrorBoundary>
      <PracticeModeProvider>
        <TypingContainerInner />
      </PracticeModeProvider>
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
    setState,
    processInput,
    calculateWPM,
  } = useTypingSession();

  const {
    handleInput,
    handleRefresh,
    handleFocus,
    handleBlur,
    handleKeyDown,
    setSelectedTime,
  } = useSessionControls({
    session,
    setState,
    inputRef,
    getRandomData,
    processInput, // Pass the processInput use case
  });

  const handleFocusOverlayClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCloseResults = () => {
    setState(prev => ({ ...prev, showResults: false }));
  };

  const handleStartNewTest = () => {
    handleRefresh();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️ {error}</div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Initializing typing session..." />;
  }

  return (
    <div className="space-y-4">
      {/* Results Modal */}
      {showResults && lastTestResult && (
        <ResultsModal
          isOpen={showResults}
          onClose={handleCloseResults}
          result={lastTestResult}
          onStartNewTest={handleStartNewTest}
        />
      )}

      <div className="relative">
        <FocusOverlay
          isVisible={!isFocused && !testCompleted}
          onClick={handleFocusOverlayClick}
        />

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
      </div>

      {/* Modern Keyboard Component */}
      <div className="mt-6">
        <ModernKeyboard />
      </div>
    </div>
  );
}
