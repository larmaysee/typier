"use client";

import { useCallback } from "react";
import { TypingSessionState } from "./use-typing-session";

interface UseSessionControlsProps {
  session: TypingSessionState;
  setState: React.Dispatch<React.SetStateAction<TypingSessionState>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  getRandomData: () => void;
  processInput: (input: string) => Promise<void>; // Required - no fallback
}

export function useSessionControls({
  session,
  setState,
  inputRef,
  getRandomData,
  processInput
}: UseSessionControlsProps) {
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

  const handleInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Delegate all input processing to the use case
    await processInput(value);
  }, [processInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat || e.nativeEvent.isComposing || !e.nativeEvent.isTrusted) {
      e.preventDefault();
      return;
    }

    // Keyboard events are handled - compose key tracking removed
    // This can be re-added when practice mode is reimplemented with clean architecture
  }, []);

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