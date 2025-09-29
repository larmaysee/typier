"use client";

import { useCallback, useRef } from "react";

interface SessionControlsState {
  isFocused: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  textContainerRef: React.RefObject<HTMLDivElement>;
}

interface SessionControlsActions {
  setIsFocused: (focused: boolean) => void;
  focusInput: () => void;
}

export function useSessionControls(
  isFocused: boolean,
  setIsFocused: (focused: boolean) => void,
  testCompleted: boolean
): SessionControlsState & SessionControlsActions {
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const focusInput = useCallback(() => {
    if (inputRef.current && !testCompleted) {
      inputRef.current.focus();
    }
  }, [testCompleted]);

  return {
    // State
    isFocused,
    inputRef,
    textContainerRef,
    
    // Actions
    setIsFocused,
    focusInput
  };
}