"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Clock, Timer } from "lucide-react";
import { memo, useState } from "react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

interface TimeOptionsProps {
  selectedTime: number;
  setSelectedTime: (time: number) => void;
  disabled?: boolean;
  showCountdown?: boolean;
  timeLeft?: number;
}

const TIME_OPTIONS = [15, 30, 60, 90, 120, 180, 300];

export default memo(function TimeOptions({
  selectedTime,
  setSelectedTime,
  disabled = false,
  showCountdown = false,
  timeLeft = 0,
}: TimeOptionsProps) {
  const { config } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);

  // In practice mode, time is optional (don't show countdown)
  const shouldShowTimer = !config.practiceMode;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("gap-2 min-w-[80px]", showCountdown && shouldShowTimer && "font-mono")}
        >
          {showCountdown && shouldShowTimer ? (
            <>
              <Timer className="h-4 w-4" />
              {formatCountdown(timeLeft)}
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              {formatTime(selectedTime)}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-2 gap-1">
          {TIME_OPTIONS.map((time) => (
            <Button
              key={time}
              size="sm"
              variant={time === selectedTime ? "default" : "ghost"}
              onClick={() => handleTimeSelect(time)}
              className={cn("justify-start", time === selectedTime && "font-semibold")}
            >
              {formatTime(time)}
            </Button>
          ))}
        </div>

        {config.practiceMode && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Practice mode: Timer is optional</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
