import { CompleteSessionCommandDTO } from "@/application/dto/typing-session.dto";
import { SessionStatus, TypingResults, TypingSession, TypingTest } from "@/domain/entities/typing";
import { ISessionRepository, ITypingRepository, IUserRepository } from "@/domain/interfaces/repositories";

export class CompleteTypingSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private typingRepository: ITypingRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(command: CompleteSessionCommandDTO): Promise<TypingSession> {
    // 1. Validate session exists
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session can be completed
    if (session.status === SessionStatus.COMPLETED) {
      return session; // Already completed
    }

    if (session.status === SessionStatus.ABANDONED) {
      throw new Error("Cannot complete a cancelled session");
    }

    // 3. Calculate final results
    const completionTime = command.completionTime;
    const startTime = session.startTime || completionTime;
    const totalDuration = (completionTime - startTime) / 1000; // in seconds

    const finalResults = this.calculateFinalResults(
      session.test.textContent,
      command.finalInput,
      session.mistakes,
      totalDuration,
      session.liveStats.timeElapsed
    );

    // 4. Create completed test with results
    const completedTest = TypingTest.create({
      id: session.test.id,
      userId: session.test.userId,
      mode: session.test.mode,
      difficulty: session.test.difficulty,
      language: session.test.language,
      keyboardLayout: session.test.keyboardLayout,
      textContent: session.test.textContent,
      results: finalResults,
      timestamp: session.test.timestamp,
      competitionId: session.test.competitionId,
    });

    // 5. Create completed session using complete() method
    const completedSession = session.complete().updateInput(command.finalInput, session.cursorPosition);

    // 6. Save completed session
    await this.sessionRepository.save(completedSession);

    // 7. Save typing test results if not in practice mode
    if (session.test.mode !== "practice") {
      await this.typingRepository.save(completedTest);

      // 8. Update user statistics (only for real users)
      const isGuest =
        !session.test.userId || session.test.userId === "anonymous" || session.test.userId.startsWith("guest_");

      if (!isGuest) {
        await this.updateUserStatistics(session.test.userId, finalResults);
      }
    }

