"use client";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { Lisu_Bosa } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const lisuBosa = Lisu_Bosa({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export type DataBoxType = {
  data: string;
};

export default function DataBox({}) {
  const { config } = useSiteConfig();
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentData, setCurrentData] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [syntaxs, setSyntaxs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>("");

  const [correctWords, setCorrectWords] = useState<number>(0);
  const [incorrectWords, setIncorrectWords] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    setLanguage(config.language.code);
    if (inputRef.current) inputRef.current.focus();
  }, [config.language]);

  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[] } } = {
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

  const getRandomData = () => {
    if (syntaxs.length) {
      const randomIndex = Math.floor(Math.random() * syntaxs.length);
      setCurrentData(syntaxs[randomIndex]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat) {
      e.preventDefault();
      return;
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

    if (wordIndex < words.length) {
      const word = words[wordIndex];
      if (charIndex < word.length) {
        const char = word[charIndex];
        if (char === currentWords[wordIndex][charIndex]) {
          className = "text-green-500";
        } else {
          className = "text-red-500";
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

  return (
    <>
      <Input
        className=""
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        ref={inputRef}
      />
      <div
        className={cn(
          "bg-background rounded-lg h-[120px] p-4 border relative focus-visible:border-primary"
        )}
        tabIndex={0}
        onFocus={() => inputRef.current?.focus()}
      >
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
                className={`word px-1${
                  getActiveWordIndex() === wordIndex ? " active bg-muted" : ""
                }`}
              >
                {word.split("").map((char, charIndex) => {
                  return (
                    <span
                      key={charIndex}
                      className={`letter text-2xl relative ${getLetterClass(
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
          onClick={getRandomData}
        >
          <RotateCcw />
        </Button>
      </div>
      <div className="wpm-display">
        WPM: {calculateWPM()} Incorrect: {incorrectWords}
      </div>
    </>
  );
}
