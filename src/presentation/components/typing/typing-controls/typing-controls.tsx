"use client";

import TooltipWrapper from "@/components/tooltip-wrapper";
import TimerOptions from "@/components/time-options";
import KeyboardSelector from "@/components/keyboard-selector";
import ModeToggler from "@/components/mode-toggler";

interface TypingControlsProps {
  selectedTime: number;
  setSelectedTime: (time: number) => void;
  testCompleted: boolean;
  handleRefresh: () => void;
}

export default function TypingControls({
  selectedTime,
  setSelectedTime,
  testCompleted
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