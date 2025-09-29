"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSiteConfig } from "@/components/site-config";
import { usePracticeMode } from "@/components/pratice-mode";
import { useTypingStatistics } from "@/components/typing-statistics";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";

export interface TypingSessionState {
  currentData: string | null;
  language: string;
  syntaxs: string[];
  typedText: string;
  correctWords: number;
  incorrectWords: number;
  startTime: number | null;
  isFocused: boolean;
  isStartNextWord: boolean;
  isComposing: boolean;
  selectedTime: number;
  timeLeft: number;
  cursorPosition: {
    wordIndex: number;
    charIndex: number;
    isSpacePosition: boolean;
  };
  testCompleted: boolean;
  showResults: boolean;
  lastTestResult: {
    wpm: number;
    accuracy: number;
    correctWords: number;
    incorrectWords: number;
    totalWords: number;
    testDuration: number;
    language: string;
    charactersTyped: number;
    errors: number;
  } | null;
}

const initialState: TypingSessionState = {
  currentData: null,
  language: "en",
  syntaxs: [],
  typedText: "",
  correctWords: 0,
  incorrectWords: 0,
  startTime: null,
  isFocused: false,
  isStartNextWord: false,
  isComposing: false,
  selectedTime: 30,
  timeLeft: 30,
  cursorPosition: { wordIndex: 0, charIndex: 0, isSpacePosition: false },
  testCompleted: false,
  showResults: false,
  lastTestResult: null,
};

export function useTypingSession() {
  const { config } = useSiteConfig();
  const { setActiveChar, setComposeKey } = usePracticeMode();
  const { addTestResult } = useTypingStatistics();
  
  const [state, setState] = useState<TypingSessionState>(initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Update language when config changes
  useEffect(() => {
    setState(prev => ({ ...prev, language: config.language.code }));
  }, [config.language.code]);

  const calculateWPM = useCallback(() => {
    if (state.startTime === null) return 0;
    const elapsedTime = (state.selectedTime - state.timeLeft) / 60;
    return elapsedTime > 0 ? Math.round(state.correctWords / elapsedTime) : 0;
  }, [state.startTime, state.selectedTime, state.timeLeft, state.correctWords]);

  const getRandomData = useCallback(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    const dataset = datasets[state.language];
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

      setState(prev => ({ ...prev, currentData: sequence.trim() }));
    } else if (state.syntaxs.length) {
      const randomIndex = Math.floor(Math.random() * state.syntaxs.length);
      setState(prev => ({ ...prev, currentData: state.syntaxs[randomIndex] }));
    }
  }, [state.syntaxs, state.language, config.difficultyMode]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[]; chars?: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    if (state.language) {
      const dataset = datasets[state.language];

      if (config.difficultyMode === 'chars' && dataset.chars) {
        const generateCharSequence = () => {
          const chars = dataset.chars!;
          const sequenceLength = Math.floor(Math.random() * 20) + 10;
          let sequence = '';

          for (let i = 0; i < sequenceLength; i++) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            sequence += randomChar;

            if (i > 0 && i % 5 === 0 && Math.random() > 0.7) {
              sequence += ' ';
            }
          }

          return sequence.trim();
        };

        const charSequences = Array.from({ length: 10 }, generateCharSequence);
        setState(prev => ({ 
          ...prev, 
          syntaxs: charSequences, 
          currentData: charSequences[0] 
        }));
      } else {
        const randomIndex = Math.floor(Math.random() * dataset.syntaxs.length);
        setState(prev => ({ 
          ...prev, 
          syntaxs: dataset.syntaxs, 
          currentData: dataset.syntaxs[randomIndex] 
        }));
      }
    }
  }, [state.language, config.difficultyMode]);

  // Timer management
  useEffect(() => {
    if (state.startTime !== null && state.timeLeft > 0 && !state.testCompleted) {
      const timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft <= 1 ? 0 : prev.timeLeft - 1,
          testCompleted: prev.timeLeft <= 1 ? true : prev.testCompleted
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.startTime, state.testCompleted, state.timeLeft]);

  // Test completion handling
  useEffect(() => {
    if (state.testCompleted && !config.practiceMode && state.startTime !== null && !state.showResults) {
      const totalWords = state.correctWords + state.incorrectWords;
      const accuracy = totalWords > 0 ? Math.round((state.correctWords / totalWords) * 100) : 0;
      const testDuration = state.selectedTime - state.timeLeft;
      const charactersTyped = state.typedText.length;
      const errors = state.incorrectWords;

      const testResult = {
        wpm: calculateWPM(),
        accuracy,
        correctWords: state.correctWords,
        incorrectWords: state.incorrectWords,
        totalWords,
        testDuration,
        language: config.language.code,
        charactersTyped,
        errors,
      };

      addTestResult(testResult);
      setState(prev => ({ 
        ...prev, 
        lastTestResult: testResult, 
        showResults: true 
      }));
    }
  }, [state.testCompleted, config.practiceMode, state.startTime, state.showResults, state.correctWords, state.incorrectWords, state.selectedTime, state.timeLeft, state.typedText.length, calculateWPM, config.language.code, addTestResult]);

  return {
    session: state,
    textContent: state.currentData,
    isFocused: state.isFocused,
    testCompleted: state.testCompleted,
    showResults: state.showResults,
    lastTestResult: state.lastTestResult,
    inputRef,
    textContainerRef,
    calculateWPM,
    getRandomData,
    setState,
    error: null, // TODO: Add error handling
    isLoading: false, // TODO: Add loading state
  };
}