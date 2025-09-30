import { TypingSession, SessionStatus } from "@/domain/entities/typing";
import { ISessionRepository } from "@/domain/interfaces/repositories";
import { PauseResumeSessionCommandDTO } from "@/application/dto/typing-session.dto";

export class PauseResumeSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) { }

  async execute(command: PauseResumeSessionCommandDTO): Promise<TypingSession> {
    // 1. Get the session
    let session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session state
    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot pause/resume a completed session');
    }

    if (session.status === SessionStatus.ABANDONED) {
      throw new Error('Cannot pause/resume a cancelled session');
    }

    if (session.status === SessionStatus.IDLE && command.action === 'pause') {
      throw new Error('Cannot pause a session that hasn\'t started');
    }

    // 3. Handle pause action
    if (command.action === 'pause') {
      if (session.status === SessionStatus.PAUSED) {
        return session; // Already paused
      }

      session = session.pause();
    }

    // 4. Handle resume action
    if (command.action === 'resume') {
      if (session.status === SessionStatus.ACTIVE) {
        return session; // Already active
      }

      if (session.status === SessionStatus.PAUSED) {
        session = session.resume();
      } else {
        throw new Error('Can only resume paused sessions');
      }
    }

    // 5. Save session
    await this.sessionRepository.save(session);

    return session;
  }

  async cancelSession(sessionId: string): Promise<TypingSession> {
    let session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed session');
    }

    // Create new session with ABANDONED status
    session = TypingSession.create({
      id: session.id,
      test: session.test,
      currentInput: session.currentInput,
      startTime: session.startTime,
      timeLeft: session.timeLeft,
      status: SessionStatus.ABANDONED,
      cursorPosition: session.cursorPosition,
      focusState: session.focusState,
      mistakes: session.mistakes,
      liveStats: session.liveStats,
      activeLayout: session.activeLayout
    });

    await this.sessionRepository.save(session);
    return session;
  }

  async getSessionStatus(sessionId: string): Promise<{
    status: SessionStatus;
    timeLeft: number;
    elapsedTime: number;
    focusLostDuration: number;
    canResume: boolean;
    canPause: boolean;
  }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const currentTime = Date.now();
    const elapsedTime = session.startTime ? (currentTime - session.startTime) / 1000 : 0;

    return {
      status: session.status,
      timeLeft: session.timeLeft,
      elapsedTime,
      focusLostDuration: 0, // TODO: Calculate focus lost duration properly
      canResume: session.status === SessionStatus.PAUSED || session.status === SessionStatus.IDLE,
      canPause: session.status === SessionStatus.ACTIVE
    };
  }
}