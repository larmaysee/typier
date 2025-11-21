"use client";

import GraphemeSplitter from "grapheme-splitter";
import { useCallback } from "react";
import { TypingSessionState } from "./use-typing-session";

// Create a single instance of GraphemeSplitter for reuse
const splitter = new GraphemeSplitter();

interface UseSessionControlsProps {
  session: TypingSessionState;
  setState: React.Dispatch<React.SetStateAction<TypingSessionState>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  getRandomData: () => void;
  processInput: (input: string) => Promise<void>; // Required - no fallback
  allowDeletion?: boolean; // Whether to allow backspace/delete keys
  onTimeChange?: () => void; // Callback to restart session when time changes
  onWordCountChange?: () => void; // Callback to restart session when word count changes
  onManualComplete?: () => void; // Callback to manually complete the session
  onConfigUpdate?: (updates: { selectedTime?: number; selectedWords?: number }) => void; // Callback to update config
}

export function useSessionControls({
  session,
  setState,
  inputRef,
  getRandomData,
  processInput,
  allowDeletion = true,
  onTimeChange,
  onWordCountChange,
  onManualComplete,
  onConfigUpdate,
}: UseSessionControlsProps) {
  const getActiveWordIndex = useCallback(() => {
    const words = session.typedText.split(" ");
    return words.length - 1;
  }, [session.typedText]);

  const getLetterClass = useCallback(
    (wordIndex: number, charIndex: number) => {
      const currentWords = session.currentData?.split(" ").map((word) => splitter.splitGraphemes(word)) || [];

      let className = "";

      if (wordIndex < currentWords.length) {
        const currentWordClusters = currentWords[wordIndex];
        const typedWords = session.typedText.split(" ").map((word) => splitter.splitGraphemes(word));
        const typedWordClusters = typedWords[wordIndex] || [];

        if (charIndex < currentWordClusters.length) {
          const currentChar = currentWordClusters[charIndex];
          const typedChar = typedWordClusters[charIndex] || "";

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
    },
    [session.typedText, session.currentData]
  );

  const getWordClass = useCallback(
    (wordIndex: number) => {
      const words = session.typedText.split(" ");
      const currentWords = session.currentData?.split(" ") || [];
      const typedWord = words[wordIndex] || "";

      if (typedWord === currentWords[wordIndex] && wordIndex < words.length - 1) {
        return "text-green-500";
      }
      return "";
    },
    [session.typedText, session.currentData]
  );

  const handleInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Delegate all input processing to the use case
      await processInput(value);
    },
    [processInput]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.repeat || e.nativeEvent.isComposing || !e.nativeEvent.isTrusted) {
        e.preventDefault();
        return;
      }

      // Handle ESC key to manually complete the session
      if (e.key === "Escape") {
        e.preventDefault();
        if (onManualComplete && session.startTime !== null) {
          onManualComplete();
        }
        return;
      }

      // Block backspace/delete keys if allowDeletion is false
      if (!allowDeletion && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
        return;
      }

      const words = session.typedText.split(" ");
      const activeWordIndex = getActiveWordIndex();
      const activeWord = words[activeWordIndex] || "";

      // Handle Ctrl/Cmd + Backspace (word deletion) - only if deletion allowed
      if (e.key === "Backspace" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();

        // Get current input value and cursor position
        const input = e.target as HTMLInputElement;
        if (!input) return;

        const cursorPos = input.selectionStart || 0;
        const text = input.value;

        // Find the start of the current word to delete
        let wordStart = cursorPos;
        while (wordStart > 0 && text[wordStart - 1] !== " ") {
          wordStart--;
        }

        // Create new text without the deleted word
        const newText = text.slice(0, wordStart) + text.slice(cursorPos);

        // Update the input value and trigger change event
        input.value = newText;
        input.setSelectionRange(wordStart, wordStart);

        // Trigger the change event manually
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);

        return;
      }

      // Prevent space if current word is empty
      if (e.key === " " && activeWord.length === 0) {
        e.preventDefault();
      }

      // Handle space key for word completion tracking
      if (e.key === " " && activeWord.length > 0) {
        const currentWords = session.currentData?.split(" ") || [];
        if (activeWord === currentWords[activeWordIndex]) {
          setState((prev) => ({ ...prev, correctWords: prev.correctWords + 1 }));
        } else {
          setState((prev) => ({ ...prev, incorrectWords: prev.incorrectWords + 1 }));
        }
      }
    },
    [
      session.typedText,
      session.currentData,
      session.startTime,
      getActiveWordIndex,
      setState,
      allowDeletion,
      onManualComplete,
    ]
  );

  const handleFocus = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: true }));
  }, [setState]);

  const handleBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: false }));
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
    setState((prev) => ({ ...prev, showResults: false }));
  }, [setState]);

  const setSelectedTime = useCallback(
    (time: number) => {
      setState((prev) => ({
        ...prev,
        selectedTime: time,
        timeLeft: time,
        testCompleted: false,
        showResults: false,
      }));

      // Save to config
      if (onConfigUpdate) {
        onConfigUpdate({ selectedTime: time });
      }

      // Restart the session with new time
      if (onTimeChange) {
        // Use setTimeout to ensure state update completes first
        setTimeout(() => {
          onTimeChange();
        }, 0);
      }
    },
    [setState, onTimeChange, onConfigUpdate]
  );

  const setSelectedWords = useCallback(
    (words: number) => {
      setState((prev) => ({
        ...prev,
        selectedWords: words,
        testCompleted: false,
        showResults: false,
      }));

      // Save to config
      if (onConfigUpdate) {
        onConfigUpdate({ selectedWords: words });
      }

      // Restart the session with new word count
      if (onWordCountChange) {
        // Use setTimeout to ensure state update completes first
        setTimeout(() => {
          onWordCountChange();
        }, 0);
      }
    },
    [setState, onWordCountChange, onConfigUpdate]
  );

  return {
    handleInput,
    handleKeyDown,
    handleFocus,
    handleBlur,
    handleRefresh,
    closeResults,
    setSelectedTime,
    setSelectedWords,
    getActiveWordIndex,
    getLetterClass,
    getWordClass,
  };
}
