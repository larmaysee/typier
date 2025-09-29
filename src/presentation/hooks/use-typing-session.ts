"use client";

import { useCallback, useEffect, useState } from "react";
import { useSiteConfig } from "@/components/site-config";
import { usePracticeMode } from "@/components/pratice-mode";
import { useTypingStatistics } from "@/components/typing-statistics";

// Data imports
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";

interface TestResult {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  testDuration: number;
  language: string;
  charactersTyped: number;
  errors: number;
}

interface TypingSessionState {
  currentData: string | null;
  language: string;
  syntaxs: string[];
  typedText: string;
  correctWords: number;
  incorrectWords: number;
  startTime: number | null;
  selectedTime: number;
  timeLeft: number;
  testCompleted: boolean;
  showResults: boolean;
  cursorPosition: {
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  };
  isStartNextWord: boolean;
  lastTestResult: TestResult | null;
}

interface TypingSessionActions {
  getRandomData: () => void;
  calculateWPM: () => number;
  handleRefresh: () => void;
  setCurrentData: (data: string | null) => void;
  setLanguage: (lang: string) => void;
  setTypedText: (text: string) => void;
  setCorrectWords: (count: number) => void;
  setIncorrectWords: (count: number) => void;
  setStartTime: (time: number | null) => void;
  setSelectedTime: (time: number) => void;
  setTimeLeft: (time: number) => void;
  setTestCompleted: (completed: boolean) => void;
  setShowResults: (show: boolean) => void;
  setCursorPosition: (position: {
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  }) => void;
  setIsStartNextWord: (value: boolean) => void;
  setLastTestResult: (result: TestResult | null) => void;
}

export function useTypingSession(): TypingSessionState & TypingSessionActions {
  const { config } = useSiteConfig();
  const { setActiveChar } = usePracticeMode();
  const { addTestResult } = useTypingStatistics();

  // Core session state
  const [currentData, setCurrentData] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [syntaxs, setSyntaxs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>("");
  
  // Typing metrics
  const [correctWords, setCorrectWords] = useState<number>(0);
  const [incorrectWords, setIncorrectWords] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Timer and test state
  const [selectedTime, setSelectedTime] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(selectedTime);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Cursor and interaction state
  const [cursorPosition, setCursorPosition] = useState<{
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  }>({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
  const [isStartNextWord, setIsStartNextWord] = useState<boolean>(false);
  
  // Test result state
  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null);

  // Data generation logic
  const getRandomData = useCallback(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    const dataset = datasets[language];
    if (!dataset) return;

    if (config.difficultyMode === 'chars' && dataset.chars) {
      const chars = dataset.chars;
      const sequenceLength = Math.floor(Math.random() * 20) + 10;
      let sequence = '';

      for (let i = 0; i < sequenceLength; i++) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        sequence += randomChar;

        if (i > 0 && i % 5 === 0 && Math.random() > 0.7) {
          sequence += ' ';
        }
      }

      setCurrentData(sequence.trim());
    } else if (syntaxs.length) {
      const randomIndex = Math.floor(Math.random() * syntaxs.length);
      setCurrentData(syntaxs[randomIndex]);
    }
  }, [syntaxs, language, config.difficultyMode]);

  // WPM calculation
  const calculateWPM = useCallback(() => {
    if (startTime === null) return 0;
    const elapsedTime = (selectedTime - timeLeft) / 60;
    return elapsedTime > 0 ? Math.round(correctWords / elapsedTime) : 0;
  }, [startTime, selectedTime, timeLeft, correctWords]);

  // Session reset logic
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
  }, [getRandomData, selectedTime]);

  // Timer management
  useEffect(() => {
    setTimeLeft(selectedTime);
    setTestCompleted(false);
    setShowResults(false);
  }, [selectedTime]);

  // Initialize data
  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    if (language) {
      const dataset = datasets[language];
      if (dataset) {
        setSyntaxs(dataset.syntaxs);
        getRandomData();
      }
    }

    setLanguage(config.language.code);
  }, [language, config.language.code, getRandomData]);

  // Practice mode effects
  useEffect(() => {
    if (config.practiceMode && currentData) {
      setActiveChar(currentData.split(" ")[0]?.[0] || null);
      setCursorPosition({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
    } else {
      setActiveChar("");
      setCursorPosition({ wordIndex: 0, charIndex: 0, isSpacePosition: false });
    }
  }, [config.practiceMode, currentData, setActiveChar]);

  // Timer effect
  useEffect(() => {
    if (startTime !== null && timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, testCompleted, timeLeft]);

  // Test completion effect
  useEffect(() => {
    if (testCompleted && startTime !== null) {
      const saveTestResult = () => {
        const testDuration = selectedTime;
        const charactersTyped = typedText.length;
        const wpm = calculateWPM();
        const totalWords = correctWords + incorrectWords;
        const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

        const result = {
          wpm,
          accuracy: Math.round(accuracy * 100) / 100,
          correctWords,
          incorrectWords,
          totalWords,
          testDuration,
          language,
          charactersTyped,
          errors: incorrectWords
        };

        setLastTestResult(result);
        setShowResults(true);
        addTestResult(result);
      };

      saveTestResult();
    }
  }, [testCompleted, startTime, selectedTime, typedText.length, calculateWPM, correctWords, incorrectWords, language, addTestResult]);

  return {
    // State
    currentData,
    language,
    syntaxs,
    typedText,
    correctWords,
    incorrectWords,
    startTime,
    selectedTime,
    timeLeft,
    testCompleted,
    showResults,
    cursorPosition,
    isStartNextWord,
    lastTestResult,
    
    // Actions
    getRandomData,
    calculateWPM,
    handleRefresh,
    setCurrentData,
    setLanguage,
    setTypedText,
    setCorrectWords,
    setIncorrectWords,
    setStartTime,
    setSelectedTime,
    setTimeLeft,
    setTestCompleted,
    setShowResults,
    setCursorPosition,
    setIsStartNextWord,
    setLastTestResult
  };
}