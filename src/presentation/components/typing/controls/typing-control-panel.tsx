"use client";

import TimerOptions from "@/components/time-options";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { memo } from "react";
import { PracticeModeToggle } from "./practice-mode-toggle";
import { RefreshButton } from "./refresh-button";
import { TypingConfigDialog } from "./typing-config-dialog";

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
          <TimerOptions
            selectedTime={session.selectedTime}
            setSelectedTime={onTimeChange}
            disabled={testCompleted}
            showCountdown={session.startTime !== null && !testCompleted}
            timeLeft={session.timeLeft}
          />
        </div>

        {/* Right Section - Configuration & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <TypingConfigDialog disabled={testCompleted} onLayoutChange={onLayoutChange} />

          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <PracticeModeToggle />
          <RefreshButton onRefresh={onRefresh} disabled={testCompleted} />
        </div>
      </div>
    </Card>
  );
});
