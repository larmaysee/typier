"use client";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePracticeMode } from "./pratice-mode";
import { useSiteConfig } from "./site-config";
import { useTypingStatistics } from "./typing-statistics";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ResultsModal } from "@/components/results-modal";
import { FocusOverlay } from "@/components/focus-overlay";
import DataMode from "./data-mode";

import { RotateCcw } from "lucide-react";
// import { Lisu_Bosa } from "next/font/google"; // Temporarily disabled due to network issues
import KeyboardSelector from "./keyboard-selector";
import ModeToggler from "./mode-toggler";
import TimerOptions from "./time-options";
import TooltipWrapper from "./tooltip-wrapper";

// const lisuBosa = Lisu_Bosa({
//   weight: ["400", "700"],
//   style: ["normal", "italic"],
//   subsets: ["latin"],
// });

// Fallback font style for now
const lisuBosa = {
  className: "font-sans" // Use system font as fallback
};

export type DataBoxType = {
  data: string;
};

export default function DataBox() {
  const { config } = useSiteConfig();
  const { setActiveChar, setComposeKey } = usePracticeMode();
  const { addTestResult } = useTypingStatistics();
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const [currentData, setCurrentData] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [syntaxs, setSyntaxs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>("");

  const [correctWords, setCorrectWords] = useState<number>(0);
  const [incorrectWords, setIncorrectWords] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isStartNextWord, setIsStartNextWord] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [selectedTime, setSelectedTime] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [cursorPosition, setCursorPosition] = useState<{
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  }>({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [lastTestResult, setLastTestResult] = useState<{
    wpm: number;
    accuracy: number;
    correctWords: number;
    incorrectWords: number;
    totalWords: number;
    testDuration: number;
    language: string;
    charactersTyped: number;
    errors: number;
  } | null>(null);

  useEffect(() => {
    setTimeLeft(selectedTime);
    setTestCompleted(false);
    setShowResults(false);
  }, [selectedTime]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const calculateWPM = useCallback(() => {
    if (startTime === null) return 0;

    const elapsedTime = (selectedTime - timeLeft) / 60; // in minutes
    return elapsedTime > 0 ? Math.round(correctWords / elapsedTime) : 0;
  }, [startTime, selectedTime, timeLeft, correctWords]);

  const getRandomData = useCallback(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    const dataset = datasets[language];
    if (!dataset) return;

    if (config.difficultyMode === 'chars' && dataset.chars) {
      // Generate random character sequence
      const chars = dataset.chars;
      const sequenceLength = Math.floor(Math.random() * 20) + 10; // 10-30 characters
      let sequence = '';

      for (let i = 0; i < sequenceLength; i++) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        sequence += randomChar;

        // Add spaces occasionally for word separation
        if (i > 0 && i % 5 === 0 && Math.random() > 0.7) {
          sequence += ' ';
        }
      }

      setCurrentData(sequence.trim());
    } else if (syntaxs.length) {
      // Use syntax mode (sentences)
      const randomIndex = Math.floor(Math.random() * syntaxs.length);
      setCurrentData(syntaxs[randomIndex]);
    }
  }, [syntaxs, language, config.difficultyMode]);

  const handleRefresh = useCallback(() => {
    setTypedText("");
    setCorrectWords(0);
    setIncorrectWords(0);
    setStartTime(null);
    setTimeLeft(selectedTime);
    setCursorPosition({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
    setTestCompleted(false);
    setShowResults(false);
    setLastTestResult(null);
    getRandomData();

    // clear input ref
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [getRandomData, selectedTime]);

  // Fixed timer effect - removed saveTestResult dependency to prevent restarts
  useEffect(() => {
    if (startTime !== null && timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer reached 0, save results
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, testCompleted, timeLeft]);

  // Separate effect to handle test completion and result saving
  useEffect(() => {
    if (testCompleted && !config.practiceMode && startTime !== null && !showResults) {
      const totalWords = correctWords + incorrectWords;
      const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
      const testDuration = selectedTime - timeLeft;
      const charactersTyped = typedText.length;
      const errors = incorrectWords;

      const testResult = {
        wpm: calculateWPM(),
        accuracy,
        correctWords,
        incorrectWords,
        totalWords,
        testDuration,
        language: config.language.code,
        charactersTyped,
        errors,
      };

      addTestResult(testResult);
      setLastTestResult(testResult);
      setShowResults(true);
    }
  }, [testCompleted, config.practiceMode, startTime, showResults, correctWords, incorrectWords, selectedTime, timeLeft, typedText.length, calculateWPM, config.language.code, addTestResult]);

  useEffect(() => {
    setLanguage(config.language.code);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = "";
    }
  }, [config.language]);

  // Global keyboard event listener to focus input when not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if input is already focused or if it's a modifier key
      if (isFocused || e.ctrlKey || e.metaKey || e.altKey || testCompleted) {
        return;
      }

      // Don't interfere with other inputs or interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Focus the input and let the key event propagate naturally
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused, testCompleted]);

  useEffect(() => {
    if (config.practiceMode && currentData) {
      setActiveChar(currentData.split(" ")[0]?.[0] || null);
      setCursorPosition({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
    } else {
      setActiveChar("");
      setCursorPosition({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
    }
  }, [config.practiceMode, currentData, setActiveChar]);

  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    if (language) {
      const dataset = datasets[language];

      if (config.difficultyMode === 'chars' && dataset.chars) {
        // Generate random character sequences for character mode
        const generateCharSequence = () => {
          const chars = dataset.chars!;
          const sequenceLength = Math.floor(Math.random() * 20) + 10; // 10-30 characters
          let sequence = '';

          for (let i = 0; i < sequenceLength; i++) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            sequence += randomChar;

            // Add spaces occasionally for word separation
            if (i > 0 && i % 5 === 0 && Math.random() > 0.7) {
              sequence += ' ';
            }
          }

          return sequence.trim();
        };

        const charSequences = Array.from({ length: 10 }, generateCharSequence);
        setSyntaxs(charSequences);
        setCurrentData(charSequences[0]);
      } else {
        // Use syntax mode (sentences)
        setSyntaxs(dataset.syntaxs);
        const randomIndex = Math.floor(Math.random() * dataset.syntaxs.length);
        setCurrentData(dataset.syntaxs[randomIndex]);
      }
    }
  }, [language, config.difficultyMode]);

  useEffect(() => {
    // get active word index
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
  }, [typedText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat || e.nativeEvent.isComposing || !e.nativeEvent.isTrusted) {
      e.preventDefault();
      return;
    }

    const words = typedText.split(" ");
    const activeWordIndex = getActiveWordIndex();
    const activeWord = words[activeWordIndex] || "";

    // Handle Ctrl/Cmd + Backspace (word deletion)
    if (e.key === "Backspace" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      // Get current input value and cursor position
      const input = inputRef.current;
      if (!input) return;

      const cursorPos = input.selectionStart || 0;
      const text = input.value;

      // Find the start of the current word to delete
      let wordStart = cursorPos;
      while (wordStart > 0 && text[wordStart - 1] !== ' ') {
        wordStart--;
      }

      // Create new text without the deleted word
      const newText = text.slice(0, wordStart) + text.slice(cursorPos);

      // Update the input value and trigger change event
      input.value = newText;
      input.setSelectionRange(wordStart, wordStart);

      // Trigger the change event manually
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);

      return;
    }

    if (e.key === " " && activeWord.length === 0) {
      e.preventDefault();
    }

    if (e.key === " " && activeWord.length > 0) {
      setIsStartNextWord(true);
      // setIsComposing(true);
      // setComposeKey("{spacebar}");
      const currentWords = currentData?.split(" ") || [];
      if (activeWord === currentWords[activeWordIndex]) {
        setCorrectWords((prev) => prev + 1);
      } else {
        setIncorrectWords((prev) => prev + 1);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setTypedText(inputText);

    // Start timer on first keystroke
    if (startTime === null && inputText.length > 0) {
      setStartTime(Date.now());
    }

    if (config.difficultyMode === 'chars') {
      // Character mode logic
      const currentChars = currentData?.split("") || [];
      let correct = 0;
      let incorrect = 0;

      inputText.split("").forEach((char, index) => {
        if (char === currentChars[index]) {
          correct++;
        } else {
          incorrect++;
        }
      });

      setCorrectWords(correct);
      setIncorrectWords(incorrect);

      // Check if all characters are completed
      if (!config.practiceMode && !testCompleted && inputText.length >= currentChars.length) {
        setTestCompleted(true);
        return;
      }

      // Update activeChar for character mode
      const nextCharIndex = inputText.length;
      const activeChar = currentChars[nextCharIndex] || null;
      setActiveChar(activeChar);
    } else {
      // Sentence mode logic (original)
      const words = inputText.trim().split(" ");
      const currentWords = currentData?.split(" ") || [];

      let correct = 0;
      let incorrect = 0;

      words.forEach((word, index) => {
        if (word === currentWords[index]) {
          correct++;
        } else {
          incorrect++;
        }
      });

      setCorrectWords(correct);
      setIncorrectWords(incorrect);

      // Check if all words are completed
      const totalTypedWords = correct + incorrect;
      if (!config.practiceMode && !testCompleted && totalTypedWords >= currentWords.length) {
        setTestCompleted(true);
        return;
      }

      // Update activeChar and cursor position for sentence mode
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

      // Handle cursor position after space - move to next word's first character
      if (isStartNextWord && currentWords[activeWordIndex + 1]) {
        cursorWordIndex = activeWordIndex + 1;
        cursorCharIndex = 0;
        cursorIsSpacePosition = false;
        activeChar = currentWords[activeWordIndex + 1]?.[0] || null;
      }

      // Update cursor position state
      setCursorPosition({
        wordIndex: cursorWordIndex,
        charIndex: cursorCharIndex,
        isSpacePosition: cursorIsSpacePosition
      });

      setActiveChar(activeChar);
      setIsStartNextWord(false);

      if (e.nativeEvent.composed) {
        const composeKey = currentWords[activeWordIndex]?.[activeCharIndex - 1];
        if (isComposing) {
          setIsComposing(false);
        } else {
          setComposeKey(composeKey);
        }
      }

      if (config.practiceMode && activeCharIndex === 0) {
        setActiveChar(currentWords[activeWordIndex]?.[0] || null);
      }
    }
  };

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

  const handleFocusInput = () => {
    if (inputRef.current && !testCompleted) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Results Modal */}
      {showResults && lastTestResult && (
        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          result={lastTestResult}
          onStartNewTest={handleRefresh}
        />
      )}

      {/* Difficulty Mode Selector */}
      <div className="flex justify-center mb-4">
        <DataMode />
      </div>

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
        {/* Focus Overlay */}
        <FocusOverlay
          isVisible={!isFocused && !testCompleted}
          onClick={handleFocusInput}
        />

        <Input
          className=" opacity-0 absolute left-0"
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={testCompleted}
        />

        <div
          className={cn(
            "databox h-[120px] relative focus-visible:border-primary overflow-hidden"
            // `${lisuBosa.className}` // Temporarily disabled for offline build
          )}
        >
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

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <TooltipWrapper placement="center" tooltip="Select time">
            <TimerOptions
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              disabled={testCompleted}
            />
          </TooltipWrapper>
          <TooltipWrapper placement="center" tooltip="Select keyboard layout">
            <KeyboardSelector />
          </TooltipWrapper>
          <TooltipWrapper
            placement="center"
            tooltip="Enable/Disable practice mode"
          >
            <ModeToggler />
          </TooltipWrapper>
        </div>
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
      </div>
    </>
  );
}
