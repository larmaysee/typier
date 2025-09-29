"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimerOptions from "@/components/time-options";
import KeyboardSelector from "@/components/keyboard-selector";
import ModeToggler from "@/components/mode-toggler";
import TooltipWrapper from "@/components/tooltip-wrapper";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";

interface TypingControlsProps {
  session: TypingSessionState;
  testCompleted: boolean;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
}

export function TypingControls({ 
  session, 
  testCompleted, 
  onRefresh,
  onTimeChange
}: TypingControlsProps) {
  return (
    <div className="flex gap-2">
      <TooltipWrapper placement="center" tooltip="Select time">
        <TimerOptions
          selectedTime={session.selectedTime}
          setSelectedTime={onTimeChange}
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

      <TooltipWrapper placement="center" tooltip="Restart test">
        <Button
          variant={"secondary"}
          size={"icon"}
          className="w-9 h-9"
          onClick={onRefresh}
        >
          <RotateCcw />
        </Button>
      </TooltipWrapper>
    </div>
  );
}