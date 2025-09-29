"use client";

import { Button } from "@/components/ui/button";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";

interface TypingStatsProps {
  session: TypingSessionState;
}

export function TypingStats({ session }: TypingStatsProps) {
  const calculateWPM = () => {
    if (session.startTime === null) return 0;
    const elapsedTime = (session.selectedTime - session.timeLeft) / 60;
    return elapsedTime > 0 ? Math.round(session.correctWords / elapsedTime) : 0;
  };

  return (
    <Button variant={"secondary"} size={"sm"} className="p-2">
      <span>
        {session.correctWords} / {session.correctWords + session.incorrectWords}
      </span>
      <span className="mx-2">|</span>
      <span className="font-bold">{calculateWPM()} WPM</span>
      <span className="mx-2">|</span>
      <span className="font-bold">{session.timeLeft}s</span>
    </Button>
  );
}