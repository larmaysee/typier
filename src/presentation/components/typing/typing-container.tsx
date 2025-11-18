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

  // Debug function to create test result for testing modal
  const createTestResult = () => {
    const mockResult = {
      wpm: 45,
      accuracy: 92.5,
      correctWords: 23,
      incorrectWords: 2,
      totalWords: 25,
      testDuration: 30,
      language: "en",
      charactersTyped: 127,
      errors: 5,
    };
    setState((prev) => ({
      ...prev,
      lastTestResult: mockResult,
      showResults: true,
    }));
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
    <div className="space-y-4">
      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-2 right-2 bg-background border rounded p-2 text-xs z-50">
          <div>showResults: {showResults ? "true" : "false"}</div>
          <div>lastTestResult: {lastTestResult ? "exists" : "null"}</div>
          <div>testCompleted: {testCompleted ? "true" : "false"}</div>
          <div>sessionId: {session.sessionId || "null"}</div>
          <div>practiceMode: {config.practiceMode ? "true" : "false"}</div>
          <div>modalCondition: {showResults && lastTestResult ? "SHOULD SHOW" : "NOT SHOWING"}</div>
          <div>overlayCondition: {testCompleted && !showResults ? "SHOWING OVERLAY" : "NOT SHOWING OVERLAY"}</div>
          {/* Debug buttons */}
          <div className="mt-2 space-x-1">
            <button
              onClick={() => setState((prev) => ({ ...prev, showResults: true }))}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              disabled={!lastTestResult}
            >
              Force Show Results
            </button>
            <button
              onClick={() => setState((prev) => ({ ...prev, showResults: false }))}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Hide Results
            </button>
            <button onClick={createTestResult} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              Create Test Result
            </button>
            <button
              onClick={() => {
                setState((prev) => ({ ...prev, typedText: "hello world test" }));
                setTimeout(() => {
                  completeSession();
                }, 100);
              }}
              className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
            >
              Complete With Text
            </button>
          </div>
        </div>
      )}

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
