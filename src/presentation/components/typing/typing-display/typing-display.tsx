"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Lisu_Bosa } from "next/font/google";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";
import { useSiteConfig } from "@/components/site-config";

const lisuBosa = Lisu_Bosa({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

interface TypingDisplayProps {
  textContent: string | null;
  session: TypingSessionState;
  isFocused: boolean;
  testCompleted: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TypingDisplay({
  textContent,
  session,
  isFocused,
  testCompleted,
  inputRef,
  onInput,
  onFocus,
  onBlur,
  onKeyDown
}: TypingDisplayProps) {
  const { config } = useSiteConfig();

  // Auto-scroll to active word
  useEffect(() => {
    const activeWord = document.querySelector(".word.active") as HTMLElement;
    const databox = document.querySelector(".databox") as HTMLElement;
    if (activeWord) {
      if (activeWord.offsetTop + 30 > databox.clientHeight) {
        databox.scrollTo({ top: databox.clientHeight, behavior: "smooth" });
      } else {
        const topOffset =
          activeWord.offsetTop - databox.clientHeight > 0
            ? activeWord.offsetTop - databox.clientHeight
            : 0;
        databox.scrollTo({ top: topOffset, behavior: "smooth" });
      }
    }
  }, [session.typedText]);

  // Global key handler to focus input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFocused || e.ctrlKey || e.metaKey || e.altKey || testCompleted) {
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const inputElement = inputRef.current;
      if (inputElement) {
        inputElement.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, testCompleted]);

  const getActiveWordIndex = () => {
    const words = session.typedText.split(" ");
    return words.length - 1;
  };

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    const words = session.typedText.split(" ");
    const currentWords = textContent?.split(" ") || [];

    let className = "";

    if (wordIndex < currentWords.length) {
      const currentWord = currentWords[wordIndex];
      const typedWord = words[wordIndex] || "";

      if (charIndex < currentWord.length) {
        const currentChar = currentWord[charIndex];
        const typedChar = typedWord[charIndex] || "";

        if (typedChar) {
          if (typedChar === currentChar) {
            className = "text-black dark:text-white";
          } else {
            className = "text-destructive";
          }
        } else {
          className = "text-muted-foreground";
        }
      }
    }

    return className;
  };

  const getWordClass = (wordIndex: number) => {
    const words = session.typedText.split(" ");
    const currentWords = textContent?.split(" ") || [];
    const typedWord = words[wordIndex] || "";
    
    if (typedWord === currentWords[wordIndex] && wordIndex < words.length - 1) {
      return "text-green-500";
    }
    return "";
  };

  const renderCharacterMode = () => {
    return (
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
                char === " " ? "min-w-[20px] bg-transparent border-dashed" : ""
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
    );
  };

  const renderSentenceMode = () => {
    return (
      <div className="words flex flex-wrap relative">
        {textContent?.split(" ").map((word, wordIndex) => (
          <div
            key={wordIndex}
            className={`word word-${wordIndex} h-[30px] flex px-1 ${getWordClass(
              wordIndex
            )}${getActiveWordIndex() === wordIndex ? " active" : ""}`}
          >
            {word.split("").map((char, charIndex) => {
              const isCursorPosition =
                session.cursorPosition.wordIndex === wordIndex &&
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
                  {isCursorPosition && isFocused && !testCompleted && (
                    <span className="absolute left-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                  )}
                </span>
              );
            })}
            {/* Space cursor */}
            {session.cursorPosition.wordIndex === wordIndex &&
              session.cursorPosition.isSpacePosition &&
              isFocused && !testCompleted && (
                <span className="relative">
                  <span className="absolute right-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                </span>
              )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Input
        ref={inputRef}
        type="text"
        className="absolute -left-[9999px] opacity-0"
        onChange={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={testCompleted}
      />

      <div
        className={cn(
          "databox h-[120px] relative focus-visible:border-primary overflow-hidden",
          `${lisuBosa.className}`
        )}
      >
        {config.difficultyMode === 'chars' ? renderCharacterMode() : renderSentenceMode()}
      </div>
    </div>
  );
}