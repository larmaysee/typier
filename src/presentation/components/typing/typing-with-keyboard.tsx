"use client";

import { useState, useCallback, useEffect } from "react";
import { TypingContainer } from "./typing-container";
import { LayoutPreview } from "./keyboard-layouts/layout-preview";
import { TypingControlPanel } from "./controls/typing-control-panel";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { ILayoutManagerService } from "@/domain/interfaces/keyboard-layout.interface";
import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { useSiteConfig } from "@/components/site-config";
import ModernKeyboard from "@/components/modern-keyboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTypingSession } from "@/presentation/hooks/typing/use-typing-session";
import { useSessionControls } from "@/presentation/hooks/typing/use-session-controls";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Zap, TrendingUp, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TypingWithKeyboard() {
  const { resolve, serviceTokens } = useDependencyInjection();
  const { config } = useSiteConfig();
  const [currentLayout, setCurrentLayout] = useState<KeyboardLayout | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('right');

  // Get typing session state and controls
  const {
    session,
    setState,
    inputRef,
    getRandomData,
    processInput,
    calculateWPM,
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

  // Calculate accuracy
  const calculateAccuracy = () => {
    const total = session.correctWords + session.incorrectWords;
    if (total === 0) return 100;
    return Math.round((session.correctWords / total) * 100);
  };

  // Sidebar component
  const Sidebar = () => (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Session Status</h3>
            <Badge variant={session.testCompleted ? "default" : session.isFocused ? "default" : "secondary"}>
              {session.testCompleted ? "Completed" : session.isFocused ? "Active" : "Paused"}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium capitalize">{config.practiceMode ? "Practice" : "Normal"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium">{config.language.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="font-medium capitalize">{config.difficultyMode}</span>
            </div>
            {currentLayout && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layout</span>
                <span className="font-medium text-xs">{currentLayout.displayName}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Keyboard Layout Preview */}
      {currentLayout && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Keyboard Layout</h3>
              <Badge variant="outline" className="text-xs">
                {currentLayout.layoutType}
              </Badge>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[280px]">
                <LayoutPreview
                  layout={currentLayout}
                  showFingerPositions={config.practiceMode}
                  highlightActiveKey={activeKey || undefined}
                  size="sm"
                  interactive={false}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tips Card */}
      {!session.testCompleted && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">💡 Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Keep your fingers on home row</li>
              <li>• Focus on accuracy over speed</li>
              <li>• Maintain steady rhythm</li>
              {config.practiceMode && <li>• Watch finger positions</li>}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="w-full h-full">
      {/* Main Content Area with Sidebar */}
      <div className="relative flex gap-4">
        {/* Main Content - Typing Area */}
        <div className={cn(
          "flex-1 space-y-4 min-w-0",
          "max-w-5xl mx-auto w-full"
        )}>
          {/* Typing Test Container */}
          <TypingContainer />
          <TypingControlPanel
            session={session}
            testCompleted={session.testCompleted}
            onRefresh={handleRefresh}
            onTimeChange={setSelectedTime}
            onLayoutChange={handleLayoutChange}
          />
        </div>

      </div>
    </div>
  );
}
