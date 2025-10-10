"use client";

import AdsBlock from "@/components/ads-block";
import { cn } from "@/lib/utils";
import { TypingContainer } from "./typing-container";

export function TypingWithKeyboard() {
  return (
    <div className="w-full h-full">
      <div className="relative flex gap-4">
        <div
          className={cn("flex-1 space-y-4 min-w-0", "max-w-4xl mx-auto w-full")}
        >
          <AdsBlock />
          <TypingContainer />
        </div>
      </div>
    </div>
  );
}
