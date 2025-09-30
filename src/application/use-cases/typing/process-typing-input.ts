import { TypingSession, SessionStatus, TypingMistake, LiveTypingStats } from "@/domain/entities/typing";
import { ISessionRepository } from "@/domain/interfaces/repositories";
import { ProcessInputCommand } from "@/application/commands/typing-commands";
import { TypingSessionDto } from "@/application/dto/typing-session.dto";
import { CursorPosition } from "@/domain/value-objects/cursor-position";

export class ProcessTypingInputUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) { }

  async execute(command: ProcessInputCommand): Promise<TypingSessionDto> {
    // 1. Get current session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session state
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.PAUSED) {
      throw new Error('Cannot process input for completed or paused session');
    }

    // 3. Start session if this is the first input
    let updatedSession = session;
    if (session.status === SessionStatus.IDLE) {
      updatedSession = session.start();
    }

    // 4. Update current input
    const previousInput = updatedSession.currentInput;
    const newCursorPosition = this.updateCursorPosition(updatedSession, command.input);
    updatedSession = updatedSession.updateInput(command.input, newCursorPosition);

    // 6. Detect and record mistakes
    const newMistakes = this.detectMistakes(updatedSession, previousInput, command.timestamp);
    for (const mistake of newMistakes) {
      updatedSession = updatedSession.addMistake(mistake);
    }

    // 7. Calculate live statistics
    const newLiveStats = this.updateLiveStats(updatedSession, command.timestamp);
    updatedSession = updatedSession.updateLiveStats(newLiveStats);

    // 8. Update time left by creating new session with updated time
    if (updatedSession.startTime) {
      const timeElapsed = (command.timestamp - updatedSession.startTime) / 1000;
      const newTimeLeft = Math.max(0, updatedSession.test.results.duration - timeElapsed);
      // Use create method to build new session with updated time left
      updatedSession = TypingSession.create({
        id: updatedSession.id,
        test: updatedSession.test,
        currentInput: updatedSession.currentInput,
        startTime: updatedSession.startTime,
        timeLeft: newTimeLeft,
        status: updatedSession.status,
        cursorPosition: updatedSession.cursorPosition,
        focusState: updatedSession.focusState,
        mistakes: updatedSession.mistakes,
        liveStats: updatedSession.liveStats,
        activeLayout: updatedSession.activeLayout
      });
    }

    // 9. Check completion conditions
    if (this.isSessionComplete(updatedSession)) {
      updatedSession = updatedSession.complete();
    }

    // 10. Save updated session
    await this.sessionRepository.update(updatedSession);

    return this.mapSessionToDto(updatedSession);
  }

  private updateCursorPosition(session: TypingSession, input: string): CursorPosition {
    const words = session.test.textContent.split(' ');

    let charCount = 0;
    let wordIndex = 0;
    let charIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const wordLength = words[i].length;
      const wordEnd = charCount + wordLength;

      if (input.length <= wordEnd) {
        wordIndex = i;
        charIndex = input.length - charCount;
        break;
      }

      charCount = wordEnd + 1; // +1 for space

      if (input.length === charCount - 1) {
        wordIndex = i + 1;
        charIndex = 0;
        break;
      }
    }

    return {
      characterIndex: input.length,
      wordIndex: Math.min(wordIndex, words.length - 1),
      lineNumber: 0,
      columnNumber: Math.max(0, charIndex)
    };
  }

  private detectMistakes(session: TypingSession, previousInput: string, timestamp: number): TypingMistake[] {
    const targetText = session.test.textContent;
    const currentInput = session.currentInput;
    const mistakes: TypingMistake[] = [];

    // Only check for new mistakes in the newly typed characters
    const startIndex = previousInput.length;

    for (let i = startIndex; i < currentInput.length && i < targetText.length; i++) {
      const expectedChar = targetText[i];
      const actualChar = currentInput[i];

      if (expectedChar !== actualChar) {
        const mistake: TypingMistake = {
          position: i,
          expected: expectedChar,
          actual: actualChar,
          timestamp,
          corrected: false
        };

        mistakes.push(mistake);
      }
    }

    return mistakes;
  }

  private updateLiveStats(session: TypingSession, timestamp: number): LiveTypingStats {
    if (!session.startTime) return session.liveStats;

    const timeElapsed = (timestamp - session.startTime) / 1000; // seconds
    const timeElapsedMinutes = timeElapsed / 60; // minutes

    // Calculate WPM (words per minute)
    const correctChars = this.countCorrectCharacters(session);
    const words = correctChars / 5; // Standard: 5 characters = 1 word
    const currentWPM = timeElapsedMinutes > 0 ? Math.round(words / timeElapsedMinutes) : 0;

    const totalTyped = session.currentInput.length;
    const errorCount = session.mistakes.length;
    const currentAccuracy = totalTyped > 0 ? Math.round(((totalTyped - errorCount) / totalTyped) * 100) : 100;

    const totalChars = session.test.textContent.length;
    const progress = totalChars > 0 ? (totalTyped / totalChars) * 100 : 0;

    return {
      currentWPM,
      currentAccuracy,
      charactersPerSecond: totalTyped / timeElapsed,
      errorRate: errorCount / Math.max(totalTyped, 1),
      timeElapsed: Math.round(timeElapsed),
      elapsedTime: Math.round(timeElapsed),
      progress: Math.min(progress, 100)
    };
  }

  private countCorrectCharacters(session: TypingSession): number {
    const targetText = session.test.textContent;
    const currentInput = session.currentInput;

    let correctCount = 0;
    const minLength = Math.min(targetText.length, currentInput.length);

    for (let i = 0; i < minLength; i++) {
      if (targetText[i] === currentInput[i]) {
        correctCount++;
      }
    }

    return correctCount;
  }

  private isSessionComplete(session: TypingSession): boolean {
    // Complete if time is up
    if (session.timeLeft <= 0) {
      return true;
    }

    // Complete if text is fully and correctly typed
    const targetText = session.test.textContent;
    const currentInput = session.currentInput;

    // Text must be complete in length AND correct
    return currentInput.length >= targetText.length &&
      currentInput === targetText;
  }

  private mapSessionToDto(session: TypingSession): TypingSessionDto {
    return {
      id: session.id,
      userId: session.test.userId,
      mode: session.test.mode,
      difficulty: session.test.difficulty,
      language: session.test.language,
      keyboardLayoutId: session.activeLayout?.id || '',
      textContent: session.test.textContent,
      currentInput: session.currentInput,
      startTime: session.startTime,
      timeLeft: session.timeLeft,
      status: session.status,
      currentWPM: session.liveStats.currentWPM,
      currentAccuracy: session.liveStats.currentAccuracy,
      progress: session.liveStats.progress,
      mistakes: session.mistakes.map(m => ({
        position: m.position,
        expected: m.expected,
        actual: m.actual,
        timestamp: m.timestamp,
        corrected: m.corrected
      })),
      isActive: session.status === SessionStatus.ACTIVE
    };
  }
}