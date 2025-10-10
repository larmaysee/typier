"use client";

import {
  ProcessInputCommand,
  StartSessionCommand,
} from "@/application/commands/session.commands";
import { CompleteSessionCommandDTO } from "@/application/dto/typing-session.dto";
import { CompleteTypingSessionUseCase } from "@/application/use-cases/typing/complete-typing-session";
import { ProcessTypingInputUseCase } from "@/application/use-cases/typing/process-typing-input";
import { StartTypingSessionUseCase } from "@/application/use-cases/typing/start-typing-session";
import { useSiteConfig } from "@/components/site-config";
import { useTypingStatistics } from "@/components/typing-statistics";
import { LanguageCode } from "@/domain";
import {
  DifficultyLevel,
  TextType,
  TypingMode,
} from "@/domain/enums/typing-mode";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { useCallback, useEffect, useRef, useState } from "react";

export interface TypingSessionState {
  sessionId: string | null;
  currentData: string | null;
  language: string;
  typedText: string;
  correctWords: number;
  incorrectWords: number;
  startTime: number | null;
  isFocused: boolean;
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
  currentWPM: number;
  currentAccuracy: number;
  progress: number;
}

const initialState: TypingSessionState = {
  sessionId: null,
  currentData: null,
  language: "en",
  typedText: "",
  correctWords: 0,
  incorrectWords: 0,
  startTime: null,
  isFocused: false,
  selectedTime: 30,
  timeLeft: 30,
  cursorPosition: { wordIndex: 0, charIndex: 0, isSpacePosition: false },
  testCompleted: false,
  showResults: false,
  lastTestResult: null,
  currentWPM: 0,
  currentAccuracy: 100,
  progress: 0,
};

