import { LanguageCode } from "@/enums/site-config";
import { TypingSession, TypingTest, TypingMode, DifficultyLevel, SessionStatus } from "../../domain/entities/typing";
import { KeyboardLayout } from "../../domain/entities/keyboard-layout";
import { ITypingRepository, IUserRepository, ISessionRepository, IKeyboardLayoutRepository } from "../../domain/interfaces/repositories";
import { ITextGenerationService } from "../../domain/interfaces/services";
import { StartSessionCommandDTO } from "../dto/typing-session.dto";

export class StartTypingSessionUseCase {
  constructor(
    private textGenerationService: ITextGenerationService,
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private keyboardLayoutRepository: IKeyboardLayoutRepository
  ) {}

  async execute(command: StartSessionCommandDTO): Promise<TypingSession> {
    // 1. Validate user and permissions
    if (command.userId && command.mode !== TypingMode.PRACTICE) {
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new Error(`User not found: ${command.userId}`);
      }
    }

    // 2. Get or determine keyboard layout
    let activeLayout: KeyboardLayout;
    if (command.layoutId) {
      const layout = await this.keyboardLayoutRepository.getLayoutById(command.layoutId);
      if (!layout) {
        throw new Error(`Keyboard layout not found: ${command.layoutId}`);
      }
      activeLayout = layout;
    } else {
      // Get user's preferred layout or use default
      let preferredLayoutId: string | null = null;
      if (command.userId) {
        preferredLayoutId = await this.keyboardLayoutRepository.getUserPreferredLayout(
          command.userId, 
          command.language
        );
      }
      
      if (preferredLayoutId) {
        const layout = await this.keyboardLayoutRepository.getLayoutById(preferredLayoutId);
        activeLayout = layout!;
      } else {
        // Get default layout for the language
        const availableLayouts = await this.keyboardLayoutRepository.getAvailableLayouts(command.language);
        if (availableLayouts.length === 0) {
          throw new Error(`No keyboard layouts available for language: ${command.language}`);
        }
        activeLayout = availableLayouts[0];
      }
    }

    // 3. Generate or use custom text content
    let textContent: string;
    if (command.customText) {
      textContent = command.customText;
    } else {
      textContent = await this.textGenerationService.generate({
        language: command.language,
        difficulty: command.difficulty,
        textType: command.difficulty === DifficultyLevel.EASY ? 'words' : 'sentences',
        length: command.duration,
        userId: command.userId,
        avoidRecentWords: true
      });
    }

    // 4. Create typing test entity
    const typingTest: TypingTest = {
      id: this.generateId(),
      userId: command.userId || 'guest',
      mode: command.mode,
      difficulty: command.difficulty,
      language: command.language,
      keyboardLayoutId: activeLayout.id,
      textContent,
      results: {
        wpm: 0,
        accuracy: 0,
        correctWords: 0,
        incorrectWords: 0,
        totalWords: textContent.split(' ').length,
        correctChars: 0,
        incorrectChars: 0,
        totalChars: textContent.length,
        duration: 0,
        mistakes: [],
        consistency: 0,
        peak_wpm: 0
      },
      timestamp: Date.now(),
      competitionId: command.competitionId
    };

    // 5. Create typing session
    const session: TypingSession = {
      id: this.generateId(),
      test: typingTest,
      currentInput: '',
      startTime: null,
      timeLeft: command.duration,
      status: SessionStatus.IDLE,
      cursorPosition: {
        line: 0,
        column: 0,
        charIndex: 0
      },
      focusState: {
        isFocused: true,
        lastFocusTime: Date.now(),
        focusLostDuration: 0
      },
      mistakes: [],
      liveStats: {
        wpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        elapsedTime: 0
      },
      activeLayout,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 6. Save session
    await this.sessionRepository.save(session);

    return session;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}