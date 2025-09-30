"use client";

import { FocusOverlay } from "@/components/focus-overlay";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { ErrorBoundary } from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";
import { TypingControls } from "./typing-controls/typing-controls";
import TypingDisplay from "./typing-display/typing-display";
import TypingStats from "./typing-stats/typing-stats";

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
    </div>
  );
}
