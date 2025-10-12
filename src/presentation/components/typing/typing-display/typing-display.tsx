"use client";

import { useSiteConfig } from "@/components/site-config";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { useEffect, useRef } from "react";

interface TypingDisplayProps {
  textContent: string | null;
  session: TypingSessionState;
  isFocused: boolean;
  testCompleted: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function TypingDisplay({
  textContent,
  session,
  isFocused,
  testCompleted,
  inputRef,
  onInput,
  onFocus,
  onBlur,
  onKeyDown,
}: TypingDisplayProps) {
  const { config } = useSiteConfig();
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Global keyboard event listener to focus input when not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if input is already focused or if it's a modifier key
      if (isFocused || e.ctrlKey || e.metaKey || e.altKey || testCompleted) {
        return;
      }

      // Don't interfere with other inputs or interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
        return;
      }

      // Focus the input and let the key event propagate naturally
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFocused, testCompleted, inputRef]);

  // Auto-scroll for active words
  useEffect(() => {
    const activeWord = document.querySelector(".word.active") as HTMLElement;
    const databox = document.querySelector(".databox") as HTMLElement;
    if (activeWord && databox) {
      if (activeWord.offsetTop + 30 > databox.clientHeight) {
        databox.scrollTo({ top: databox.clientHeight, behavior: "smooth" });
      } else {
        const topOffset =
          activeWord.offsetTop - databox.clientHeight > 0 ? activeWord.offsetTop - databox.clientHeight : 0;
        databox.scrollTo({ top: topOffset, behavior: "smooth" });
      }
    }
  }, [session.typedText]);

  const getActiveWordIndex = () => {
    // Use cursor position instead of splitting typed text
    return session.cursorPosition.wordIndex;
  };

  const getWordClass = (wordIndex: number) => {
    const currentWords = textContent?.split(" ") || [];
    const typedWords = session.typedText.split(" ");

    // Handle the case where typed text ends with space
    const typedWord = typedWords[wordIndex] || "";
    const targetWord = currentWords[wordIndex] || "";

    // Only mark as typed if we've moved past this word
    if (session.cursorPosition.wordIndex > wordIndex) {
      if (typedWord === targetWord) {
        return "correct typed";
      } else if (typedWord.length > 0) {
        return "incorrect border-b border-dashed border-destructive typed";
      }
    }

    return "";
  };

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    const currentWords = textContent?.split(" ") || [];

    if (wordIndex >= currentWords.length) {
      return "text-muted-foreground";
    }

    const currentWord = currentWords[wordIndex];
    if (charIndex >= currentWord.length) {
      return "text-muted-foreground";
    }

    // Get the typed text for this specific word
    const typedWords = session.typedText.split(" ");
    const typedWord = typedWords[wordIndex] || "";

    const currentChar = currentWord[charIndex];
    const typedChar = typedWord[charIndex] || "";

    if (!typedChar) {
      return "text-muted-foreground";
    }

    return typedChar === currentChar ? "text-black dark:text-white" : "text-destructive";
  };

  const handleClickToFocus = () => {
    if (inputRef.current && !testCompleted) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full space-y-4">
      {/* Text display area */}
      <div
        className={cn(
          "databox-wrapper bg-card rounded-lg border border-dashed w-full cursor-text transition-all duration-200 p-4 relative",
          isFocused ? "border-primary/20 focus" : "",
          testCompleted && "opacity-50 pointer-events-none"
        )}
        onClick={handleClickToFocus}
        ref={textContainerRef}
      >
        {/* Header with instructions */}
        {!session.startTime && (
          <div className="absolute top-4 right-4">
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Click here to start typing
            </div>
          </div>
        )}

        <div className={cn("databox relative focus-visible:border-primary overflow-hidden h-[150px]")}>
          {config.difficultyMode === "chars" ? (
            // Character mode with special styling
            <div className="flex flex-wrap gap-2 p-2">
              {textContent?.split("").map((char, charIndex) => {
                const words = session.typedText.split("");
                const typedChar = words[charIndex] || "";
                const isCursorPosition = charIndex === session.typedText.length;

                let bgColor = "bg-muted/30";
                let textColor = "text-muted-foreground";

                if (typedChar) {
                  if (typedChar === char) {
                    bgColor = "bg-green-100 dark:bg-green-900/30";
                    textColor = "text-green-700 dark:text-green-300";
                  } else {
                    bgColor = "bg-red-100 dark:bg-red-900/30";
                    textColor = "text-red-700 dark:text-red-300";
                  }
                }

                return (
                  <div
                    key={charIndex}
                    className={cn(
                      "relative flex items-center justify-center min-w-[40px] h-[40px] rounded-md border text-xl font-medium transition-colors",
                      bgColor,
                      textColor,
                      char === " " ? "min-w-[40px] bg-transparent border-dashed" : ""
                    )}
                  >
                    {char === " " ? "⎵" : char}
                    {isCursorPosition && isFocused && !testCompleted && (
                      <span className="absolute left-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Sentence mode with original styling
            <div className="words flex flex-wrap relative leading-relaxed">
              {textContent?.split(" ").map((word, wordIndex) => {
                // Calculate if this word should show any cursor
                const isCurrentWord = session.cursorPosition.wordIndex === wordIndex;
                const shouldShowSpaceCursor = isCurrentWord && session.cursorPosition.isSpacePosition;
                const shouldShowEndOfWordCursor =
                  isCurrentWord &&
                  session.cursorPosition.charIndex === word.length &&
                  !session.cursorPosition.isSpacePosition;

                console.log("isSpacePosition ", session.cursorPosition.isSpacePosition);

                return (
                  <div
                    key={wordIndex}
                    className={`word word-${wordIndex} h-[30px] flex items-baseline mr-2 ${getWordClass(wordIndex)}${
                      getActiveWordIndex() === wordIndex ? " active" : ""
                    }`}
                  >
                    {word.split("").map((char, charIndex) => {
                      const isCursorPosition =
                        isCurrentWord &&
                        session.cursorPosition.charIndex === charIndex &&
                        !session.cursorPosition.isSpacePosition;

                      return (
                        <span
                          key={charIndex}
                          className={`letter letter-${charIndex} text-2xl relative ${getLetterClass(
                            wordIndex,
                            charIndex
                          )}`}
                        >
                          {char}
                          {isCursorPosition && !testCompleted && (
                            <span className="absolute left-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                          )}

                          {shouldShowSpaceCursor && charIndex === word.length - 1 && !testCompleted && (
                            <span className="absolute right-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completion message */}
        {testCompleted && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <div className="text-xl font-semibold">Test Completed!</div>
              <div className="text-sm text-muted-foreground">Check your results above</div>
            </div>
          </div>
        )}
      </div>
      <div>
        {/* Hidden input for typing */}
        <Input
          ref={inputRef}
          type="text"
          value={session.typedText}
          onChange={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className=""
          disabled={testCompleted}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
