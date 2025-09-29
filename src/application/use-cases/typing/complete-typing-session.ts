import { TypingSession, TypingMode, SessionStatus } from '@/domain/entities/typing';
import { ISessionRepository, ITypingRepository } from '@/domain/interfaces/repositories';
import { IPerformanceAnalyzerService } from '@/domain/interfaces/services';
import { CompleteSessionCommand } from '@/application/commands/session.commands';
import { TypingSessionDto } from '@/application/dto/typing-session.dto';

export class CompleteTypingSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private typingRepository: ITypingRepository,
    private performanceAnalyzer: IPerformanceAnalyzerService
  ) {}

  async execute(command: CompleteSessionCommand): Promise<TypingSessionDto> {
    // 1. Get current session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session can be completed
    if (session.status === SessionStatus.COMPLETED) {
      return this.mapSessionToDto(session);
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled session');
    }

    // 3. Update final input if provided
    if (command.finalInput !== undefined) {
      session.currentInput = command.finalInput;
    }

    // 4. Calculate final time elapsed
    const startTime = session.startTime || command.completedAt;
    const timeElapsed = (command.completedAt - startTime) / 1000; // seconds

    // 5. Calculate final results using performance analyzer
    const results = await this.performanceAnalyzer.calculateResults(
      session.currentInput,
      session.test.textContent,
      timeElapsed
    );

    // 6. Update test with final results
    session.test.results = results;
    session.status = SessionStatus.COMPLETED;

    // 7. Save completed session
    await this.sessionRepository.update(session);

    // 8. Save test results (except for practice mode)
    if (session.test.mode !== TypingMode.PRACTICE && session.test.userId !== 'anonymous') {
      await this.typingRepository.save(session.test);
    }

    return this.mapSessionToDto(session);
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