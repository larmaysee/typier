"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestMode } from "@/domain";
import { cn } from "@/lib/utils";
import { Clock, Hash, Timer } from "lucide-react";
import { memo, useState } from "react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

interface TestModeOptionsProps {
  selectedTime: number;
  setSelectedTime: (time: number) => void;
  selectedWords: number;
  setSelectedWords: (words: number) => void;
  disabled?: boolean;
  showCountdown?: boolean;
  timeLeft?: number;
  wordsLeft?: number;
}

const TIME_OPTIONS = [15, 30, 60, 90, 120, 180, 300];
const WORD_OPTIONS = [30, 50, 100, 150, 200, 300, 350, 400];

export default memo(function TestModeOptions({
  selectedTime,
  setSelectedTime,
  selectedWords,
  setSelectedWords,
  disabled = false,
  showCountdown = false,
  timeLeft = 0,
  wordsLeft = 0,
}: TestModeOptionsProps) {
  const { config, setConfig } = useSiteConfig();
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

  const formatWords = (words: number): string => {
    return `${words} words`;
  };

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    setIsOpen(false);
  };

  const handleWordSelect = (words: number) => {
    setSelectedWords(words);
    setIsOpen(false);
  };

  const handleModeChange = async (mode: TestMode) => {
    await setConfig({
      ...config,
      testMode: mode,
    });
  };

  const isTimeMode = config.testMode === TestMode.TIME;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("gap-2 min-w-[100px]", showCountdown && shouldShowTimer && isTimeMode && "font-mono")}
        >
          {isTimeMode ? (
            <>
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
            </>
          ) : (
            <>
              <Hash className="h-4 w-4" />
              {showCountdown ? `${wordsLeft} left` : formatWords(selectedWords)}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        <Tabs value={config.testMode} onValueChange={(value) => handleModeChange(value as TestMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value={TestMode.TIME} className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Time
            </TabsTrigger>
            <TabsTrigger value={TestMode.WORDS} className="text-xs">
              <Hash className="h-3 w-3 mr-1" />
              Words
            </TabsTrigger>
          </TabsList>

          <TabsContent value={TestMode.TIME} className="mt-0">
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
          </TabsContent>

          <TabsContent value={TestMode.WORDS} className="mt-0">
            <div className="grid grid-cols-2 gap-1">
              {WORD_OPTIONS.map((words) => (
                <Button
                  key={words}
                  size="sm"
                  variant={words === selectedWords ? "default" : "ghost"}
                  onClick={() => handleWordSelect(words)}
                  className={cn("justify-start", words === selectedWords && "font-semibold")}
                >
                  {words} words
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
});
