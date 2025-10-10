import { StartSessionCommand } from "@/application/commands/session.commands";
import { StartSessionResponseDto } from "@/application/dto/typing-session.dto";
import {
  SessionStatus,
  TypingMode,
  TypingResults,
  TypingSession,
  TypingTest,
} from "@/domain/entities";
import {
  IKeyboardLayoutRepository,
  ISessionRepository,
  IUserRepository,
} from "@/domain/interfaces/repositories";
import { ITextGenerationService } from "@/domain/interfaces/services";

export class StartTypingSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository,
    private layoutRepository: IKeyboardLayoutRepository,
    private textGenerationService: ITextGenerationService
  ) {}

  async execute(
    command: StartSessionCommand
  ): Promise<StartSessionResponseDto> {
    // 1. Validate user exists (except for practice mode and anonymous users)
    if (
      command.mode !== TypingMode.PRACTICE &&
      command.userId &&
      command.userId !== "anonymous"
    ) {
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        console.warn(
          `User not found: ${command.userId}, proceeding with anonymous session`
        );
        // Don't throw error, just log warning and proceed with anonymous
      }
    }

    // 2. Determine keyboard layout
    let layoutId = command.keyboardLayoutId;
    if (!layoutId && command.userId) {
      const preferredLayoutId =
        await this.layoutRepository.getUserPreferredLayout(
          command.userId,
          command.language
        );
      layoutId = preferredLayoutId || undefined;
    }

    const availableLayouts = await this.layoutRepository.getAvailableLayouts(
      command.language
    );
    if (!layoutId && availableLayouts.length > 0) {
      // Use first available layout as default
      layoutId = availableLayouts[0].id;
    }

    if (!layoutId) {
      throw new Error(
        `No keyboard layout available for language: ${command.language}`
      );
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
      userId: command.userId,
    });

    // 4. Create typing test
    const test = TypingTest.create({
      id: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: command.userId || "anonymous",
      mode: command.mode,
      difficulty: command.difficulty,
      language: command.language,
      keyboardLayout: layoutId,
      textContent,
      results: TypingResults.create({
        wpm: 0,
        accuracy: 0,
        correctWords: 0,
        incorrectWords: 0,
        duration: command.duration, // Use the actual session duration from command
        charactersTyped: 0,
        correctChars: 0,
        errors: 0,
        consistency: 0,
        fingerUtilization: {},
      }),
      timestamp: Date.now(),
      competitionId:
        command.mode === TypingMode.COMPETITION
          ? `comp_${Date.now()}`
          : undefined,
    });

    // 5. Create typing session
    const session = TypingSession.create({
      id: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      test,
      currentInput: "",
      startTime: null,
      timeLeft: command.duration,
      status: SessionStatus.IDLE,
      activeLayout,
    });

    // 6. Save session
    await this.sessionRepository.save(session);

    // 7. Return response
    return {
      session: this.mapSessionToDto(session),
      textContent,
      activeLayout,
    };
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCompetitionId(): string {
    const today = new Date().toISOString().split("T")[0];
    return `competition_${today}`;
  }

  private mapSessionToDto(session: TypingSession) {
    return {
      id: session.id,
      userId: session.test.userId,
      mode: session.test.mode,
      difficulty: session.test.difficulty,
      language: session.test.language,
      keyboardLayoutId: session.activeLayout.id,
      textContent: session.test.textContent,
      currentInput: session.currentInput,
      startTime: session.startTime,
      timeLeft: session.timeLeft,
      status: session.status,
      cursorPosition: session.cursorPosition,
      liveStats: session.liveStats,
      mistakes: session.mistakes,
      currentWPM: session.liveStats.currentWPM,
      currentAccuracy: session.liveStats.currentAccuracy,
      progress: 0, // Initial progress
      isActive: session.status === SessionStatus.ACTIVE,
    };
  }
}
