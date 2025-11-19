"use client";

import { FocusOverlay } from "@/components/focus-overlay";
import ModernKeyboard from "@/components/modern-keyboard";
import { PracticeModeProvider } from "@/components/pratice-mode";
import { ResultsModal } from "@/components/results-modal";
import { useSiteConfig } from "@/components/site-config";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { TypingControlPanel } from "./controls/typing-control-panel";
import { ErrorBoundary } from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";
import TypingDisplay from "./typing-display/typing-display";

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
  const { config } = useSiteConfig();
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
    completeSession,
  } = useTypingSession();

  const { handleInput, handleRefresh, handleFocus, handleBlur, handleKeyDown, setSelectedTime } = useSessionControls({
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
    console.log("🔄 [TypingContainer] Closing results modal...");
    setState((prev) => ({ ...prev, showResults: false }));
  };

  const handleStartNewTest = () => {
    handleRefresh();
  };

  // Debug logging for modal rendering
  if (showResults && lastTestResult) {
    console.log("🔄 [TypingContainer] Should render ResultsModal:", { showResults, lastTestResult: !!lastTestResult });
  }
  if (showResults && !lastTestResult) {
    console.log("⚠️ [TypingContainer] showResults=true but no lastTestResult");
  }
  if (!showResults && lastTestResult) {
    console.log("⚠️ [TypingContainer] lastTestResult exists but showResults=false");
  }

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
    <div className="space-y-4 flex flex-col justify-between h-full">
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
        <FocusOverlay isVisible={!isFocused && !testCompleted} onClick={handleFocusOverlayClick} />

        <TypingDisplay
          textContent={textContent}
          session={session}
          isFocused={isFocused}
          testCompleted={testCompleted}
          showResults={showResults}
          inputRef={inputRef}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Modern Keyboard Component */}
      <div className="mt-6 space-y-4">
        <TypingControlPanel
          session={session}
          testCompleted={session.testCompleted}
          onRefresh={handleRefresh}
          onTimeChange={setSelectedTime}
        />
        <ModernKeyboard />
      </div>
    </div>
  );
}
