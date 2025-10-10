"use client";

import { FocusOverlay } from "@/components/focus-overlay";
import ModernKeyboard from "@/components/modern-keyboard";
import { PracticeModeProvider } from "@/components/pratice-mode";
import { ResultsModal } from "@/components/results-modal";
import { useSiteConfig } from "@/components/site-config";
import { KeyboardLayout } from "@/domain";
import { ILayoutManagerService } from "@/domain/interfaces";
import { useDependencyInjection } from "@/presentation";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { useCallback, useEffect, useState } from "react";
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
    setState((prev) => ({ ...prev, showResults: false }));
  };

  const handleStartNewTest = () => {
    handleRefresh();
  };

  const { resolve, serviceTokens } = useDependencyInjection();
  const { config } = useSiteConfig();
  const [currentLayout, setCurrentLayout] = useState<KeyboardLayout | null>(
    null
  );
  const loadInitialLayout = useCallback(async () => {
    try {
      const layoutManager = resolve<ILayoutManagerService>(
        serviceTokens.LAYOUT_MANAGER_SERVICE
      );

      // Get all layouts for current language
      const layouts = await layoutManager.getLayoutsForLanguage(
        config.language.code
      );

      if (layouts.length > 0) {
        // Try to get the default layout for this language or first available
        const defaultLayout = layouts[0];
        setCurrentLayout(defaultLayout);
      }
    } catch (err) {
      console.error("Failed to load initial keyboard layout:", err);
    }
  }, [resolve, serviceTokens, config.language.code]);

  // Load initial layout when language changes
  useEffect(() => {
    loadInitialLayout();
  }, [config.language.code, loadInitialLayout]);

  // Load layout when it changes from selector
  const handleLayoutChange = useCallback(
    async (layoutId: string) => {
      try {
        const layoutManager = resolve<ILayoutManagerService>(
          serviceTokens.LAYOUT_MANAGER_SERVICE
        );

        const layout = await layoutManager.getLayoutById(layoutId);
        if (layout) {
          setCurrentLayout(layout);
        }
      } catch (err) {
        console.error("Failed to load keyboard layout:", err);
      }
    },
    [resolve, serviceTokens]
  );

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
      <div className="mt-6 space-y-4">
        <TypingControlPanel
          session={session}
          testCompleted={session.testCompleted}
          onRefresh={handleRefresh}
          onTimeChange={setSelectedTime}
          onLayoutChange={handleLayoutChange}
        />
        <ModernKeyboard />
      </div>
    </div>
  );
}
