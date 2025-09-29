import { TypingSession, SessionStatus, TypingResults } from "../../domain/entities/typing";
import { ISessionRepository, ITypingRepository, IUserRepository } from "../../domain/interfaces/repositories";
import { CompleteSessionCommandDTO } from "../dto/typing-session.dto";

export class CompleteTypingSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private typingRepository: ITypingRepository,
    private userRepository: IUserRepository
  ) { }

  async execute(command: CompleteSessionCommandDTO): Promise<TypingSession> {
    // 1. Get the session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session can be completed
    if (session.status === SessionStatus.COMPLETED) {
      return session; // Already completed
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled session');
    }

    // 3. Update final input and completion time
    session.currentInput = command.finalInput;
    const completionTime = command.completionTime;
    const startTime = session.startTime || completionTime;
    const totalDuration = (completionTime - startTime) / 1000; // in seconds

    // 4. Calculate final results
    const finalResults = this.calculateFinalResults(
      session.test.textContent,
      command.finalInput,
      session.mistakes,
      totalDuration,
      session.liveStats.elapsedTime
    );

    // 5. Update session with final results
    session.test.results = finalResults;
    session.status = SessionStatus.COMPLETED;
    session.updated_at = new Date();

    // 6. Save typing test results if not in practice mode
    if (session.test.mode !== 'practice') {
      await this.typingRepository.save(session.test);

      // 7. Update user statistics
      if (session.test.userId !== 'guest') {
        await this.updateUserStatistics(session);
      }
    }

    // 8. Save session
    await this.sessionRepository.save(session);

    return session;
  }

  private calculateFinalResults(
    targetText: string,
    finalInput: string,
    mistakes: any[],
    totalDurationSeconds: number,
    actualTypingTime: number
  ): TypingResults {
    const targetWords = targetText.split(/\s+/);
    const typedWords = finalInput.split(/\s+/);

    // Character-level calculations
    const totalChars = targetText.length;
    const typedChars = finalInput.length;
    const correctChars = this.countCorrectChars(targetText, finalInput);
    const incorrectChars = typedChars - correctChars;

    // Word-level calculations  
    const correctWords = this.countCorrectWords(targetWords, typedWords);
    const incorrectWords = Math.max(0, typedWords.length - correctWords);
    const totalWords = targetWords.length;

    // WPM calculation (using net WPM: (correct chars / 5 - errors) / time in minutes)
    const timeInMinutes = totalDurationSeconds / 60;
    const grossWPM = timeInMinutes > 0 ? (correctChars / 5) / timeInMinutes : 0;
    const netWPM = timeInMinutes > 0 ? Math.max(0, grossWPM - (mistakes.length / timeInMinutes)) : 0;

    // Accuracy calculation
    const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 100;

    // Consistency calculation (how steady the typing speed was)
    const consistency = this.calculateConsistency(mistakes, totalDurationSeconds);

    // Peak WPM calculation (highest WPM achieved during any 10-second window)
    const peakWPM = this.calculatePeakWPM(mistakes, correctChars, totalDurationSeconds);

    return {
      wpm: Math.round(netWPM),
      accuracy: Math.round(accuracy * 100) / 100,
      correctWords,
      incorrectWords,
      totalWords,
      correctChars,
      incorrectChars,
      totalChars,
      duration: Math.round(totalDurationSeconds),
      mistakes: mistakes,
      consistency: Math.round(consistency * 100) / 100,
      peak_wpm: Math.round(peakWPM)
    };
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
    const mistakeTimestamps = mistakes.map(m => m.timestamp);
    const intervals: number[] = [];

    for (let i = 1; i < mistakeTimestamps.length; i++) {
      intervals.push(mistakeTimestamps[i] - mistakeTimestamps[i - 1]);
    }

    if (intervals.length === 0) {
      return 100;
    }

    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - meanInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower std dev = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation / meanInterval) * 100);
    return consistencyScore;
  }

  private calculatePeakWPM(mistakes: any[], correctChars: number, totalDuration: number): number {
    // Simplified peak WPM calculation
    // In a full implementation, this would analyze typing speed in sliding windows
    const timeInMinutes = totalDuration / 60;
    const baseWPM = timeInMinutes > 0 ? (correctChars / 5) / timeInMinutes : 0;

    // Estimate peak as 20-30% higher than average, adjusted for consistency
    const peakMultiplier = mistakes.length < 5 ? 1.3 : 1.2;
    return baseWPM * peakMultiplier;
  }

  private async updateUserStatistics(session: TypingSession): Promise<void> {
    const userId = session.test.userId;
    const results = session.test.results;

    // Get current user statistics
    const currentStats = await this.userRepository.getStatistics(userId);

    if (!currentStats) {
      // Create initial statistics
      await this.userRepository.updateStatistics(userId, {
        userId,
        totalTests: 1,
        totalTimeTyped: results.duration,
        bestWpm: results.wpm,
        averageWpm: results.wpm,
        bestAccuracy: results.accuracy,
        averageAccuracy: results.accuracy,
        totalWordsTyped: results.correctWords,
        totalCharactersTyped: results.correctChars,
        improvementRate: 0,
        lastTestDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing statistics
      const newTestCount = currentStats.totalTests + 1;
      const newAvgWpm = ((currentStats.averageWpm * currentStats.totalTests) + results.wpm) / newTestCount;
      const newAvgAccuracy = ((currentStats.averageAccuracy * currentStats.totalTests) + results.accuracy) / newTestCount;

      await this.userRepository.updateStatistics(userId, {
        totalTests: newTestCount,
        totalTimeTyped: currentStats.totalTimeTyped + results.duration,
        bestWpm: Math.max(currentStats.bestWpm, results.wpm),
        averageWpm: newAvgWpm,
        bestAccuracy: Math.max(currentStats.bestAccuracy, results.accuracy),
        averageAccuracy: newAvgAccuracy,
        totalWordsTyped: currentStats.totalWordsTyped + results.correctWords,
        totalCharactersTyped: currentStats.totalCharactersTyped + results.correctChars,
        lastTestDate: new Date(),
        updatedAt: new Date()
      });
    }
  }
}