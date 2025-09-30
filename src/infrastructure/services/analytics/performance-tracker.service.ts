import {
  IPerformanceTrackerService
} from "@/domain/interfaces";
import { LiveTypingStats, TypingResults, TypingSession, TypingMistake } from "@/domain/entities";

/**
 * Real-time typing performance tracking service
 */
export class PerformanceTrackerService implements IPerformanceTrackerService {

  calculateLiveMetrics(
    currentInput: string,
    targetText: string,
    startTime: number,
    mistakes: TypingMistake[]
  ): LiveTypingStats {
    // Note: mistakes parameter available for future use in live calculations
    const now = Date.now();
    const timeElapsed = (now - startTime) / 1000; // Convert to seconds

    if (timeElapsed <= 0) {
      return this.getEmptyLiveStats();
    }

    const charactersTyped = currentInput.length;
    const correctCharacters = this.countCorrectCharacters(currentInput, targetText);
    const incorrectCharacters = charactersTyped - correctCharacters;

    // Calculate WPM (assuming average word length of 5 characters)
    const currentWpm = Math.round((correctCharacters / 5) / (timeElapsed / 60));

    // Calculate accuracy percentage
    const currentAccuracy = charactersTyped > 0
      ? Math.round((correctCharacters / charactersTyped) * 100)
      : 100;

    return {
      currentWPM: Math.max(0, currentWpm),
      currentAccuracy: Math.max(0, Math.min(100, currentAccuracy)),
      charactersPerSecond: timeElapsed > 0 ? correctCharacters / timeElapsed : 0,
      errorRate: charactersTyped > 0 ? (incorrectCharacters / charactersTyped) * 100 : 0,
      timeElapsed,
      elapsedTime: timeElapsed,
      progress: targetText.length > 0 ? (charactersTyped / targetText.length) * 100 : 0
    };
  }

  calculateFinalResults(session: TypingSession): TypingResults {
    if (!session.startTime) {
      throw new Error("Session must have a start time to calculate results");
    }

    const endTime = Date.now();
    const totalTimeSeconds = (endTime - session.startTime) / 1000;
    const targetText = session.test.textContent;
    const typedText = session.currentInput;

    // Basic metrics
    const charactersTyped = typedText.length;
    const correctCharacters = this.countCorrectCharacters(typedText, targetText);
    const errors = session.mistakes.length;

    // Word-based calculations
    const words = this.extractWords(targetText);
    const typedWords = this.extractWords(typedText);
    const { correctWords, incorrectWords } = this.compareWords(words, typedWords);

    // WPM calculation (using actual correct words)
    const wpm = totalTimeSeconds > 0
      ? Math.round((correctWords / (totalTimeSeconds / 60)))
      : 0;

    // Accuracy calculation
    const accuracy = charactersTyped > 0
      ? Math.round((correctCharacters / charactersTyped) * 100)
      : 100;

    // Speed over time for consistency calculation
    const speedOverTime = this.calculateSpeedOverTime(session);
    const consistency = this.calculateConsistency(speedOverTime);

    // Finger utilization (simplified)
    const fingerUtilization = this.calculateFingerUtilization(typedText, session.activeLayout.id);

    return TypingResults.create({
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      correctWords,
      incorrectWords,
      duration: Math.round(totalTimeSeconds),
      charactersTyped,
      correctChars: this.countCorrectCharacters(typedText, session.test.textContent),
      errors,
      consistency,
      fingerUtilization
    });
  }

  analyzeTypingRhythm(keystrokes: Array<{ key: string; timestamp: number }>): number[] {
    if (keystrokes.length < 2) {
      return [];
    }

    const intervals: number[] = [];
    for (let i = 1; i < keystrokes.length; i++) {
      const interval = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
      intervals.push(interval);
    }

    // Group intervals into time windows (e.g., 5-second windows)
    const windowSize = 5000; // 5 seconds
    const windows: number[][] = [];
    let currentWindow: number[] = [];
    let windowStart = keystrokes[0].timestamp;

    for (let i = 0; i < intervals.length; i++) {
      const keystrokeTime = keystrokes[i + 1].timestamp;

      if (keystrokeTime - windowStart > windowSize) {
        if (currentWindow.length > 0) {
          windows.push([...currentWindow]);
        }
        currentWindow = [];
        windowStart = keystrokeTime;
      }

      currentWindow.push(intervals[i]);
    }

    if (currentWindow.length > 0) {
      windows.push(currentWindow);
    }

    // Calculate average interval for each window
    return windows.map(window => {
      const sum = window.reduce((acc, interval) => acc + interval, 0);
      return window.length > 0 ? sum / window.length : 0;
    });
  }

