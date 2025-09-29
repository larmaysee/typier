import { TypingSession, SessionStatus, TypingMistake, LiveTypingStats } from "../../domain/entities/typing";
import { ISessionRepository } from "../../domain/interfaces/repositories";
import { ProcessInputCommandDTO } from "../dto/typing-session.dto";

export class ProcessTypingInputUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async execute(command: ProcessInputCommandDTO): Promise<TypingSession> {
    // 1. Get the session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session state
    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Session is already completed');
    }

    if (session.status === SessionStatus.PAUSED) {
      throw new Error('Session is paused');
    }

    // 3. Start the session if this is the first input
    if (!session.startTime) {
      session.startTime = command.timestamp;
      session.status = SessionStatus.ACTIVE;
    }

    // 4. Update current input and cursor position
    const previousInput = session.currentInput;
    session.currentInput = command.input;
    session.cursorPosition = command.cursorPosition;

    // 5. Calculate elapsed time
    const elapsedTime = session.startTime ? (command.timestamp - session.startTime) / 1000 : 0;
    session.liveStats.elapsedTime = elapsedTime;

    // 6. Process input changes and detect mistakes
    const newMistakes = this.detectMistakes(
      previousInput,
      command.input,
      session.test.textContent,
      command.timestamp
    );

    // Add new mistakes to the session
    session.mistakes.push(...newMistakes);

    // 7. Calculate live statistics
    session.liveStats = this.calculateLiveStats(
      session.test.textContent,
      command.input,
      session.mistakes,
      elapsedTime
    );

    // 8. Update time remaining
    session.timeLeft = Math.max(0, session.timeLeft - (elapsedTime - (session.liveStats.elapsedTime || 0)));

    // 9. Check for completion conditions
    const isTextCompleted = command.input.length >= session.test.textContent.length;
    const isTimeUp = session.timeLeft <= 0;

    if (isTextCompleted || isTimeUp) {
      session.status = SessionStatus.COMPLETED;
    }

    // 10. Update timestamp
    session.updated_at = new Date();

    // 11. Save session
    await this.sessionRepository.save(session);

    return session;
  }

  private detectMistakes(
    previousInput: string,
    currentInput: string,
    targetText: string,
    timestamp: number
  ): TypingMistake[] {
    const mistakes: TypingMistake[] = [];
    const prevLength = previousInput.length;
    const currentLength = currentInput.length;

    // Only check for mistakes if input was added (not just backspaced)
    if (currentLength > prevLength) {
      for (let i = prevLength; i < currentLength; i++) {
        const expected = targetText[i];
        const actual = currentInput[i];

        if (expected !== actual && expected !== undefined) {
          mistakes.push({
            position: i,
            expected,
            actual,
            timestamp
          });
        }
      }
    }

    return mistakes;
  }

  private calculateLiveStats(
    targetText: string,
    currentInput: string,
    mistakes: TypingMistake[],
    elapsedTimeSeconds: number
  ): LiveTypingStats {
    const typedChars = currentInput.length;
    const correctChars = this.countCorrectChars(targetText, currentInput);
    const incorrectChars = mistakes.length;
    
    // Calculate WPM (Words Per Minute)
    // Standard: 5 characters = 1 word
    const wordsTyped = correctChars / 5;
    const wpm = elapsedTimeSeconds > 0 ? Math.round((wordsTyped / elapsedTimeSeconds) * 60) : 0;

    // Calculate accuracy
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      elapsedTime: elapsedTimeSeconds
    };
  }

  private countCorrectChars(targetText: string, currentInput: string): number {
    let correctCount = 0;
    const minLength = Math.min(targetText.length, currentInput.length);

    for (let i = 0; i < minLength; i++) {
      if (targetText[i] === currentInput[i]) {
        correctCount++;
      }
    }

    return correctCount;
  }
}