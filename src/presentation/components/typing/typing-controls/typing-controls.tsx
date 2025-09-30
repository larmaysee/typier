"use client";

import ModeToggler from "@/components/mode-toggler";
import TimerOptions from "@/components/time-options";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { RotateCcw } from "lucide-react";
import { memo } from "react";
import { KeyboardLayoutSelector } from "../keyboard-layouts/keyboard-layout-selector";

interface TypingControlsProps {
  session: TypingSessionState;
  testCompleted: boolean;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
}

export const TypingControls = memo(function TypingControls({
  session,
  testCompleted,
  onRefresh,
  onTimeChange,
}: TypingControlsProps) {
  return (
    <div className="flex gap-2">
      <TooltipWrapper placement="center" tooltip="Refresh test">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={testCompleted}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper placement="center" tooltip="Select time">
        <TimerOptions
          selectedTime={session.selectedTime}
          setSelectedTime={onTimeChange}
          disabled={testCompleted}
        />
      </TooltipWrapper>
      <TooltipWrapper placement="center" tooltip="Select keyboard layout">
        <KeyboardLayoutSelector />
      </TooltipWrapper>
      <TooltipWrapper placement="center" tooltip="Enable/Disable practice mode">
        <ModeToggler />
      </TooltipWrapper>
    </div>
  );
});
