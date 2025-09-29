import { TypingSession, TypingTest, TypingMode, SessionStatus } from '@/domain/entities/typing';
import { ISessionRepository, IUserRepository, IKeyboardLayoutRepository } from '@/domain/interfaces/repositories';
import { ITextGenerationService } from '@/domain/interfaces/services';
import { StartSessionCommand } from '@/application/commands/session.commands';
import { StartSessionResponseDto } from '@/application/dto/typing-session.dto';

export class StartTypingSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository,
    private layoutRepository: IKeyboardLayoutRepository,
    private textGenerationService: ITextGenerationService
  ) {}

  async execute(command: StartSessionCommand): Promise<StartSessionResponseDto> {
    // 1. Validate user exists (except for practice mode)
    if (command.mode !== TypingMode.PRACTICE && command.userId) {
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new Error(`User not found: ${command.userId}`);
      }
    }

    // 2. Determine keyboard layout
    let layoutId = command.keyboardLayoutId;
    if (!layoutId && command.userId) {
      const preferredLayoutId = await this.layoutRepository.getUserPreferredLayout(command.userId, command.language);
      layoutId = preferredLayoutId || undefined;
    }
    
    const availableLayouts = await this.layoutRepository.getAvailableLayouts(command.language);
    if (!layoutId && availableLayouts.length > 0) {
      // Use first available layout as default
      layoutId = availableLayouts[0].id;
    }

    if (!layoutId) {
      throw new Error(`No keyboard layout available for language: ${command.language}`);
    }

    const activeLayout = await this.layoutRepository.findById(layoutId);
    if (!activeLayout) {
      throw new Error(`Keyboard layout not found: ${layoutId}`);
    }

    // 3. Generate text content
    const textContent = await this.textGenerationService.generate({
      language: command.language,
      difficulty: command.difficulty,
      textType: command.textType,
      length: command.duration,
      layoutId,
      userId: command.userId
    });

    // 4. Create typing test
    const test: TypingTest = {
      id: this.generateId(),
      userId: command.userId || 'anonymous',
      mode: command.mode,
      difficulty: command.difficulty,
      language: command.language,
      keyboardLayout: layoutId,
      textContent,
      results: {
        wpm: 0,
        accuracy: 0,
        correctWords: 0,
        incorrectWords: 0,
        totalWords: textContent.split(' ').length,
        duration: 0,
        charactersTyped: 0,
        errors: 0,
        consistency: 0,
        fingerUtilization: {}
      },
      timestamp: Date.now(),
      competitionId: command.mode === TypingMode.COMPETITION ? this.generateCompetitionId() : undefined
    };

    // 5. Create typing session
    const session: TypingSession = {
      id: this.generateId(),
      test,
      currentInput: '',
      startTime: null,
      timeLeft: command.duration,
      status: SessionStatus.IDLE,
      cursorPosition: {
        index: 0,
        wordIndex: 0,
        charIndex: 0
      },
      focusState: {
        isFocused: false,
        lastFocusTime: 0,
        focusLossCount: 0
      },
      mistakes: [],
      liveStats: {
        currentWPM: 0,
        currentAccuracy: 100,
        errorsCount: 0,
        timeElapsed: 0
      },
      activeLayoutId: layoutId
    };

    // 6. Save session
    await this.sessionRepository.save(session);

    // 7. Return response
    return {
      session: this.mapSessionToDto(session),
      textContent,
      activeLayout
    };
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCompetitionId(): string {
    const today = new Date().toISOString().split('T')[0];
    return `competition_${today}`;
  }

  private mapSessionToDto(session: TypingSession) {
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