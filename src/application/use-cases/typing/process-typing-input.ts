import { TypingSession, TypingMistake, SessionStatus } from '@/domain/entities/typing';
import { ISessionRepository } from '@/domain/interfaces/repositories';
import { ProcessInputCommand } from '@/application/commands/session.commands';
import { TypingSessionDto } from '@/application/dto/typing-session.dto';

export class ProcessTypingInputUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async execute(command: ProcessInputCommand): Promise<TypingSessionDto> {
    // 1. Get current session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session state
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CANCELLED) {
      throw new Error('Cannot process input for completed or cancelled session');
    }

    // 3. Start session if this is the first input
    if (session.status === SessionStatus.IDLE) {
      session.startTime = command.timestamp;
      session.status = SessionStatus.ACTIVE;
    }

    // 4. Update current input
    const previousInput = session.currentInput;
    session.currentInput = command.input;

    // 5. Calculate cursor position
    this.updateCursorPosition(session);

    // 6. Detect and record mistakes
    this.detectMistakes(session, previousInput, command.timestamp);

    // 7. Calculate live statistics
    this.updateLiveStats(session, command.timestamp);

    // 8. Update time left
    if (session.startTime) {
      const timeElapsed = (command.timestamp - session.startTime) / 1000;
      session.timeLeft = Math.max(0, session.test.results.duration - timeElapsed);
    }

    // 9. Check completion conditions
    if (this.isSessionComplete(session)) {
      session.status = SessionStatus.COMPLETED;
    }

    // 10. Save updated session
    await this.sessionRepository.update(session);

    return this.mapSessionToDto(session);
  }

  private updateCursorPosition(session: TypingSession): void {
    const input = session.currentInput;
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

    session.cursorPosition = {
      index: input.length,
      wordIndex: Math.min(wordIndex, words.length - 1),
      charIndex: Math.max(0, charIndex)
    };
  }

  private detectMistakes(session: TypingSession, previousInput: string, timestamp: number): void {
    const targetText = session.test.textContent;
    const currentInput = session.currentInput;
    
    // Only check for new mistakes in the newly typed characters
    const startIndex = previousInput.length;
    
    for (let i = startIndex; i < currentInput.length && i < targetText.length; i++) {
      const expectedChar = targetText[i];
      const actualChar = currentInput[i];
      
      if (expectedChar !== actualChar) {
        const mistake: TypingMistake = {
          position: i,
          expectedChar,
          actualChar,
          timestamp
        };
        
        session.mistakes.push(mistake);
      }
    }
  }

  private updateLiveStats(session: TypingSession, timestamp: number): void {
    if (!session.startTime) return;

    const timeElapsed = (timestamp - session.startTime) / 1000; // seconds
    const timeElapsedMinutes = timeElapsed / 60; // minutes
    
    // Calculate WPM (words per minute)
    const correctChars = this.countCorrectCharacters(session);
    const words = correctChars / 5; // Standard: 5 characters = 1 word
    const currentWPM = timeElapsedMinutes > 0 ? Math.round(words / timeElapsedMinutes) : 0;
    
    // Calculate accuracy
    const totalTyped = session.currentInput.length;
    const errorCount = session.mistakes.length;
    const currentAccuracy = totalTyped > 0 ? Math.round(((totalTyped - errorCount) / totalTyped) * 100) : 100;
    
    session.liveStats = {
      currentWPM,
      currentAccuracy,
      errorsCount: errorCount,
      timeElapsed: Math.round(timeElapsed)
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
    // Complete if time is up or text is fully typed
    return session.timeLeft <= 0 || session.currentInput.length >= session.test.textContent.length;
  }

  private mapSessionToDto(session: TypingSession): TypingSessionDto {
    return {
      id: session.id,
      userId: session.test.userId,
      mode: session.test.mode,
      difficulty: session.test.difficulty,
      language: session.test.language,
      keyboardLayoutId: session.activeLayoutId,
      textContent: session.test.textContent,
      currentInput: session.currentInput,
      startTime: session.startTime,
      timeLeft: session.timeLeft,
      status: session.status,
      cursorPosition: session.cursorPosition,
      liveStats: session.liveStats,
      mistakes: session.mistakes
    };
  }
}