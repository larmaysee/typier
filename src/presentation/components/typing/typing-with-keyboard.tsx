"use client";

import { useState, useCallback, useEffect } from "react";
import { TypingContainer } from "./typing-container";
import { LayoutPreview } from "./keyboard-layouts/layout-preview";
import { TypingControlPanel } from "./controls/typing-control-panel";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { ILayoutManagerService } from "@/domain/interfaces/keyboard-layout.interface";
import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { useSiteConfig } from "@/components/site-config";
import { Card } from "@/components/ui/card";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";

export function TypingWithKeyboard() {
  const { resolve, serviceTokens } = useDependencyInjection();
  const { config } = useSiteConfig();
  const [currentLayout, setCurrentLayout] = useState<KeyboardLayout | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Get typing session state and controls
  const {
    session,
    setState,
    inputRef,
    getRandomData,
    processInput,
  } = useTypingSession();

  const { handleRefresh, setSelectedTime } = useSessionControls({
    session,
    setState,
    inputRef,
    getRandomData,
    processInput,
  });

  // Load initial layout when language changes
  useEffect(() => {
    loadInitialLayout();
  }, [config.language.code]);

  const loadInitialLayout = async () => {
    try {
      const layoutManager = resolve<ILayoutManagerService>(
        serviceTokens.LAYOUT_MANAGER_SERVICE
      );

      // Get all layouts for current language
      const layouts = await layoutManager.getLayoutsForLanguage(config.language.code);

      if (layouts.length > 0) {
        // Try to get the default layout for this language or first available
        const defaultLayout = layouts[0];
        setCurrentLayout(defaultLayout);
      }
    } catch (err) {
      console.error('Failed to load initial keyboard layout:', err);
    }
  };

  // Load layout when it changes from selector
  const handleLayoutChange = useCallback(async (layoutId: string) => {
    try {
      const layoutManager = resolve<ILayoutManagerService>(
        serviceTokens.LAYOUT_MANAGER_SERVICE
      );

      const layout = await layoutManager.getLayoutById(layoutId);
      if (layout) {
        setCurrentLayout(layout);
      }
    } catch (err) {
      console.error('Failed to load keyboard layout:', err);
    }
  }, [resolve, serviceTokens]);

  return (
    <div className="space-y-6">
      {/* Unified Control Panel */}
      <TypingControlPanel
        session={session}
        testCompleted={session.testCompleted}
        onRefresh={handleRefresh}
        onTimeChange={setSelectedTime}
        onLayoutChange={handleLayoutChange}
      />

      {/* Typing Test Container */}
      <TypingContainer />

      {/* Keyboard Layout Preview */}
      {currentLayout && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  {currentLayout.displayName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentLayout.language.toUpperCase()} · {currentLayout.layoutType}
                </p>
              </div>
            </div> */}

            <LayoutPreview
              layout={currentLayout}
              showFingerPositions={config.practiceMode}
              highlightActiveKey={activeKey || undefined}
              size="md"
              interactive={false}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
