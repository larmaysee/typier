"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface TypingStatsProps {
  correctWords: number;
  incorrectWords: number;
  timeLeft: number;
  calculateWPM: () => number;
  handleRefresh: () => void;
}

export default function TypingStats({
  correctWords,
  incorrectWords,
  timeLeft,
  calculateWPM,
  handleRefresh
}: TypingStatsProps) {
  return (
    <div className="flex gap-2">
      <Button variant={"secondary"} size={"sm"} className="p-2">
        <span>
          {correctWords} / {correctWords + incorrectWords}
        </span>
        <span className="mx-2">|</span>
        <span className="font-bold">{calculateWPM()} WPM</span>
        <span className="mx-2">|</span>
        <span className="font-bold">{timeLeft}s</span>
      </Button>

      <Button
        variant={"secondary"}
        size={"icon"}
        className="w-9 h-9"
        onClick={handleRefresh}
      >
        <RotateCcw />
      </Button>
    </div>
  );
}
