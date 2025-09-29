"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";

interface TypingDisplayProps {
  currentData: string | null;
  typedText: string;
  cursorPosition: {
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  };
  isFocused: boolean;
  testCompleted: boolean;
  config: {
    difficultyMode: string;
    practiceMode: boolean;
  };
  inputRef: React.RefObject<HTMLInputElement>;
  textContainerRef: React.RefObject<HTMLDivElement>;
  isStartNextWord: boolean;
  setTypedText: (text: string) => void;
  setStartTime: (time: number | null) => void;
  setCorrectWords: (count: number) => void;
  setIncorrectWords: (count: number) => void;
  setCursorPosition: (position: {
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  }) => void;
  setActiveChar: (char: string | null) => void;
  setIsStartNextWord: (value: boolean) => void;
  setIsFocused: (focused: boolean) => void;
}

export default function TypingDisplay({
  currentData,
  typedText,
  cursorPosition,
  isFocused,
  testCompleted,
  config,
  inputRef,
  textContainerRef,
  isStartNextWord,
  setTypedText,
  setStartTime,
  setCorrectWords,
  setIncorrectWords,
  setCursorPosition,
  setActiveChar,
  setIsStartNextWord,
  setIsFocused
}: TypingDisplayProps) {

  const getActiveWordIndex = () => {
    const words = typedText.split(" ");
    return words.length - 1;
  };

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    const words = typedText.split(" ");
    const currentWords = currentData?.split(" ") || [];

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
    const words = typedText.split(" ");
    const currentWords = currentData?.split(" ") || [];
    const typedWord = words[wordIndex] || "";
    if (typedWord === currentWords[wordIndex] && wordIndex < words.length - 1) {
      return "correct typed";
    } else if (typedWord.length > 0 && wordIndex < words.length - 1) {
      return "incorrect border-b border-dashed border-destructive typed";
    }
    return "";
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!currentData) return;

    // Handle special keys
    if (e.key === 'Backspace') {
      if (typedText.length > 0) {
        setTypedText(typedText.slice(0, -1));
      }
      return;
    }

    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      return;
    }

    // Start timer on first keystroke
    if (typedText.length === 0) {
      setStartTime(Date.now());
    }
  }, [currentData, typedText, setTypedText, setStartTime]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentData || testCompleted) return;

    const newText = e.target.value;
    setTypedText(newText);

    // Calculate correct/incorrect words
    const currentWords = currentData.split(" ");
    const words = newText.split(" ");
    let correct = 0;
    let incorrect = 0;

    const getActiveWordIndex = () => {
      const words = newText.split(" ");
      return words.length - 1;
    };

    words.forEach((word, index) => {
      if (index < currentWords.length) {
        if (word === currentWords[index]) {
          correct++;
        } else if (word.length > 0) {
          incorrect++;
        }
      }
    });

    setCorrectWords(correct);
    setIncorrectWords(incorrect);

    // Handle cursor and active character logic
    const activeWordIndex = getActiveWordIndex();
    const activeCharIndex = words[activeWordIndex]?.length || 0;
    let activeChar = isStartNextWord
      ? currentWords[activeWordIndex + 1]?.[0]
      : currentWords[activeWordIndex]?.[activeCharIndex] || null;

    const isSpacePosition = activeCharIndex === currentWords[activeWordIndex]?.length && !isStartNextWord;

    let cursorWordIndex = activeWordIndex;
    let cursorCharIndex = activeCharIndex;
    let cursorIsSpacePosition = isSpacePosition;

    if (isSpacePosition) {
      activeChar = "spacebar";
      setIsStartNextWord(false);
    }

    if (isStartNextWord && currentWords[activeWordIndex + 1]) {
      cursorWordIndex = activeWordIndex + 1;
      cursorCharIndex = 0;
      cursorIsSpacePosition = false;
      activeChar = currentWords[activeWordIndex + 1]?.[0] || null;
    }

    setCursorPosition({
      wordIndex: cursorWordIndex,
      charIndex: cursorCharIndex,
      isSpacePosition: cursorIsSpacePosition
    });

    setActiveChar(activeChar);
    setIsStartNextWord(false);

    if (config.practiceMode && activeCharIndex === 0) {
      setActiveChar(currentWords[activeWordIndex]?.[0] || null);
    }
  }, [currentData, testCompleted, isStartNextWord, config.practiceMode, setTypedText, setCorrectWords, setIncorrectWords, setCursorPosition, setActiveChar, setIsStartNextWord]);

  return (
    <div
      className={cn(
        "bg-background databox-wrapper rounded-lg relative p-4 border border-dashed",
        isFocused ? "focus" : "",
        testCompleted ? "opacity-50 pointer-events-none" : ""
      )}
      tabIndex={0}
      onFocus={() => inputRef.current?.focus()}
      ref={textContainerRef}
    >
      <Input
        className="opacity-0 absolute left-0"
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        ref={inputRef}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={testCompleted}
      />

      <div className={cn("databox h-[120px] relative focus-visible:border-primary overflow-hidden")}>
        {config.difficultyMode === 'chars' ? (
          // Character mode with special styling
          <div className="flex flex-wrap gap-2 p-2">
            {currentData?.split("").map((char, charIndex) => {
              const words = typedText.split("");
              const typedChar = words[charIndex] || "";
              const isCursorPosition = charIndex === typedText.length;

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
        ) : (
          // Sentence mode with original styling
          <div className="words flex flex-wrap relative">
            {currentData?.split(" ").map((word, wordIndex) => (
              <div
                key={wordIndex}
                className={`word word-${wordIndex} h-[30px] flex px-1 ${getWordClass(
                  wordIndex
                )}${getActiveWordIndex() === wordIndex ? " active" : ""}`}
              >
                {word.split("").map((char, charIndex) => {
                  const isCursorPosition =
                    cursorPosition.wordIndex === wordIndex &&
                    cursorPosition.charIndex === charIndex &&
                    !cursorPosition.isSpacePosition;

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
                {cursorPosition.wordIndex === wordIndex &&
                  cursorPosition.isSpacePosition &&
                  isFocused && !testCompleted && (
                    <span className="relative">
                      <span className="absolute right-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
                    </span>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}