  calculateFingerUtilization(text: string, keyboardLayout: string): Record<string, number> {
    // Note: keyboardLayout parameter available for layout-specific finger mapping
    // Simplified finger mapping - in a real implementation this would use the actual layout
    const fingerMap: Record<string, string> = {
      // Left hand
      'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
      'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
      'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
      'r': 'left-index', 'f': 'left-index', 'v': 'left-index',
      't': 'left-index', 'g': 'left-index', 'b': 'left-index',

      // Right hand
      'y': 'right-index', 'h': 'right-index', 'n': 'right-index',
      'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
      'i': 'right-middle', 'k': 'right-middle',
      'o': 'right-ring', 'l': 'right-ring',
      'p': 'right-pinky', ';': 'right-pinky', "'": 'right-pinky',

      ' ': 'thumbs'
    };

    const fingerCounts: Record<string, number> = {
      'left-pinky': 0, 'left-ring': 0, 'left-middle': 0, 'left-index': 0,
      'right-index': 0, 'right-middle': 0, 'right-ring': 0, 'right-pinky': 0,
      'thumbs': 0, 'unknown': 0
    };

    for (const char of text.toLowerCase()) {
      const finger = fingerMap[char] || 'unknown';
      fingerCounts[finger]++;
    }

    // Convert to percentages
    const totalChars = text.length;
    if (totalChars === 0) return fingerCounts;

    const utilization: Record<string, number> = {};
    for (const [finger, count] of Object.entries(fingerCounts)) {
      utilization[finger] = Math.round((count / totalChars) * 100 * 100) / 100; // Round to 2 decimals
    }

    return utilization;
  }

  calculateConsistency(speedOverTime: Array<{ time: number; wpm: number }>): number {
    if (speedOverTime.length < 2) {
      return 100; // Perfect consistency if only one data point
    }

    const speeds = speedOverTime.map(point => point.wpm);
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

    if (mean === 0) return 100;

    // Calculate coefficient of variation (CV)
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - mean, 2), 0) / speeds.length;
    const standardDeviation = Math.sqrt(variance);
    const cv = standardDeviation / mean;

    // Convert to consistency score (lower CV = higher consistency)
    // CV of 0 = 100% consistent, CV of 1 = 0% consistent
    const consistency = Math.max(0, Math.min(100, 100 * (1 - Math.min(cv, 1))));

    return Math.round(consistency);
  }

  private getEmptyLiveStats(): LiveTypingStats {
    return {
      currentWPM: 0,
      currentAccuracy: 100,
      charactersPerSecond: 0,
      errorRate: 0,
      timeElapsed: 0,
      elapsedTime: 0,
      progress: 0
    };
  }

  private countCorrectCharacters(input: string, target: string): number {
    let correct = 0;
    const minLength = Math.min(input.length, target.length);

    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) {
        correct++;
      }
    }

    return correct;
  }

  private extractWords(text: string): string[] {
    return text.trim().split(/\s+/).filter(word => word.length > 0);
  }

  private compareWords(targetWords: string[], typedWords: string[]): {
    correctWords: number;
    incorrectWords: number;
  } {
    let correctWords = 0;
    let incorrectWords = 0;

    const minLength = Math.min(targetWords.length, typedWords.length);

    for (let i = 0; i < minLength; i++) {
      if (targetWords[i] === typedWords[i]) {
        correctWords++;
      } else {
        incorrectWords++;
      }
    }

    // Add remaining words as incorrect if typed more than target
    if (typedWords.length > targetWords.length) {
      incorrectWords += typedWords.length - targetWords.length;
    }

    return { correctWords, incorrectWords };
  }

  private calculateSpeedOverTime(session: TypingSession): Array<{ time: number; wpm: number }> {
    // In a real implementation, this would track speed throughout the session
    // For now, return a simplified version
    const totalTime = session.liveStats.timeElapsed;
    const intervals = Math.max(1, Math.floor(totalTime / 10)); // 10-second intervals
    const speedPoints: Array<{ time: number; wpm: number }> = [];

    for (let i = 1; i <= intervals; i++) {
      const timePoint = (totalTime / intervals) * i;
      // Simulate speed variation (in reality this would come from actual tracking)
      const baseWpm = session.liveStats.currentWPM;
      const variation = Math.sin(i) * 5; // Small variation
      speedPoints.push({
        time: timePoint,
        wpm: Math.max(0, baseWpm + variation)
      });
    }

    return speedPoints;
  }
}