    return completedSession;
  }

  private calculateFinalResults(
    targetText: string,
    finalInput: string,
    mistakes: any[],
    totalDurationSeconds: number,
    actualTypingTime: number
  ): TypingResults {
    console.log("🧮 [calculateFinalResults] Starting calculation:", {
      targetTextLength: targetText.length,
      finalInputLength: finalInput.length,
      mistakesCount: mistakes.length,
      totalDurationSeconds,
      actualTypingTime,
      targetText: targetText.substring(0, 50) + "...",
      finalInput: finalInput.substring(0, 50) + "...",
    });

    const targetWords = targetText.split(/\s+/);
    const typedWords = finalInput.split(/\s+/);

    console.log("🔍 [calculateFinalResults] Text analysis:", {
      targetText: targetText.substring(0, 100) + "...",
      finalInput: finalInput.substring(0, 100) + "...",
      targetWords: targetWords.slice(0, 10),
      typedWords: typedWords.slice(0, 10),
      targetWordsLength: targetWords.length,
      typedWordsLength: typedWords.length,
    });

    // Character-level calculations
    const totalChars = targetText.length;
    const typedChars = finalInput.length;
    const correctChars = this.countCorrectChars(targetText, finalInput);
    const incorrectChars = typedChars - correctChars;

    console.log("🔤 [calculateFinalResults] Character analysis:", {
      totalChars,
      typedChars,
      correctChars,
      incorrectChars,
      sampleComparison: `"${targetText.substring(0, 20)}" vs "${finalInput.substring(0, 20)}"`,
    });

    // Word-level calculations
    const correctWords = this.countCorrectWords(targetWords, typedWords);
    const incorrectWords = Math.max(0, typedWords.length - correctWords);
    const totalWords = targetWords.length;

    console.log("📝 [calculateFinalResults] Word analysis:", {
      correctWords,
      incorrectWords,
      totalWords,
      firstTargetWord: targetWords[0] || "N/A",
      firstTypedWord: typedWords[0] || "N/A",
    });

    // WPM calculation (using net WPM: (correct chars / 5 - errors) / time in minutes)
    const timeInMinutes = totalDurationSeconds / 60;
    const grossWPM = timeInMinutes > 0 ? correctChars / 5 / timeInMinutes : 0;
    const netWPM = timeInMinutes > 0 ? Math.max(0, grossWPM - mistakes.length / timeInMinutes) : 0;

    // Accuracy calculation
    const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 100;

    // Consistency calculation (how steady the typing speed was)
    const consistency = this.calculateConsistency(mistakes, totalDurationSeconds);

    // Peak WPM calculation (highest WPM achieved during any 10-second window)
    const peakWPM = this.calculatePeakWPM(mistakes, correctChars, totalDurationSeconds);

    console.log("🧮 [calculateFinalResults] Calculated values:", {
      correctChars,
      typedChars,
      timeInMinutes,
      grossWPM,
      netWPM,
      accuracy,
      correctWords,
      incorrectWords,
      mistakesLength: mistakes.length,
    });

    const finalResults = TypingResults.create({
      wpm: Math.round(netWPM),
      accuracy: Math.round(accuracy * 100) / 100,
      correctWords,
      incorrectWords,
      duration: Math.round(totalDurationSeconds),
      charactersTyped: typedChars,
      correctChars,
      errors: mistakes.length,
      consistency: Math.round(consistency * 100) / 100,
      fingerUtilization: {},
    });

    console.log("🧮 [calculateFinalResults] Raw calculation values before TypingResults.create:", {
      netWPM: netWPM,
      wpmRounded: Math.round(netWPM),
      accuracy: accuracy,
      accuracyProcessed: Math.round(accuracy * 100) / 100,
      correctWords,
      incorrectWords,
      duration: totalDurationSeconds,
      durationRounded: Math.round(totalDurationSeconds),
      charactersTyped: typedChars,
      correctChars,
      errors: mistakes.length,
    });

    console.log("🧮 [calculateFinalResults] Final TypingResults created:", finalResults);
    return finalResults;
  }

  private countCorrectChars(targetText: string, typedText: string): number {
    let correctCount = 0;
    const minLength = Math.min(targetText.length, typedText.length);

    for (let i = 0; i < minLength; i++) {
      if (targetText[i] === typedText[i]) {
        correctCount++;
      }
    }

    return correctCount;
  }

  private countCorrectWords(targetWords: string[], typedWords: string[]): number {
    let correctCount = 0;
    const minLength = Math.min(targetWords.length, typedWords.length);

    for (let i = 0; i < minLength; i++) {
      if (targetWords[i] === typedWords[i]) {
        correctCount++;
      }
    }

    return correctCount;
  }

  private calculateConsistency(mistakes: any[], totalDuration: number): number {
    if (totalDuration <= 0 || mistakes.length === 0) {
      return 100;
    }

    // Calculate variance in mistake timing
    const mistakeTimestamps = mistakes.map((m) => m.timestamp);
    const intervals: number[] = [];

    for (let i = 1; i < mistakeTimestamps.length; i++) {
      intervals.push(mistakeTimestamps[i] - mistakeTimestamps[i - 1]);
    }

    if (intervals.length === 0) {
      return 100;
    }

    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((acc, interval) => acc + Math.pow(interval - meanInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower std dev = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation / meanInterval) * 100);
    return consistencyScore;
  }

  private calculatePeakWPM(mistakes: any[], correctChars: number, totalDuration: number): number {
    // Simplified peak WPM calculation
    // In a full implementation, this would analyze typing speed in sliding windows
    const timeInMinutes = totalDuration / 60;
    const baseWPM = timeInMinutes > 0 ? correctChars / 5 / timeInMinutes : 0;

    // Estimate peak as 20-30% higher than average, adjusted for consistency
    const peakMultiplier = mistakes.length < 5 ? 1.3 : 1.2;
    return baseWPM * peakMultiplier;
  }

  private async updateUserStatistics(userId: string, results: TypingResults): Promise<void> {
    // Get current user statistics
    const currentStats = await this.userRepository.getStatistics(userId);

    if (!currentStats) {
      // Create initial statistics - simplified version for mock
      await this.userRepository.updateStatistics(userId, {
        totalTests: 1,
        averageWPM: results.wpm,
        bestWPM: results.wpm,
        averageAccuracy: results.accuracy,
        bestAccuracy: results.accuracy,
        totalTimeTyped: results.duration,
        totalCharactersTyped: results.correctChars,
      });
    } else {
      // Update existing statistics
      const newTestCount = currentStats.totalTests + 1;
      const newAvgWpm = (currentStats.averageWPM * currentStats.totalTests + results.wpm) / newTestCount;
      const newAvgAccuracy = (currentStats.averageAccuracy * currentStats.totalTests + results.accuracy) / newTestCount;

      await this.userRepository.updateStatistics(userId, {
        totalTests: newTestCount,
        averageWPM: newAvgWpm,
        bestWPM: Math.max(currentStats.bestWPM, results.wpm),
        averageAccuracy: newAvgAccuracy,
        bestAccuracy: Math.max(currentStats.bestAccuracy, results.accuracy),
        totalTimeTyped: currentStats.totalTimeTyped + results.duration,
        totalCharactersTyped: currentStats.totalCharactersTyped + results.correctChars,
      });
    }
  }
}
