"use client";

import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { TypingDisplay } from "./typing-display/typing-display";
import { TypingControls } from "./typing-controls/typing-controls";
import { TypingStats } from "./typing-stats/typing-stats";
import { ErrorBoundary } from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";
import { ResultsModal } from "@/components/results-modal";
import { FocusOverlay } from "@/components/focus-overlay";

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