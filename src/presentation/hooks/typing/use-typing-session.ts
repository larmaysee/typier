"use client";

import { ProcessInputCommand, StartSessionCommand } from "@/application/commands/session.commands";
import { CompleteSessionCommandDTO } from "@/application/dto/typing-session.dto";
import { CompleteTypingSessionUseCase } from "@/application/use-cases/typing/complete-typing-session";
import { ProcessTypingInputUseCase } from "@/application/use-cases/typing/process-typing-input";
import { StartTypingSessionUseCase } from "@/application/use-cases/typing/start-typing-session";
import { useAuth } from "@/components/auth-provider";
import { useSiteConfig } from "@/components/site-config";
import { useTypingStatistics } from "@/components/typing-statistics";
import { LanguageCode } from "@/domain";
import { DifficultyLevel, TextType, TypingMode } from "@/domain/enums/typing-mode";
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
  const { user } = useAuth();

  const [state, setState] = useState<TypingSessionState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null!);
  const textContainerRef = useRef<HTMLDivElement>(null!);

  // Resolve use cases from DI container
  const startSessionUseCase = resolve<StartTypingSessionUseCase>(serviceTokens.START_TYPING_SESSION_USE_CASE);
  const processInputUseCase = resolve<ProcessTypingInputUseCase>(serviceTokens.PROCESS_TYPING_INPUT_USE_CASE);
  const completeSessionUseCase = resolve<CompleteTypingSessionUseCase>(serviceTokens.COMPLETE_TYPING_SESSION_USE_CASE);

  // Get difficulty level from config
  const getDifficultyLevel = useCallback((): DifficultyLevel => {
    return config.difficultyLevel;
  }, [config.difficultyLevel]);

  // Map config to typing mode
  const getTypingMode = useCallback((): TypingMode => {
    if (config.practiceMode) return TypingMode.PRACTICE;
    return TypingMode.NORMAL; // Default mode
  }, [config.practiceMode]);

  // Get text type from config
  const getTextType = useCallback((): TextType => {
    return config.textType;
  }, [config.textType]);

  // Start new session
  const startNewSession = useCallback(async () => {
    try {
      console.log("🚀 [startNewSession] Starting new session with config:", {
        language: config.language.code,
        practiceMode: config.practiceMode,
        textType: config.textType,
        difficultyLevel: config.difficultyLevel,
        selectedTime: selectedTimeRef.current,
      });

      setIsLoading(true);
      setError(null);

      const command: StartSessionCommand = {
        userId: user?.id || "anonymous",
        mode: getTypingMode(),
        difficulty: getDifficultyLevel(),
        language: config.language.code as LanguageCode,
        duration: selectedTimeRef.current,
        textType: getTextType(),
      };

      console.log("🚀 [startNewSession] Executing StartSessionCommand:", command);

      const response = await startSessionUseCase.execute(command);

      console.log("✅ [startNewSession] Session started successfully:", {
        sessionId: response.session.id,
        textContentLength: response.textContent?.length,
        textPreview: response.textContent?.substring(0, 100) + "...",
        timeLeft: response.session.timeLeft,
      });

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

      console.log("✅ [startNewSession] State updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start typing session";
      setError(errorMessage);
      console.error("❌ [startNewSession] Error starting session:", err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startSessionUseCase,
    config.language.code,
    config.practiceMode,
    config.textType,
    config.difficultyLevel,
    user?.id,
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

      // Calculate proper cursor position based on current input
      const calculateCursorPosition = (input: string, textContent: string | null) => {
        if (!textContent) {
          return { wordIndex: 0, charIndex: 0, isSpacePosition: false };
        }

        const words = textContent.split(" ");

        // If input ends with space, we're at the beginning of next word
        if (input.endsWith(" ")) {
          // Count spaces to determine which word we're on
          const spaceCount = (input.match(/ /g) || []).length;
          const nextWordIndex = spaceCount;
          return {
            wordIndex: Math.min(nextWordIndex, words.length - 1),
            charIndex: 0,
            isSpacePosition: false,
          };
        }

        // Split and filter out empty strings to handle trailing spaces correctly
        const typedWords = input.split(" ").filter((word, index, arr) => index < arr.length - 1 || word !== "");

        // Current word being typed
        const currentWordIndex = Math.max(0, typedWords.length - 1);
        const currentTypedWord = typedWords[currentWordIndex] || "";
        const currentTargetWord = words[currentWordIndex] || "";

        // If we're at the end of a word and it matches the target word
        if (currentTypedWord.length === currentTargetWord.length && currentTypedWord === currentTargetWord) {
          return {
            wordIndex: currentWordIndex,
            charIndex: currentTypedWord.length,
            isSpacePosition: true,
          };
        }

        // Otherwise, we're typing within the current word
        return {
          wordIndex: currentWordIndex,
          charIndex: currentTypedWord.length,
          isSpacePosition: false,
        };
      };

      setState((prev) => ({
        ...prev,
        typedText: sessionDto.currentInput,
        startTime: sessionDto.startTime,
        timeLeft: sessionDto.timeLeft,
        currentWPM: sessionDto.currentWPM,
        currentAccuracy: sessionDto.currentAccuracy,
        progress: sessionDto.progress,
        testCompleted: sessionDto.status === "completed",
        cursorPosition: calculateCursorPosition(sessionDto.currentInput, prev.currentData),
      }));

      // If session just completed, trigger completion logic
      if (sessionDto.status === "completed" && !state.testCompleted) {
        console.log("🏁 Session completed during input processing, triggering completion...");
        // Use setTimeout to ensure state update happens first
        setTimeout(() => {
          completeSession();
        }, 0);
      }

      // Ensure input field value is synchronized (for uncontrolled scenarios)
      if (inputRef.current && inputRef.current.value !== sessionDto.currentInput) {
        inputRef.current.value = sessionDto.currentInput;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process input";
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
    if (!currentSessionId) {
      console.log("❌ Complete session called but no session ID");
      return;
    }

    try {
      console.log("🏁 Starting session completion...", {
        sessionId: currentSessionId,
        finalInput: typedTextRef.current,
        inputLength: typedTextRef.current.length,
        stateTypedText: state.typedText,
        currentData: state.currentData?.substring(0, 50) + "...",
      });

      // Use state.typedText as fallback if ref is empty
      const finalInput = typedTextRef.current || state.typedText || "";

      console.log("🔄 Using finalInput:", { finalInput, length: finalInput.length });

      const command: CompleteSessionCommandDTO = {
        sessionId: currentSessionId,
        finalInput,
        completionTime: Date.now(),
        isManualCompletion: false,
      };

      const completedSession = await completeSessionUseCase.execute(command);
      const results = completedSession.test.results;

      console.log("✅ Session completed successfully", {
        wpm: results.wpm,
        accuracy: results.accuracy,
        correctWords: results.correctWords,
        incorrectWords: results.incorrectWords,
        duration: results.duration,
        charactersTyped: results.charactersTyped,
        errors: results.errors,
        rawResults: results,
      });

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

      console.log("📊 Test result calculated", testResult);

      console.log("🔄 About to update state with:", {
        showResults: true,
        testCompleted: true,
        lastTestResult: testResult,
      });

      addTestResult(testResult);

      setState((prev) => ({
        ...prev,
        lastTestResult: testResult,
        showResults: true,
        testCompleted: true,
        correctWords: results.correctWords,
        incorrectWords: results.incorrectWords,
      }));

      console.log("✅ State updated - should show results modal now");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete session";
      setError(errorMessage);
      console.error("❌ Error completing session:", err);
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
    textType: config.textType,
    difficultyLevel: config.difficultyLevel,
    practiceMode: config.practiceMode,
  });

  useEffect(() => {
    const hasConfigChanged =
      configRef.current.language !== config.language.code ||
      configRef.current.textType !== config.textType ||
      configRef.current.difficultyLevel !== config.difficultyLevel ||
      configRef.current.practiceMode !== config.practiceMode;

    if (hasConfigChanged) {
      configRef.current = {
        language: config.language.code,
        textType: config.textType,
        difficultyLevel: config.difficultyLevel,
        practiceMode: config.practiceMode,
      };
      startNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.language.code, config.textType, config.difficultyLevel, config.practiceMode]);

  // Initialize session on initial mount
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current && !state.sessionId) {
      console.log("🚀 Starting initial session on mount...");
      hasMountedRef.current = true;
      startNewSession();
    }
  }, [startNewSession, state.sessionId]);

  // Update time left (in practice mode, time is optional)
  useEffect(() => {
    // In practice mode, we still track time but don't enforce limits
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

  // Timer countdown (optional in practice mode)
  useEffect(() => {
    // Only run timer if not in practice mode, or if user has explicitly started timing
    const shouldRunTimer = !config.practiceMode;

    if (shouldRunTimer && state.startTime !== null && state.timeLeft > 0 && !state.testCompleted) {
      const timer = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.startTime, state.testCompleted, state.timeLeft, config.practiceMode]);

  // Auto-complete when time runs out (not in practice mode)
  useEffect(() => {
    const shouldAutoComplete = !config.practiceMode;

    console.log("⏰ Timer check:", {
      shouldAutoComplete,
      timeLeft: state.timeLeft,
      testCompleted: state.testCompleted,
      sessionId: state.sessionId,
      practiceMode: config.practiceMode,
      showResults: state.showResults,
      lastTestResult: !!state.lastTestResult,
    });

    // Auto-complete if timer runs out AND we haven't already processed results
    if (shouldAutoComplete && state.timeLeft === 0 && !state.showResults && state.sessionId) {
      console.log("🏁 Auto-completing session due to timer...");
      completeSession();
    }
    // completeSession is stable, doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeLeft, state.testCompleted, state.sessionId, state.showResults]);

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