export function useTypingSession() {
  const { config } = useSiteConfig();
  const { addTestResult } = useTypingStatistics();
  const { resolve, serviceTokens } = useDependencyInjection();

  const [state, setState] = useState<TypingSessionState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null!);
  const textContainerRef = useRef<HTMLDivElement>(null!);

  // Resolve use cases from DI container
  const startSessionUseCase = resolve<StartTypingSessionUseCase>(
    serviceTokens.START_TYPING_SESSION_USE_CASE
  );
  const processInputUseCase = resolve<ProcessTypingInputUseCase>(
    serviceTokens.PROCESS_TYPING_INPUT_USE_CASE
  );
  const completeSessionUseCase = resolve<CompleteTypingSessionUseCase>(
    serviceTokens.COMPLETE_TYPING_SESSION_USE_CASE
  );

  // Map config difficulty mode to domain difficulty level
  const getDifficultyLevel = useCallback((): DifficultyLevel => {
    if (config.difficultyMode === "chars") return DifficultyLevel.EASY;
    return DifficultyLevel.MEDIUM; // Default for sentence mode
  }, [config.difficultyMode]);

  // Map config to typing mode
  const getTypingMode = useCallback((): TypingMode => {
    if (config.practiceMode) return TypingMode.PRACTICE;
    return TypingMode.NORMAL; // Default mode
  }, [config.practiceMode]);

  // Map config difficulty mode to text type
  const getTextType = useCallback((): TextType => {
    return config.difficultyMode === "chars"
      ? TextType.CHARS
      : TextType.SENTENCES;
  }, [config.difficultyMode]);

  // Start new session
  const startNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const command: StartSessionCommand = {
        userId: "anonymous", // TODO: Get from auth context when available
        mode: getTypingMode(),
        difficulty: getDifficultyLevel(),
        language: config.language.code as LanguageCode,
        duration: selectedTimeRef.current,
        textType: getTextType(),
      };

      const response = await startSessionUseCase.execute(command);

      setState((prev) => ({
        ...prev,
        sessionId: response.session.id,
        currentData: response.textContent,
        language: config.language.code,
        timeLeft: response.session.timeLeft, // Use the session's timeLeft from response
        typedText: "",
        correctWords: 0,
        incorrectWords: 0,
        startTime: null,
        testCompleted: false,
        showResults: false,
        currentWPM: 0,
        currentAccuracy: 100,
        progress: 0,
        cursorPosition: { wordIndex: 0, charIndex: 0, isSpacePosition: false },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start typing session";
      setError(errorMessage);
      console.error("Error starting session:", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startSessionUseCase,
    config.language.code,
    config.practiceMode,
    config.difficultyMode,
    // selectedTime now uses ref, getTypingMode, getDifficultyLevel, getTextType are stable functions
  ]);

  // Use ref to track the latest session ID without causing re-renders
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = state.sessionId;
  }, [state.sessionId]);

  // Process typing input
  const processInput = useCallback(async (input: string) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const command: ProcessInputCommand = {
        sessionId: currentSessionId,
        input,
        timestamp: Date.now(),
      };

      const sessionDto = await processInputUseCase.execute(command);

      setState((prev) => ({
        ...prev,
        typedText: sessionDto.currentInput,
        startTime: sessionDto.startTime,
        timeLeft: sessionDto.timeLeft,
        currentWPM: sessionDto.currentWPM,
        currentAccuracy: sessionDto.currentAccuracy,
        progress: sessionDto.progress,
        testCompleted: sessionDto.status === "completed",
        cursorPosition: {
          wordIndex: 0, // TODO: Map from sessionDto
          charIndex: sessionDto.currentInput.length,
          isSpacePosition: false,
        },
      }));

      // Ensure input field value is synchronized (for uncontrolled scenarios)
      if (
        inputRef.current &&
        inputRef.current.value !== sessionDto.currentInput
      ) {
        inputRef.current.value = sessionDto.currentInput;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process input";
      setError(errorMessage);
      console.error("Error processing input:", err);
    }
    // processInputUseCase is stable from DI container, doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use refs to track state values without causing dependency updates
  const typedTextRef = useRef<string>("");
  const languageRef = useRef<string>(config.language.code);
  const selectedTimeRef = useRef<number>(initialState.selectedTime);

  useEffect(() => {
    typedTextRef.current = state.typedText;
  }, [state.typedText]);

  useEffect(() => {
    languageRef.current = config.language.code;
  }, [config.language.code]);

  useEffect(() => {
    selectedTimeRef.current = state.selectedTime;
  }, [state.selectedTime]);

  // Complete session
  const completeSession = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const command: CompleteSessionCommandDTO = {
        sessionId: currentSessionId,
        finalInput: typedTextRef.current,
        completionTime: Date.now(),
        isManualCompletion: false,
      };

      const completedSession = await completeSessionUseCase.execute(command);
      const results = completedSession.test.results;

      // Calculate legacy format for existing components
      const totalWords = results.correctWords + results.incorrectWords;
      const testResult = {
        wpm: results.wpm,
        accuracy: results.accuracy,
        correctWords: results.correctWords,
        incorrectWords: results.incorrectWords,
        totalWords,
        testDuration: results.duration,
        language: languageRef.current,
        charactersTyped: results.charactersTyped,
        errors: results.errors,
      };

      addTestResult(testResult);

      setState((prev) => ({
        ...prev,
        lastTestResult: testResult,
        showResults: true,
        correctWords: results.correctWords,
        incorrectWords: results.incorrectWords,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete session";
      setError(errorMessage);
      console.error("Error completing session:", err);
    }
    // completeSessionUseCase and addTestResult are stable functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateWPM = useCallback(() => {
    return state.currentWPM;
  }, [state.currentWPM]);

  const getRandomData = useCallback(() => {
    // This now triggers a new session via the use case
    startNewSession();
  }, [startNewSession]);

  // Initialize session on mount or when config changes
  // Use a ref to track if we need to start a new session
  const configRef = useRef({
    language: config.language.code,
    difficultyMode: config.difficultyMode,
    practiceMode: config.practiceMode,
  });

  useEffect(() => {
    const hasConfigChanged =
      configRef.current.language !== config.language.code ||
      configRef.current.difficultyMode !== config.difficultyMode ||
      configRef.current.practiceMode !== config.practiceMode;

    if (hasConfigChanged) {
      configRef.current = {
        language: config.language.code,
        difficultyMode: config.difficultyMode,
        practiceMode: config.practiceMode,
      };
      startNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.language.code, config.difficultyMode, config.practiceMode]);

  // Update time left
  useEffect(() => {
    setState((prev) => ({ ...prev, timeLeft: state.selectedTime }));
  }, [state.selectedTime]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Practice mode character highlighting
  // TODO: Re-implement with clean architecture practice mode
  useEffect(() => {
    // Practice mode character highlighting removed temporarily
    // Will be re-added when practice mode is refactored to clean architecture
  }, [config.practiceMode, state.currentData]);

  // Timer countdown
  useEffect(() => {
    if (
      state.startTime !== null &&
      state.timeLeft > 0 &&
      !state.testCompleted
    ) {
      const timer = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.startTime, state.testCompleted, state.timeLeft]);

  // Auto-complete when time runs out
  useEffect(() => {
    if (state.timeLeft === 0 && !state.testCompleted && state.sessionId) {
      completeSession();
    }
    // completeSession is stable, doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeLeft, state.testCompleted, state.sessionId]);

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
    processInput,
    startNewSession,
    completeSession,
    error,
    isLoading,
  };
}
