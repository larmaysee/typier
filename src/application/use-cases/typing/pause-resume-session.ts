import { TypingSession, SessionStatus } from '@/domain/entities/typing';
import { ISessionRepository } from '@/domain/interfaces/repositories';
import { PauseSessionCommand, ResumeSessionCommand } from '@/application/commands/session.commands';
import { TypingSessionDto } from '@/application/dto/typing-session.dto';

export class PauseResumeSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async pauseSession(command: PauseSessionCommand): Promise<TypingSessionDto> {
    // 1. Get current session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session can be paused
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error('Only active sessions can be paused');
    }

    // 3. Calculate time elapsed and update time left
    if (session.startTime) {
      const timeElapsed = (command.pausedAt - session.startTime) / 1000;
      session.timeLeft = Math.max(0, session.timeLeft - timeElapsed);
    }

    // 4. Update session status
    session.status = SessionStatus.PAUSED;

    // 5. Update focus state
    session.focusState.isFocused = false;
    session.focusState.focusLossCount += 1;

    // 6. Save session
    await this.sessionRepository.update(session);

    return this.mapSessionToDto(session);
  }

  async resumeSession(command: ResumeSessionCommand): Promise<TypingSessionDto> {
    // 1. Get current session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session can be resumed
    if (session.status !== SessionStatus.PAUSED) {
      throw new Error('Only paused sessions can be resumed');
    }

    // 3. Check if there's still time left
    if (session.timeLeft <= 0) {
      session.status = SessionStatus.COMPLETED;
      await this.sessionRepository.update(session);
      throw new Error('Session time has expired');
    }

    // 4. Update session status and start time
    session.status = SessionStatus.ACTIVE;
    session.startTime = command.resumedAt;

    // 5. Update focus state
    session.focusState.isFocused = true;
    session.focusState.lastFocusTime = command.resumedAt;

    // 6. Save session
    await this.sessionRepository.update(session);

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