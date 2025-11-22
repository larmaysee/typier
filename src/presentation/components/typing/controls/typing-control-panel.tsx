"use client";

import { useSiteConfig } from "@/components/site-config";
import TestModeOptions from "@/components/test-mode-options";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TestMode } from "@/domain";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { memo } from "react";
import { PracticeModeToggle } from "./practice-mode-toggle";
import { RefreshButton } from "./refresh-button";
import { TypingConfigDialog } from "./typing-config-dialog";

interface TypingControlPanelProps {
  session: TypingSessionState;
  testCompleted: boolean;
  textContent: string | null;
  onRefresh: () => void;
  onTimeChange: (time: number) => void;
  onWordCountChange: (words: number) => void;
  onLayoutChange?: (layoutId: string) => void;
}

export const TypingControlPanel = memo(function TypingControlPanel({
  session,
  testCompleted,
  textContent,
  onRefresh,
  onTimeChange,
  onWordCountChange,
  onLayoutChange,
}: TypingControlPanelProps) {
  const { config } = useSiteConfig();

  // Calculate word counts
  const totalWords = textContent ? textContent.split(" ").filter((word) => word.length > 0).length : 0;
  const typedWords = session.typedText
    ? session.typedText
        .trim()
        .split(" ")
        .filter((word) => word.length > 0).length
    : 0;

  const isTimeMode = config.testMode === TestMode.TIME;
  const wordsLeft = totalWords - typedWords;

  return (
    <Card className="border-0 shadow-none">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TestModeOptions
            selectedTime={session.selectedTime}
            setSelectedTime={onTimeChange}
            selectedWords={session.selectedWords || 50}
            setSelectedWords={onWordCountChange}
            disabled={testCompleted}
            showCountdown={session.startTime !== null && !testCompleted}
            timeLeft={session.timeLeft}
            wordsLeft={wordsLeft}
          />

          {/* Word Count Display */}
          {
            <>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm">
                <Button variant="secondary" size="sm" disabled className="border border-dashed bg-muted/50">
                  {typedWords} / {totalWords}
                </Button>
              </div>
            </>
          }
        </div>

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
