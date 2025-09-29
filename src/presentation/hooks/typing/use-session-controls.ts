"use client";

import { useCallback } from "react";
import { useSiteConfig } from "@/components/site-config";
import { usePracticeMode } from "@/components/pratice-mode";
import { TypingSessionState } from "./use-typing-session";

interface UseSessionControlsProps {
  session: TypingSessionState;
  setState: React.Dispatch<React.SetStateAction<TypingSessionState>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  getRandomData: () => void;
}

export function useSessionControls({
  session,
  setState,
  inputRef,
  getRandomData
}: UseSessionControlsProps) {
  const { config } = useSiteConfig();
  const { setActiveChar, setComposeKey } = usePracticeMode();

  const getActiveWordIndex = useCallback(() => {
    const words = session.typedText.split(" ");
    return words.length - 1;
  }, [session.typedText]);

  const getLetterClass = useCallback((wordIndex: number, charIndex: number) => {
    const words = session.typedText.split(" ");
    const currentWords = session.currentData?.split(" ") || [];

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
  }, [session.typedText, session.currentData]);

  const getWordClass = useCallback((wordIndex: number) => {
    const words = session.typedText.split(" ");
    const currentWords = session.currentData?.split(" ") || [];
    const typedWord = words[wordIndex] || "";
    
    if (typedWord === currentWords[wordIndex] && wordIndex < words.length - 1) {
      return "text-green-500";
    }
    return "";
  }, [session.typedText, session.currentData]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    setState(prev => ({
      ...prev,
      typedText: value,
      startTime: prev.startTime ?? Date.now()
    }));

    // Update word statistics
    if (session.currentData) {
      const words = value.split(" ");
      const currentWords = session.currentData.split(" ");
      
      let correct = 0;
      let incorrect = 0;

      words.forEach((word, index) => {
        if (currentWords[index]) {
          if (word === currentWords[index]) {
            correct++;
          } else if (word.length > 0) {
            incorrect++;
          }
        }
      });

      setState(prev => ({
        ...prev,
        correctWords: correct,
        incorrectWords: incorrect
      }));

      // Check if test is completed
      const totalTypedWords = correct + incorrect;
      if (!config.practiceMode && !session.testCompleted && totalTypedWords >= currentWords.length) {
        setState(prev => ({ ...prev, testCompleted: true }));
        return;
      }

      // Update cursor position and active character
      const activeWordIndex = getActiveWordIndex();
      const activeCharIndex = words[activeWordIndex]?.length || 0;
      let activeChar = currentWords[activeWordIndex]?.[activeCharIndex] || null;

      const isSpacePosition = activeCharIndex === currentWords[activeWordIndex]?.length && !session.isStartNextWord;

      let cursorWordIndex = activeWordIndex;
      let cursorCharIndex = activeCharIndex;
      let cursorIsSpacePosition = isSpacePosition;

      if (isSpacePosition) {
        activeChar = "spacebar";
        setState(prev => ({ ...prev, isStartNextWord: false }));
      }

      if (session.isStartNextWord && currentWords[activeWordIndex + 1]) {
        cursorWordIndex = activeWordIndex + 1;
        cursorCharIndex = 0;
        cursorIsSpacePosition = false;
        activeChar = currentWords[activeWordIndex + 1]?.[0] || null;
      }

      setState(prev => ({
        ...prev,
        cursorPosition: {
          wordIndex: cursorWordIndex,
          charIndex: cursorCharIndex,
          isSpacePosition: cursorIsSpacePosition
        },
        isStartNextWord: false
      }));

      setActiveChar(activeChar);

      if (config.practiceMode && activeCharIndex === 0) {
        setActiveChar(currentWords[activeWordIndex]?.[0] || null);
      }
    }
  }, [session, setState, config.practiceMode, getActiveWordIndex, setActiveChar]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat || e.nativeEvent.isComposing || !e.nativeEvent.isTrusted) {
      e.preventDefault();
      return;
    }

    // Handle compose key events
    if (e.nativeEvent.composed) {
      const words = session.typedText.split(" ");
      const activeWordIndex = getActiveWordIndex();
      const activeCharIndex = words[activeWordIndex]?.length || 0;
      const currentWords = session.currentData?.split(" ") || [];
      const composeKey = currentWords[activeWordIndex]?.[activeCharIndex - 1];
      
      if (session.isComposing) {
        setState(prev => ({ ...prev, isComposing: false }));
      } else {
        setComposeKey(composeKey);
      }
    }
  }, [session, getActiveWordIndex, setComposeKey, setState]);

  const handleFocus = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: true }));
  }, [setState]);

  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, isFocused: false }));
  }, [setState]);

  const handleRefresh = useCallback(() => {
    setState({
      ...session,
      typedText: "",
      correctWords: 0,
      incorrectWords: 0,
      startTime: null,
      timeLeft: session.selectedTime,
      cursorPosition: { wordIndex: 0, charIndex: 0, isSpacePosition: false },
      testCompleted: false,
      showResults: false,
      lastTestResult: null,
    });
    getRandomData();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [session, setState, getRandomData, inputRef]);

  const closeResults = useCallback(() => {
    setState(prev => ({ ...prev, showResults: false }));
  }, [setState]);

  const setSelectedTime = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      selectedTime: time,
      timeLeft: time,
      testCompleted: false,
      showResults: false
    }));
  }, [setState]);

  return {
    handleInput,
    handleKeyDown,
    handleFocus,
    handleBlur,
    handleRefresh,
    closeResults,
    setSelectedTime,
    getActiveWordIndex,
    getLetterClass,
    getWordClass
  };
}