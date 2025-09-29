import { TypingSession, SessionStatus } from "../../domain/entities/typing";
import { ISessionRepository } from "../../domain/interfaces/repositories";
import { PauseResumeSessionCommandDTO } from "../dto/typing-session.dto";

export class PauseResumeSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async execute(command: PauseResumeSessionCommandDTO): Promise<TypingSession> {
    // 1. Get the session
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${command.sessionId}`);
    }

    // 2. Validate session state
    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot pause/resume a completed session');
    }

    if (session.status === SessionStatus.CANCELLED) {
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

      session.status = SessionStatus.PAUSED;
      session.focusState.isFocused = false;
      session.focusState.lastFocusTime = command.timestamp;
    }

    // 4. Handle resume action
    if (command.action === 'resume') {
      if (session.status === SessionStatus.ACTIVE) {
        return session; // Already active
      }

      if (session.status === SessionStatus.PAUSED) {
        session.status = SessionStatus.ACTIVE;
        session.focusState.isFocused = true;
        
        // Calculate focus lost duration
        const pauseDuration = command.timestamp - session.focusState.lastFocusTime;
        session.focusState.focusLostDuration += pauseDuration;
        session.focusState.lastFocusTime = command.timestamp;
      }

      if (session.status === SessionStatus.IDLE) {
        // Resume from idle state (first input)
        session.status = SessionStatus.ACTIVE;
        session.startTime = command.timestamp;
        session.focusState.isFocused = true;
        session.focusState.lastFocusTime = command.timestamp;
      }
    }

    // 5. Update timestamp
    session.updated_at = new Date();

    // 6. Save session
    await this.sessionRepository.save(session);

    return session;
  }

  async cancelSession(sessionId: string): Promise<TypingSession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed session');
    }

    session.status = SessionStatus.CANCELLED;
    session.updated_at = new Date();

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
      focusLostDuration: session.focusState.focusLostDuration,
      canResume: session.status === SessionStatus.PAUSED || session.status === SessionStatus.IDLE,
      canPause: session.status === SessionStatus.ACTIVE
    };
  }
}