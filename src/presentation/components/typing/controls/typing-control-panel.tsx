"use client";

import TimerOptions from "@/components/time-options";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { memo } from "react";
import { KeyboardLayoutSelector } from "../keyboard-layouts/keyboard-layout-selector";
import { DifficultySelector } from "./difficulty-selector";
import { LanguageSelector } from "./language-selector";
import { PracticeModeToggle } from "./practice-mode-toggle";
import { RefreshButton } from "./refresh-button";

interface TypingControlPanelProps {
  session: TypingSessionState;
  testCompleted: boolean;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
  onLayoutChange?: (layoutId: string) => void;
}

export const TypingControlPanel = memo(function TypingControlPanel({
  session,
  testCompleted,
  onRefresh,
  onTimeChange,
  onLayoutChange,
}: TypingControlPanelProps) {
  return (
    <Card className="border-0 shadow-none">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Section - Test Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton onRefresh={onRefresh} disabled={testCompleted} />

          <TimerOptions
            selectedTime={session.selectedTime}
            setSelectedTime={onTimeChange}
            disabled={testCompleted}
          />

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <LanguageSelector disabled={testCompleted} />

          <DifficultySelector disabled={testCompleted} />
        </div>

        {/* Right Section - Layout & Mode Settings */}
        <div className="flex flex-wrap items-center gap-2">
          <KeyboardLayoutSelector
            compact={true}
            showLayoutInfo={true}
            onLayoutChange={onLayoutChange}
          />

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <PracticeModeToggle disabled={testCompleted} />
        </div>
      </div>
    </Card>
  );
});
