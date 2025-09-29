"use client";

import { memo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimerOptions from "@/components/time-options";
import { KeyboardLayoutSelector } from "../keyboard-layouts/keyboard-layout-selector";
import ModeToggler from "@/components/mode-toggler";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";

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
  onTimeChange
}: TypingControlsProps) {
  return (
    <div className="flex gap-2">
      <TooltipWrapper placement="center" tooltip="Select time">
        <TimerOptions
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          disabled={testCompleted}
        />
      </TooltipWrapper>
      <TooltipWrapper placement="center" tooltip="Select keyboard layout">
        <KeyboardSelector />
      </TooltipWrapper>
      <TooltipWrapper
        placement="center"
        tooltip="Enable/Disable practice mode"
      >
        <ModeToggler />
      </TooltipWrapper>
    </div>
  );
}
