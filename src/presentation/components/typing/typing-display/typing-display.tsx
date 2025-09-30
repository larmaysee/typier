"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TypingSessionState } from "@/presentation/hooks/typing/use-typing-session";

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
  onKeyDown
}: TypingDisplayProps) {

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    const words = session.typedText.split(" ");
    const currentWords = textContent?.split(" ") || [];

    if (wordIndex >= currentWords.length) {
      return "text-muted-foreground";
    }

    const currentWord = currentWords[wordIndex];
    const typedWord = words[wordIndex] || "";

    if (charIndex >= currentWord.length) {
      return "text-muted-foreground";
    }

    const currentChar = currentWord[charIndex];
    const typedChar = typedWord[charIndex] || "";

    if (!typedChar) {
      return "text-muted-foreground";
    }

    return typedChar === currentChar
      ? "text-black dark:text-white"
      : "text-destructive";
  };

  if (!textContent) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading text...
      </div>
    );
  }

  const words = textContent.split(" ");
  const typedWords = session.typedText.split(" ");

  const handleClickToFocus = () => {
    if (inputRef.current && !testCompleted) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      {/* Text display area */}
      <div
        className="mb-4 p-6 bg-card rounded-lg border min-h-[200px] cursor-text"
        onClick={handleClickToFocus}
      >
        <div className="text-2xl leading-relaxed flex flex-wrap gap-2">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex">
              {Array.from(word).map((char, charIndex) => (
                <span
                  key={`${wordIndex}-${charIndex}`}
                  className={cn(
                    "transition-colors duration-100",
                    getLetterClass(wordIndex, charIndex),
                    wordIndex === session.cursorPosition.wordIndex &&
                    charIndex === session.cursorPosition.charIndex &&
                    "border-l-2 border-primary animate-pulse"
                  )}
                >
                  {char}
                </span>
              ))}
              {wordIndex < words.length - 1 && (
                <span className="text-muted-foreground mr-2"> </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden input for typing */}
      <Input
        ref={inputRef}
        type="text"
        onChange={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="sr-only"
        disabled={testCompleted}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}