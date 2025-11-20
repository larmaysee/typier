"use client";

import { usePracticeMode } from "@/components/pratice-mode";
import { useSiteConfig } from "@/components/site-config";
import { Input } from "@/components/ui/input";
import { TextType } from "@/domain";
import { cn } from "@/lib/utils";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import GraphemeSplitter from "grapheme-splitter";
import { useEffect, useMemo, useRef } from "react";

// Create a single instance of GraphemeSplitter for reuse
const splitter = new GraphemeSplitter();

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
  const { setActiveChar } = usePracticeMode();
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Memoize grapheme splitting for performance
  const textClusters = useMemo(() => {
    return textContent ? splitter.splitGraphemes(textContent) : [];
  }, [textContent]);

  const typedClusters = useMemo(() => {
    return splitter.splitGraphemes(session.typedText);
  }, [session.typedText]);

  // Split by words but preserve grapheme integrity
  const textWords = useMemo(() => {
    if (!textContent) return [];
    return textContent.split(" ").map((word) => splitter.splitGraphemes(word));
  }, [textContent]);

  const typedWords = useMemo(() => {
    return session.typedText.split(" ").map((word) => splitter.splitGraphemes(word));
  }, [session.typedText]);

  // Track current character for practice mode
  useEffect(() => {
    if (!config.practiceMode || !textContent || testCompleted) {
      setActiveChar(null);
      return;
    }

    // Calculate the current character that needs to be typed using grapheme clusters
    const currentIndex = typedClusters.length;
    if (currentIndex < textClusters.length) {
      const currentChar = textClusters[currentIndex];
      setActiveChar(currentChar === " " ? "spacebar" : currentChar);
    } else {
      setActiveChar(null);
    }
  }, [config.practiceMode, textContent, typedClusters.length, testCompleted, setActiveChar, textClusters]);

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

  // Auto-scroll for active words/characters with line tracking
  useEffect(() => {
    const databox = document.querySelector(".databox") as HTMLElement;

    if (!databox) return;

    // Handle character mode
    if (config.textType === TextType.CHARS) {
      // Find all character boxes
      const charBoxes = Array.from(databox.querySelectorAll(".char-box")) as HTMLElement[];
      const cursorIndex = typedClusters.length;
      const activeChar = charBoxes[cursorIndex];

      if (activeChar) {
        const activeCharTop = activeChar.offsetTop;
        const lineHeight = 52; // Approximate height including gap
        const currentLine = Math.floor(activeCharTop / lineHeight);

        // When cursor reaches line 2 or beyond, scroll up
        if (currentLine >= 2) {
          const scrollAmount = (currentLine - 1) * lineHeight;
          databox.scrollTo({ top: scrollAmount, behavior: "smooth" });
        } else {
          databox.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } else {
      // Handle word mode
      const activeWord = document.querySelector(".word.active") as HTMLElement;

      if (activeWord) {
        const activeWordTop = activeWord.offsetTop;
        const lineHeight = 40; // h-[40px] from word class
        const currentLine = Math.floor(activeWordTop / lineHeight);

        // When cursor reaches the end of the second visible line, scroll up by one line
        if (currentLine >= 2) {
          const scrollAmount = (currentLine - 1) * lineHeight;
          databox.scrollTo({ top: scrollAmount, behavior: "smooth" });
        } else {
          // Reset to top if we're on first two lines
          databox.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  }, [session.typedText, session.cursorPosition.wordIndex, config.textType, typedClusters.length]);
  const getActiveWordIndex = () => {
    // Use cursor position instead of splitting typed text
    return session.cursorPosition.wordIndex;
  };

  const getWordClass = (wordIndex: number) => {
    if (wordIndex >= textWords.length) return "";

    const targetWord = textWords[wordIndex];
    const typedWord = typedWords[wordIndex] || [];

    // Only mark as typed if we've moved past this word
    if (session.cursorPosition.wordIndex > wordIndex) {
      // Compare grapheme arrays
      const isCorrect =
        targetWord.length === typedWord.length && targetWord.every((char, idx) => char === typedWord[idx]);

      if (isCorrect) {
        return "correct typed";
      } else if (typedWord.length > 0) {
        return "incorrect border-b border-dashed border-destructive typed";
      }
    }

    return "";
  };

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    if (wordIndex >= textWords.length) {
      return "text-muted-foreground";
    }

    const targetWordClusters = textWords[wordIndex];
    if (charIndex >= targetWordClusters.length) {
      return "text-muted-foreground";
    }

    const typedWordClusters = typedWords[wordIndex] || [];
    const targetChar = targetWordClusters[charIndex];
    const typedChar = typedWordClusters[charIndex] || "";

    if (!typedChar) {
      return "text-muted-foreground";
    }

    return typedChar === targetChar ? "text-black dark:text-white" : "text-destructive";
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
          "databox-wrapper bg-card rounded-lg border border-dashed w-full cursor-text transition-all duration-200 px-6 py-10 relative",
          isFocused ? "border-primary/20 focus" : "",
          testCompleted && "opacity-50 pointer-events-none"
        )}
        onClick={handleClickToFocus}
        ref={textContainerRef}
      >
        {/* Header with instructions */}
        {!session.startTime && (
          <div className="absolute top-2 right-2">
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Click here to start typing
            </div>
          </div>
        )}

        <div className={cn("databox relative focus-visible:border-primary overflow-hidden h-[150px]")}>
          {config.textType === TextType.CHARS ? (
            // Character mode with special styling using grapheme clusters
            <div className="flex flex-wrap gap-2 p-2">
              {textClusters.map((char, charIndex) => {
                const typedChar = typedClusters[charIndex] || "";
                const isCursorPosition = charIndex === typedClusters.length;

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
                      "char-box relative flex items-center justify-center min-w-[40px] h-[40px] rounded-md border text-xl font-medium transition-colors",
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
            <div className="words flex flex-wrap relative leading-relaxed">
              {textWords.map((wordClusters, wordIndex) => {
                const isCurrentWord = session.cursorPosition.wordIndex === wordIndex;
                const shouldShowSpaceCursor = isCurrentWord && session.cursorPosition.isSpacePosition;
                return (
                  <div
                    key={wordIndex}
                    className={`word word-${wordIndex} h-[40px] flex items-baseline mr-2 ${getWordClass(wordIndex)}${
                      getActiveWordIndex() === wordIndex ? " active" : ""
                    }`}
                  >
                    {wordClusters.map((char, charIndex) => {
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

                          {shouldShowSpaceCursor && charIndex === wordClusters.length - 1 && !testCompleted && (
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
      </div>
      <div>
        <Input
          ref={inputRef}
          type="text"
          value={session.typedText}
          onChange={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="bg-muted/10 border border-primary/10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full h-10 font-sans text-xl"
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
