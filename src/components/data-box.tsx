"use client";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePracticeMode } from "./pratice-mode";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { Lisu_Bosa } from "next/font/google";

const lisuBosa = Lisu_Bosa({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export type DataBoxType = {
  data: string;
};

export default function DataBox() {
  const { config } = useSiteConfig();
  const { setActiveChar } = usePracticeMode();
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

  useEffect(() => {
    setLanguage(config.language.code);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = "";
    }
  }, [config.language]);

  useEffect(() => {
    if (config.practiceMode && currentData) {
      setActiveChar(currentData.split(" ")[0]?.[0] || null);
    } else {
      setActiveChar("");
    }
  }, [config.practiceMode, currentData, setActiveChar]);

  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[]; }; } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    if (language) {
      setSyntaxs(datasets[language].syntaxs);
      const randomIndex = Math.floor(
        Math.random() * datasets[language].syntaxs.length
      );
      setCurrentData(datasets[language].syntaxs[randomIndex]);
    }
  }, [language]);


  useEffect(() => {
    // get active word index
    const activeWord = document.querySelector(".word.active") as HTMLElement;
    if (activeWord) {
      console.log();

      console.log("active word index");
    }
  }, [typedText]);

  const getRandomData = () => {
    if (syntaxs.length) {
      const randomIndex = Math.floor(Math.random() * syntaxs.length);
      setCurrentData(syntaxs[randomIndex]);
    }
  };

  const handleRefresh = () => {
    setTypedText("");
    setCorrectWords(0);
    setIncorrectWords(0);
    setStartTime(null);
    getRandomData();

    // clear input ref
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat) {
      e.preventDefault();
      return;
    }

    const words = typedText.split(" ");
    const activeWordIndex = getActiveWordIndex();
    const activeWord = words[activeWordIndex] || "";

    if (e.key === " " && activeWord.length === 0) {
      e.preventDefault();
    }

    if (e.key === " " && activeWord.length > 0) {
      setIsStartNextWord(true);
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

    if (startTime === null) {
      setStartTime(Date.now());
    }

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

    // Update activeChar
    const activeWordIndex = getActiveWordIndex();
    const activeCharIndex = words[activeWordIndex]?.length || 0;
    let activeChar =
      isStartNextWord ? currentWords[activeWordIndex + 1]?.[0] :
        currentWords[activeWordIndex]?.[activeCharIndex] || null;

    if (activeCharIndex === currentWords[activeWordIndex]?.length && !isStartNextWord) {
      activeChar = "{spacebar}";
      setIsStartNextWord(false);
    }

    setActiveChar(activeChar);

    setIsStartNextWord(false);

    if (config.practiceMode && activeCharIndex === 0) {
      setActiveChar(currentWords[activeWordIndex]?.[0] || null);
    }
  };

  const calculateWPM = () => {
    if (startTime === null) return 0;

    const elapsedTime = (Date.now() - startTime) / 1000 / 60; // in minutes
    return Math.round(correctWords / elapsedTime);
  };

  const getActiveWordIndex = () => {
    const words = typedText.split(" ");
    return words.length - 1;
  };

  const getLetterClass = (wordIndex: number, charIndex: number) => {
    const words = typedText.split(" ");
    const currentWords = currentData?.split(" ") || [];
    const activeWordIndex = getActiveWordIndex();
    const activeCharIndex = words[activeWordIndex]?.length || 0;

    let className = "";

    if (wordIndex < currentWords.length) {
      const currentWord = currentWords[wordIndex];
      const typedWord = words[wordIndex] || "";

      if (charIndex < currentWord.length) {
        const currentChar = currentWord[charIndex];
        const typedChar = typedWord[charIndex] || "";

        if (typedChar) {
          if (typedChar === currentChar) {
            className = "text-primary cursor";
          } else {
            className = "text-destructive cursor";
          }
        } else {
          className = "text-muted-foreground";
        }
      }
    }

    if (wordIndex === activeWordIndex && charIndex === activeCharIndex) {
      className += " active";
    }

    if (
      wordIndex === activeWordIndex &&
      charIndex === currentWords[wordIndex].length - 1 &&
      activeCharIndex === currentWords[wordIndex].length
    ) {
      className += " space-active";
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
      return "incorrect border-destructive typed";
    }
    return "";
  };

  return (
    <>
      <div
        className={cn(
          "bg-background databox rounded-lg h-[120px] relative focus-visible:border-primary overflow-auto",
          isFocused ? "focus" : ""
        )}
        tabIndex={0}
        onFocus={() => inputRef.current?.focus()}
        ref={textContainerRef}
      >
        <Input
          className=" opacity-0 absolute left-0"
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div
          className={cn(
            "flex flex-wrap pr-4 pb-4 text-xl",
            `${lisuBosa.className}`
          )}
        >
          <div className="words flex flex-wrap relative">
            {currentData?.split(" ").map((word, wordIndex) => (
              <div
                key={wordIndex}
                className={`word word-${wordIndex} flex px-1 border-b border-dashed h-[40px] ${getWordClass(
                  wordIndex
                )}${getActiveWordIndex() === wordIndex ? " active" : ""}`}
              >
                {word.split("").map((char, charIndex) => {
                  return (
                    <span
                      key={charIndex}
                      className={`letter letter-${charIndex} text-2xl relative ${getLetterClass(
                        wordIndex,
                        charIndex
                      )}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant={"outline"}
          size={"icon"}
          className="absolute bottom-1 right-1 h-6 w-6"
          onClick={handleRefresh}
        >
          <RotateCcw />
        </Button>
      </div>
    </>
  );
}
