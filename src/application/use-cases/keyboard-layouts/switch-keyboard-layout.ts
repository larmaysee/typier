import { TypingSession } from '@/domain/entities/typing';
import { ISessionRepository, IKeyboardLayoutRepository } from '@/domain/interfaces/repositories';
import { ILayoutManagerService } from '@/domain/interfaces/services';
import { SwitchLayoutCommand } from '@/application/commands/layout.commands';
import { TypingSessionDto } from '@/application/dto/typing-session.dto';

export class SwitchKeyboardLayoutUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private layoutRepository: IKeyboardLayoutRepository,
    private layoutManager: ILayoutManagerService
  ) {}

  async execute(command: SwitchLayoutCommand): Promise<TypingSessionDto> {
    const { sessionId, layoutId, userId } = command;

    // 1. Get current session
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // 2. Validate session can be modified
    if (session.status === 'completed' || session.status === 'cancelled') {
      throw new Error('Cannot switch layout for completed or cancelled session');
    }

    // 3. Validate new layout exists and is compatible
    const newLayout = await this.layoutRepository.findById(layoutId);
    if (!newLayout) {
      throw new Error(`Layout not found: ${layoutId}`);
    }

    // 4. Check language compatibility
    if (newLayout.language !== session.test.language) {
      throw new Error(`Layout language ${newLayout.language} does not match session language ${session.test.language}`);
    }

    // 5. Check layout compatibility with current text content
    const isCompatible = await this.layoutManager.isCompatible(layoutId, session.test.textContent);
    if (!isCompatible) {
      throw new Error(`Layout ${layoutId} is not compatible with current text content`);
    }

    // 6. Prevent switching in competition mode after session has started
    if (session.test.mode === 'competition' && session.status === 'active') {
      throw new Error('Layout switching is not allowed in active competition sessions');
    }

    // 7. Update session with new layout
    const previousLayoutId = session.activeLayoutId;
    session.activeLayoutId = layoutId;
    session.test.keyboardLayout = layoutId;

    // 8. Save user preference if user is provided
    if (userId && userId !== 'anonymous') {
      try {
        await this.layoutRepository.setUserPreferredLayout(userId, session.test.language, layoutId);
      } catch (error) {
        console.warn(`Failed to save layout preference for user ${userId}: ${error}`);
        // Continue with layout switch even if preference save fails
      }
    }

    // 9. Update session
    await this.sessionRepository.update(session);

    // 10. Log the layout switch for analytics
    this.logLayoutSwitch(sessionId, previousLayoutId, layoutId, session.status);

    return this.mapSessionToDto(session);
  }

  private logLayoutSwitch(sessionId: string, fromLayoutId: string, toLayoutId: string, sessionStatus: string): void {
    // In a real implementation, this would log to an analytics service
    console.info('Layout switched', {
      sessionId,
      fromLayoutId,
      toLayoutId,
      sessionStatus,
      timestamp: Date.now()
    });
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