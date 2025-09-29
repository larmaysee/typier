# Typoria Clean Architecture Refactoring Plan

This document outlines a comprehensive refactoring plan for Typoria to implement clean architecture with proper separation of concerns, making it highly extensible for future features.

## 🎯 Architecture Overview

### Goals
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **Extensibility**: Easy to add new typing modes and features
- **Testability**: Independent testing of business logic and components
- **Maintainability**: Smaller, focused modules with single responsibilities
- **Scalability**: Support future features like competitions, real-time multiplayer, AI coaching

### Design Principles
- **Clean Architecture**: Domain-centric design with dependency inversion
- **SOLID Principles**: Single responsibility, open/closed, dependency injection
- **Hexagonal Architecture**: Ports and adapters pattern for external dependencies
- **Command Query Responsibility Segregation (CQRS)**: Separate read/write operations

## 📁 New Folder Structure

```
src/
├── domain/                           # Core business logic (no dependencies)
│   ├── entities/
│   │   ├── typing.ts                # TypingTest, TypingResults, TypingSession
│   │   ├── user.ts                  # User, UserPreferences, UserProfile
│   │   ├── competition.ts           # Competition, CompetitionEntry
│   │   ├── keyboard-layout.ts       # KeyboardLayout, LayoutVariant, KeyMapping
│   │   └── statistics.ts            # TypingStatistics, LeaderboardEntry
│   ├── enums/
│   │   ├── typing-mode.ts           # TypingMode, DifficultyLevel, SessionStatus
│   │   ├── languages.ts             # LanguageCode, TextType
│   │   ├── keyboard-layouts.ts      # LayoutType, LayoutVariant, InputMethod
│   │   └── competition-types.ts     # CompetitionType, CompetitionStatus
│   ├── value-objects/
│   │   ├── cursor-position.ts       # CursorPosition, FocusState
│   │   ├── typing-metrics.ts        # WPM, Accuracy, Duration calculations
│   │   └── text-content.ts          # TextContent, DifficultyConfig
│   └── interfaces/
│       ├── repositories.ts          # All repository contracts
│       ├── services.ts              # External service contracts
│       └── events.ts                # Domain events for decoupling
│
├── application/                      # Business logic orchestration
│   ├── use-cases/
│   │   ├── typing/
│   │   │   ├── start-typing-session.ts
│   │   │   ├── process-typing-input.ts
│   │   │   ├── complete-typing-session.ts
│   │   │   └── pause-resume-session.ts
│   │   ├── statistics/
│   │   │   ├── calculate-user-statistics.ts
│   │   │   ├── get-leaderboard.ts
│   │   │   └── track-improvement.ts
│   │   ├── competition/
│   │   │   ├── create-competition.ts
│   │   │   ├── join-competition.ts
│   │   │   ├── submit-competition-entry.ts
│   │   │   └── get-competition-leaderboard.ts
│   │   ├── content/
│   │   │   ├── generate-typing-content.ts
│   │   │   ├── adapt-difficulty.ts
│   │   │   └── recommend-practice.ts
│   │   └── keyboard-layouts/
│   │       ├── get-available-layouts.ts
│   │       ├── switch-keyboard-layout.ts
│   │       ├── validate-layout-compatibility.ts
│   │       └── customize-layout.ts
│   ├── dto/
│   │   ├── typing-session.dto.ts
│   │   ├── statistics.dto.ts
│   │   └── competition.dto.ts
│   ├── commands/
│   │   ├── start-session.command.ts
│   │   ├── submit-result.command.ts
│   │   └── create-competition.command.ts
│   ├── queries/
│   │   ├── get-user-stats.query.ts
│   │   ├── get-leaderboard.query.ts
│   │   └── get-competitions.query.ts
│   └── services/
│       ├── typing-engine.service.ts
│       ├── difficulty-adapter.service.ts
│       └── performance-analyzer.service.ts
│
├── infrastructure/                   # External dependencies implementation
│   ├── repositories/
│   │   ├── appwrite/
│   │   │   ├── appwrite-typing.repository.ts
│   │   │   ├── appwrite-user.repository.ts
│   │   │   ├── appwrite-competition.repository.ts
│   │   │   └── appwrite-keyboard-layout.repository.ts
│   │   ├── local-storage/
│   │   │   ├── local-typing.repository.ts
│   │   │   ├── local-user-preferences.repository.ts
│   │   │   └── local-keyboard-layout.repository.ts
│   │   └── hybrid/
│   │       └── hybrid-typing.repository.ts    # Dual write: Appwrite + LocalStorage
│   ├── services/
│   │   ├── text-generation/
│   │   │   ├── english-text.service.ts
│   │   │   ├── lisu-text.service.ts
│   │   │   ├── myanmar-text.service.ts
│   │   │   └── text-generator.service.ts
│   │   ├── keyboard-layouts/
│   │   │   ├── layout-manager.service.ts
│   │   │   ├── english-layouts.service.ts
│   │   │   ├── lisu-layouts.service.ts
│   │   │   ├── myanmar-layouts.service.ts
│   │   │   └── layout-registry.service.ts
│   │   ├── analytics/
│   │   │   ├── performance-tracker.service.ts
│   │   │   └── improvement-analyzer.service.ts
│   │   └── external/
│   │       ├── appwrite-client.service.ts
│   │       └── notification.service.ts
│   ├── persistence/
│   │   ├── appwrite/
│   │   │   ├── database-client.ts
│   │   │   └── collections.config.ts
│   │   └── local-storage/
│   │       └── storage-client.ts
│   └── di/
│       ├── container.ts              # Dependency injection container
│       ├── bindings.ts               # Service bindings
│       └── providers.ts              # Provider registrations
│
├── presentation/                     # UI layer (React components)
│   ├── components/
│   │   ├── typing/
│   │   │   ├── typing-container.tsx
│   │   │   ├── typing-display/
│   │   │   │   ├── text-display.tsx
│   │   │   │   ├── cursor-indicator.tsx
│   │   │   │   └── typing-input.tsx
│   │   │   ├── typing-controls/
│   │   │   │   ├── session-controls.tsx
│   │   │   │   ├── mode-selector.tsx
│   │   │   │   └── difficulty-selector.tsx
│   │   │   └── typing-stats/
│   │   │       ├── live-stats.tsx
│   │   │       ├── progress-bar.tsx
│   │   │       └── timer-display.tsx
│   │   ├── statistics/
│   │   │   ├── statistics-dashboard.tsx
│   │   │   ├── performance-chart.tsx
│   │   │   ├── improvement-tracker.tsx
│   │   │   └── detailed-metrics.tsx
│   │   ├── leaderboard/
│   │   │   ├── leaderboard-container.tsx
│   │   │   ├── ranking-table.tsx
│   │   │   └── leaderboard-filters.tsx
│   │   ├── competition/
│   │   │   ├── competition-list.tsx
│   │   │   ├── daily-challenge.tsx
│   │   │   ├── competition-entry.tsx
│   │   │   └── competition-leaderboard.tsx
│   │   ├── settings/
│   │   │   ├── user-settings.tsx
│   │   │   ├── typing-preferences.tsx
│   │   │   ├── keyboard-layout-selector.tsx
│   │   │   └── theme-settings.tsx
│   │   └── ui/                       # Reusable UI components (existing)
│   ├── hooks/
│   │   ├── typing/
│   │   │   ├── use-typing-session.ts
│   │   │   ├── use-session-controls.ts
│   │   │   └── use-typing-input.ts
│   │   ├── statistics/
│   │   │   ├── use-user-statistics.ts
│   │   │   ├── use-leaderboard.ts
│   │   │   └── use-performance-metrics.ts
│   │   ├── competition/
│   │   │   ├── use-competitions.ts
│   │   │   └── use-competition-entry.ts
│   │   ├── keyboard-layouts/
│   │   │   ├── use-keyboard-layouts.ts
│   │   │   ├── use-layout-switching.ts
│   │   │   └── use-layout-preferences.ts
│   │   └── core/
│   │       ├── use-dependency-injection.ts
│   │       ├── use-error-handling.ts
│   │       └── use-loading-state.ts
│   ├── providers/
│   │   ├── dependency-injection.provider.tsx
│   │   ├── error-boundary.provider.tsx
│   │   ├── notification.provider.tsx
│   │   └── app-providers.tsx         # Composition root
│   ├── pages/
│   │   ├── typing.page.tsx
│   │   ├── statistics.page.tsx
│   │   ├── leaderboard.page.tsx
│   │   ├── competitions.page.tsx
│   │   └── settings.page.tsx
│   └── layouts/
│       ├── main-layout.tsx
│       ├── typing-layout.tsx
│       └── auth-layout.tsx
│
├── shared/                           # Shared utilities and types
│   ├── utils/
│   │   ├── typing-calculations.ts    # WPM, accuracy calculations
│   │   ├── text-processing.ts       # Text manipulation utilities
│   │   ├── performance-utils.ts     # Performance optimization helpers
│   │   ├── validation.ts            # Input validation utilities
│   │   └── date-time.ts            # Date/time formatting utilities
│   ├── constants/
│   │   ├── typing.constants.ts      # Typing-related constants
│   │   ├── ui.constants.ts          # UI constants (colors, sizes)
│   │   ├── api.constants.ts         # API endpoints and configs
│   │   └── storage.constants.ts     # Storage keys and configs
│   ├── types/
│   │   ├── api.types.ts            # API request/response types
│   │   ├── common.types.ts         # Common shared types
│   │   └── ui.types.ts             # UI-specific types
│   ├── errors/
│   │   ├── domain.errors.ts        # Domain-specific errors
│   │   ├── application.errors.ts   # Application layer errors
│   │   └── infrastructure.errors.ts # Infrastructure errors
│   └── events/
│       ├── typing-events.ts        # Typing session events
│       ├── competition-events.ts   # Competition events
│       └── user-events.ts          # User-related events
│
└── config/                          # Configuration files
    ├── app.config.ts               # Application configuration
    ├── database.config.ts          # Database configuration
    ├── feature-flags.config.ts     # Feature toggles
    └── environment.config.ts       # Environment variables
```

## 🏗️ Core Architecture Components

### 1. Domain Layer (Business Rules)

#### Keyboard Layout System

```typescript
// domain/entities/keyboard-layout.ts
export interface KeyboardLayout {
  id: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: LayoutType;
  variant: LayoutVariant;
  keyMappings: KeyMapping[];
  metadata: LayoutMetadata;
  isCustom: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface KeyMapping {
  key: string;           // Physical key (e.g., 'q', 'w', 'e')
  character: string;     // Output character
  shiftCharacter?: string;  // Character with Shift
  altCharacter?: string;    // Character with Alt/Option
  ctrlCharacter?: string;   // Character with Ctrl
  position: KeyPosition;
}

export interface KeyPosition {
  row: number;
  column: number;
  finger: FingerAssignment;
  hand: 'left' | 'right';
}

export interface LayoutMetadata {
  description: string;
  author: string;
  version: string;
  compatibility: string[];  // Compatible systems
  tags: string[];
  difficulty: DifficultyLevel;
  popularity: number;
}

// domain/enums/keyboard-layouts.ts
export enum LayoutType {
  QWERTY = 'qwerty',
  DVORAK = 'dvorak',
  COLEMAK = 'colemak',
  AZERTY = 'azerty',
  CUSTOM = 'custom',
  PHONETIC = 'phonetic',
  TRANSLITERATION = 'transliteration'
}

export enum LayoutVariant {
  // English variants
  US = 'us',
  UK = 'uk',
  INTERNATIONAL = 'international',
  
  // Lisu variants
  SIL_BASIC = 'sil_basic',
  SIL_STANDARD = 'sil_standard',
  UNICODE_STANDARD = 'unicode_standard',
  LISU_BASIC = 'lisu_basic',
  
  // Myanmar variants
  MYANMAR_3 = 'myanmar3',
  ZAWGYI = 'zawgyi',
  UNICODE = 'unicode',
  WININNWA = 'wininnwa',
  
  // Generic
  STANDARD = 'standard',
  BASIC = 'basic',
  EXTENDED = 'extended',
  CUSTOM = 'custom'
}

export enum InputMethod {
  DIRECT = 'direct',
  COMPOSE = 'compose',
  TRANSLITERATION = 'transliteration',
  PHONETIC = 'phonetic'
}

export type KeyboardLayoutId = string;
export type FingerAssignment = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
```

### 2. Domain Layer (Business Rules)

```typescript
// domain/entities/typing.ts
export interface TypingTest {
  id: string;
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayout: KeyboardLayoutId; // New field for layout tracking
  textContent: string;
  results: TypingResults;
  timestamp: number;
  competitionId?: string;
}

export interface TypingSession {
  id: string;
  test: TypingTest;
  currentInput: string;
  startTime: number | null;
  timeLeft: number;
  status: SessionStatus;
  cursorPosition: CursorPosition;
  focusState: FocusState;
  mistakes: TypingMistake[];
  liveStats: LiveTypingStats;
  activeLayout: KeyboardLayout; // Current active layout
}

export interface TypingResults {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  totalWords: number;
  duration: number;
  charactersTyped: number;
  errors: number;
  consistency: number;          // New metric
  fingerUtilization: Record<string, number>; // Advanced analytics
}
```

### 2. Repository Contracts (Ports)

```typescript
// domain/interfaces/repositories.ts
export interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  getCompetitionEntries(competitionId: string): Promise<TypingTest[]>;
  bulkSave(tests: TypingTest[]): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences>;
}

export interface ICompetitionRepository {
  findActive(): Promise<Competition[]>;
  findById(id: string): Promise<Competition | null>;
  save(competition: Competition): Promise<void>;
  getEntries(competitionId: string): Promise<CompetitionEntry[]>;
  submitEntry(entry: CompetitionEntry): Promise<void>;
}

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
}
```

### 3. Use Cases (Application Logic)

#### Keyboard Layout Management

```typescript
// application/use-cases/keyboard-layouts/get-available-layouts.ts
export class GetAvailableLayoutsUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(query: GetLayoutsQuery): Promise<LayoutsResponse> {
    const { language, userId } = query;
    
    // Get all available layouts for the language
    const allLayouts = await this.layoutRepository.getAvailableLayouts(language);
    
    // Get user's preferred layout
    let preferredLayoutId = null;
    if (userId) {
      preferredLayoutId = await this.layoutRepository.getUserPreferredLayout(userId, language);
    }
    
    // Sort layouts: preferred first, then by popularity
    const sortedLayouts = this.sortLayoutsByPreference(allLayouts, preferredLayoutId);
    
    return {
      layouts: sortedLayouts,
      preferredLayoutId,
      defaultLayoutId: this.getDefaultLayoutForLanguage(language)
    };
  }
}

// application/use-cases/keyboard-layouts/switch-keyboard-layout.ts
export class SwitchKeyboardLayoutUseCase {
  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private sessionRepository: ISessionRepository,
    private eventBus: IEventBus
  ) {}

  async execute(command: SwitchLayoutCommand): Promise<void> {
    const { sessionId, layoutId, userId } = command;
    
    // Validate layout exists and is compatible
    const layout = await this.layoutRepository.getLayoutById(layoutId);
    if (!layout) {
      throw new LayoutNotFoundError(layoutId);
    }
    
    // Update active session if exists
    if (sessionId) {
      const session = await this.sessionRepository.findById(sessionId);
      if (session) {
        session.activeLayout = layout;
        await this.sessionRepository.save(session);
      }
    }
    
    // Save user preference
    if (userId) {
      await this.layoutRepository.setUserPreferredLayout(
        userId, 
        layout.language, 
        layoutId
      );
    }
    
    // Publish layout changed event
    await this.eventBus.publish(new LayoutSwitchedEvent({
      sessionId,
      userId,
      previousLayoutId: command.previousLayoutId,
      newLayoutId: layoutId,
      timestamp: Date.now()
    }));
  }
}
```

### 4. Use Cases (Application Logic)

```typescript
// application/use-cases/typing/start-typing-session.ts
export class StartTypingSessionUseCase {
  constructor(
    private textGenerationService: ITextGenerationService,
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async execute(command: StartSessionCommand): Promise<TypingSession> {
    // 1. Validate user and permissions
    const user = await this.userRepository.findById(command.userId);
    if (!user && command.mode !== TypingMode.PRACTICE) {
      throw new UserNotFoundError();
    }

    // 2. Generate appropriate text content
    const textConfig: TextGenerationConfig = {
      language: command.language,
      difficulty: command.difficulty,
      textType: command.textType,
      length: command.duration,
      userId: command.userId // For personalized content
    };
    
    const textContent = await this.textGenerationService.generate(textConfig);

    // 3. Create typing session
    const session = TypingSession.create({
      userId: command.userId,
      mode: command.mode,
      difficulty: command.difficulty,
      language: command.language,
      textContent,
      duration: command.duration
    });

    // 4. Save session
    await this.sessionRepository.save(session);

    return session;
  }
}
```

### 5. Infrastructure Layer (Adapters)

#### Keyboard Layout Services

```typescript
// infrastructure/services/keyboard-layouts/layout-manager.service.ts
export class LayoutManagerService implements ILayoutManagerService {
  private layoutCache: Map<string, KeyboardLayout> = new Map();
  private layoutProviders: Map<LanguageCode, ILayoutProvider> = new Map();

  constructor(
    private layoutRepository: IKeyboardLayoutRepository,
    private logger: ILogger
  ) {
    this.initializeLayoutProviders();
  }

  private initializeLayoutProviders(): void {
    this.layoutProviders.set(LanguageCode.EN, new EnglishLayoutProvider());
    this.layoutProviders.set(LanguageCode.LI, new LisuLayoutProvider());
    this.layoutProviders.set(LanguageCode.MY, new MyanmarLayoutProvider());
  }

  async getLayoutsForLanguage(language: LanguageCode): Promise<KeyboardLayout[]> {
    const cacheKey = `layouts_${language}`;
    
    if (this.layoutCache.has(cacheKey)) {
      return this.layoutCache.get(cacheKey) as KeyboardLayout[];
    }

    const provider = this.layoutProviders.get(language);
    if (!provider) {
      throw new UnsupportedLanguageError(language);
    }

    const layouts = await provider.getAvailableLayouts();
    this.layoutCache.set(cacheKey, layouts);
    
    return layouts;
  }

  async validateLayout(layout: KeyboardLayout): Promise<ValidationResult> {
    const provider = this.layoutProviders.get(layout.language);
    if (!provider) {
      return { isValid: false, errors: ['Unsupported language'] };
    }

    return provider.validateLayout(layout);
  }
}

// infrastructure/services/keyboard-layouts/lisu-layouts.service.ts
export class LisuLayoutProvider implements ILayoutProvider {
  
  async getAvailableLayouts(): Promise<KeyboardLayout[]> {
    return [
      {
        id: 'lisu_sil_basic',
        name: 'SIL Basic',
        displayName: 'Lisu (SIL Basic)',
        language: LanguageCode.LI,
        layoutType: LayoutType.CUSTOM,
        variant: LayoutVariant.SIL_BASIC,
        keyMappings: this.getSILBasicMappings(),
        metadata: {
          description: 'Standard SIL basic layout for Lisu script',
          author: 'SIL International',
          version: '1.0',
          compatibility: ['Windows', 'macOS', 'Linux'],
          tags: ['official', 'basic', 'sil'],
          difficulty: DifficultyLevel.EASY,
          popularity: 85
        },
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'lisu_sil_standard',
        name: 'SIL Standard',
        displayName: 'Lisu (SIL Standard)',
        language: LanguageCode.LI,
        layoutType: LayoutType.CUSTOM,
        variant: LayoutVariant.SIL_STANDARD,
        keyMappings: this.getSILStandardMappings(),
        metadata: {
          description: 'Advanced SIL standard layout with extended characters',
          author: 'SIL International',
          version: '2.0',
          compatibility: ['Windows', 'macOS', 'Linux'],
          tags: ['official', 'standard', 'sil', 'extended'],
          difficulty: DifficultyLevel.MEDIUM,
          popularity: 70
        },
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'lisu_unicode_standard',
        name: 'Unicode Standard',
        displayName: 'Lisu (Unicode Standard)',
        language: LanguageCode.LI,
        layoutType: LayoutType.CUSTOM,
        variant: LayoutVariant.UNICODE_STANDARD,
        keyMappings: this.getUnicodeStandardMappings(),
        metadata: {
          description: 'Standard Unicode layout for Lisu script',
          author: 'Unicode Consortium',
          version: '1.0',
          compatibility: ['Windows', 'macOS', 'Linux', 'Web'],
          tags: ['unicode', 'standard', 'cross-platform'],
          difficulty: DifficultyLevel.MEDIUM,
          popularity: 60
        },
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  }

  private getSILBasicMappings(): KeyMapping[] {
    return [
      { 
        key: 'q', 
        character: 'ꓕ', 
        position: { row: 1, column: 1, finger: 'pinky', hand: 'left' } 
      },
      { 
        key: 'w', 
        character: 'ꓪ', 
        position: { row: 1, column: 2, finger: 'ring', hand: 'left' } 
      },
      // ... more mappings
    ];
  }
}
```

### 6. Infrastructure Layer (Adapters)

```typescript
// infrastructure/repositories/hybrid/hybrid-typing.repository.ts
export class HybridTypingRepository implements ITypingRepository {
  constructor(
    private appwriteRepository: AppwriteTypingRepository,
    private localRepository: LocalStorageTypingRepository,
    private logger: ILogger
  ) {}

  async save(test: TypingTest): Promise<void> {
    // Always save to localStorage for immediate access
    await this.localRepository.save(test);

    // Try to save to Appwrite, but don't fail if offline
    try {
      if (test.mode !== TypingMode.PRACTICE) {
        await this.appwriteRepository.save(test);
      }
    } catch (error) {
      this.logger.warn('Failed to save to Appwrite, will retry later', error);
      // Queue for retry when online
      await this.queueForSync(test);
    }
  }

  async getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]> {
    try {
      // Try Appwrite first for most recent data
      return await this.appwriteRepository.getUserTests(userId, filters);
    } catch (error) {
      this.logger.warn('Appwrite unavailable, using local storage', error);
      // Fallback to localStorage
      return await this.localRepository.getUserTests(userId, filters);
    }
  }
}
```

### 7. Presentation Layer (Clean Components)

#### Keyboard Layout Components

```typescript
// presentation/components/settings/keyboard-layout-selector.tsx
export function KeyboardLayoutSelector() {
  const { currentLanguage } = useLanguageSettings();
  const { 
    availableLayouts, 
    activeLayout, 
    isLoading, 
    error 
  } = useKeyboardLayouts(currentLanguage);
  const { switchLayout } = useLayoutSwitching();

  if (isLoading) return <LayoutSelectorSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="keyboard-layout-selector">
      <div className="layout-selector-header">
        <h3>Keyboard Layout</h3>
        <span className="language-indicator">{currentLanguage}</span>
      </div>
      
      <div className="layout-options">
        {availableLayouts.map(layout => (
          <LayoutOption
            key={layout.id}
            layout={layout}
            isActive={layout.id === activeLayout?.id}
            onSelect={() => switchLayout(layout.id)}
          />
        ))}
      </div>
      
      <LayoutPreview layout={activeLayout} />
      
      <div className="layout-actions">
        <Button variant="outline">
          Create Custom Layout
        </Button>
        <Button variant="outline">
          Import Layout
        </Button>
      </div>
    </div>
  );
}

function LayoutOption({ layout, isActive, onSelect }: LayoutOptionProps) {
  return (
    <div 
      className={cn("layout-option", { active: isActive })}
      onClick={onSelect}
    >
      <div className="layout-info">
        <div className="layout-name">{layout.displayName}</div>
        <div className="layout-meta">
          <span className="variant">{layout.variant}</span>
          <span className="difficulty">{layout.metadata.difficulty}</span>
        </div>
      </div>
      
      <div className="layout-stats">
        <div className="popularity">
          <Star className="w-4 h-4" />
          {layout.metadata.popularity}%
        </div>
        {layout.isCustom && (
          <Badge variant="secondary">Custom</Badge>
        )}
      </div>
      
      {isActive && <Check className="w-5 h-5 text-primary" />}
    </div>
  );
}

// presentation/hooks/keyboard-layouts/use-keyboard-layouts.ts
export function useKeyboardLayouts(language: LanguageCode) {
  const { container } = useDependencyInjection();
  const [state, setState] = useState<KeyboardLayoutsState>({
    availableLayouts: [],
    activeLayout: null,
    isLoading: true,
    error: null
  });

  const getLayoutsUseCase = container.resolve<GetAvailableLayoutsUseCase>(
    'GetAvailableLayoutsUseCase'
  );

  useEffect(() => {
    loadLayouts();
  }, [language]);

  const loadLayouts = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await getLayoutsUseCase.execute({ 
        language,
        userId: 'current_user_id' // Get from auth context
      });
      
      setState(prev => ({
        ...prev,
        availableLayouts: response.layouts,
        activeLayout: response.layouts.find(l => l.id === response.preferredLayoutId) 
          || response.layouts.find(l => l.id === response.defaultLayoutId)
          || response.layouts[0],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
    }
  };

  return {
    ...state,
    refetch: loadLayouts
  };
}
```

### 8. Presentation Layer (Clean Components)

```typescript
// presentation/components/typing/typing-container.tsx
export function TypingContainer() {
  const { session, error, isLoading } = useTypingSession();
  const { startSession, processInput, resetSession } = useSessionControls();

  if (error) return <ErrorDisplay error={error} onRetry={resetSession} />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="typing-container">
      {!session ? (
        <TypingSessionSetup onStart={startSession} />
      ) : (
        <>
          <TypingDisplay session={session} onInput={processInput} />
          <TypingControls session={session} onReset={resetSession} />
          <LiveStatistics session={session} />
        </>
      )}
    </div>
  );
}

// Clean hook with business logic separation
function useTypingSession() {
  const { container } = useDependencyInjection();
  const [state, setState] = useState<TypingSessionState>(initialState);
  
  const startSessionUseCase = container.resolve<StartTypingSessionUseCase>('StartTypingSessionUseCase');
  const processInputUseCase = container.resolve<ProcessTypingInputUseCase>('ProcessTypingInputUseCase');
  
  // Implementation with clean separation...
}
```

## 🎯 Multi-Layout Keyboard System

### Language-Specific Layout Support

#### **English Layouts**
- **QWERTY US**: Standard American layout
- **QWERTY UK**: British layout with £ symbol
- **QWERTY International**: Extended characters (é, ñ, etc.)
- **Dvorak**: Alternative efficiency layout
- **Colemak**: Modern ergonomic layout

#### **Lisu Layouts**
- **SIL Basic**: Simplified layout for beginners
  - Basic Lisu characters only
  - Minimal punctuation
  - Easy transition from English
- **SIL Standard**: Complete SIL keyboard
  - All Lisu Unicode characters
  - Tone marks and modifiers
  - Advanced punctuation
- **Unicode Standard**: Official Unicode layout
  - Cross-platform compatibility
  - Standard Unicode sequences
  - International standard compliance
- **Lisu Traditional**: Heritage-based layout
  - Traditional character arrangement
  - Cultural familiarity
  - Regional variations

#### **Myanmar Layouts**
- **Myanmar3**: Popular Windows layout
  - Widely used in Myanmar
  - Optimized for Myanmar Unicode
  - Font compatibility
- **Zawgyi**: Legacy encoding system
  - Backward compatibility
  - Older system support
  - Transition assistance
- **Unicode Standard**: Official Unicode layout
  - Modern standard compliance
  - Cross-platform support
  - Future-proof encoding
- **WinInnwa**: Traditional layout
  - Heritage typing system
  - Cultural familiarity
  - Legacy support

### Layout Management Features

```typescript
// Enhanced layout capabilities
export interface LayoutCapabilities {
  // Input method support
  directInput: boolean;           // Direct character input
  composeSupport: boolean;        // Multi-key composition
  transliteration: boolean;       // Roman-to-script conversion
  phoneticInput: boolean;         // Phonetic typing

  // Advanced features
  contextualShaping: boolean;     // Context-sensitive characters
  ligatureSupport: boolean;       // Character combinations
  toneMarkInput: boolean;         // Tone mark handling
  vowelOrdering: boolean;         // Automatic vowel reordering

  // Accessibility
  visualFeedback: boolean;        // Character preview
  audioFeedback: boolean;         // Sound indicators
  hapticFeedback: boolean;        // Touch vibration
  
  // Customization
  customizable: boolean;          // User modifications
  exportable: boolean;            // Layout sharing
  versionControl: boolean;        // Change tracking
}

// Layout switching and management
export interface LayoutSwitchingOptions {
  hotkeys: HotkeyConfig[];        // Quick switch shortcuts
  autoDetection: boolean;         // Content-based switching
  contextAware: boolean;          // Smart language detection
  smoothTransition: boolean;      // Seamless switching
  preserveState: boolean;         // Remember layout state
}
```

### Integration with Typing Modes

```typescript
// Different layouts for different modes
export interface ModeLayoutPreferences {
  practice: {
    suggestedLayouts: LayoutType[];  // Easier layouts for practice
    highlightingSupport: boolean;    // Visual character guides
    mistakeAnalysis: boolean;        // Layout-specific error tracking
  };
  
  normal: {
    preferredLayout: string;         // User's preferred layout
    adaptiveDifficulty: boolean;     // Layout-based difficulty
    performanceTracking: boolean;    // Layout-specific metrics
  };
  
  competition: {
    standardizedLayouts: string[];   // Allowed competition layouts
    layoutVerification: boolean;     // Ensure fair competition
    layoutLocking: boolean;          // Prevent mid-test switching
  };
}
```

## 🔄 Migration Strategy

### Phase 1: Foundation Setup (Week 1-2)
**Goal**: Establish the new architecture foundation

#### Week 1: Domain Layer
- [ ] Create domain entities and enums
- [ ] Define repository interfaces
- [ ] Establish value objects and business rules
- [ ] Create domain events system
- [ ] **Design keyboard layout entities and enums**
- [ ] **Define layout repository interfaces**

#### Week 2: Dependency Injection
- [ ] Implement DI container
- [ ] Set up service bindings
- [ ] Create provider composition root
- [ ] Test DI system with mock implementations
- [ ] **Register keyboard layout services**

### Phase 2: Infrastructure Layer (Week 3-4)
**Goal**: Implement data access and external services

#### Week 3: Repository Implementation
- [ ] Create Appwrite repository implementations
- [ ] Implement LocalStorage repositories
- [ ] Build hybrid repository with offline support
- [ ] Add error handling and retry mechanisms
- [ ] **Implement keyboard layout repositories**
- [ ] **Create layout provider services (SIL Basic, Standard, etc.)**

#### Week 4: Services Layer
- [ ] Implement text generation services
- [ ] Create performance analytics services
- [ ] Build notification system
- [ ] Add background sync capabilities
- [ ] **Build layout manager service**
- [ ] **Implement layout validation and switching**

### Phase 3: Application Layer (Week 5-6)
**Goal**: Implement business logic use cases

#### Week 5: Core Use Cases
- [ ] StartTypingSessionUseCase
- [ ] ProcessTypingInputUseCase
- [ ] CompleteTypingSessionUseCase
- [ ] CalculateUserStatisticsUseCase
- [ ] **GetAvailableLayoutsUseCase**
- [ ] **SwitchKeyboardLayoutUseCase**

#### Week 6: Advanced Use Cases
- [ ] Competition management use cases
- [ ] Performance analysis use cases
- [ ] Content generation use cases
- [ ] User recommendation use cases
- [ ] **Layout validation and compatibility use cases**
- [ ] **Custom layout creation use cases**

### Phase 4: Presentation Refactoring (Week 7-8)
**Goal**: Refactor UI components to use new architecture

#### Week 7: Core Components
- [ ] Break down `data-box.tsx` into smaller components
- [ ] Implement new typing session hooks
- [ ] Create clean component hierarchy
- [ ] Add proper error boundaries
- [ ] **Create keyboard layout selector component**
- [ ] **Implement layout switching hooks**

#### Week 8: Advanced Features
- [ ] Implement competition UI
- [ ] Enhanced statistics dashboard
- [ ] Improved leaderboard with filters
- [ ] Settings and preferences UI
- [ ] **Build keyboard layout preview component**
- [ ] **Add layout-specific visual feedback**

### Phase 5: Testing & Optimization (Week 9-10)
**Goal**: Ensure reliability and performance

#### Week 9: Testing
- [ ] Unit tests for domain entities
- [ ] Integration tests for use cases
- [ ] Component tests for UI
- [ ] End-to-end testing scenarios

#### Week 10: Performance & Polish
- [ ] Performance optimization
- [ ] Memory leak detection and fixes
- [ ] Bundle size optimization
- [ ] Accessibility improvements

## 🚀 Extensibility Features Ready for Future

### 1. **Real-time Multiplayer Racing**
```typescript
// Already supported by the architecture
interface MultiplayerSession extends TypingSession {
  roomId: string;
  participants: Participant[];
  isHost: boolean;
}

// New use case can be easily added
class JoinMultiplayerRaceUseCase { ... }
```

### 2. **AI-Powered Typing Coach**
```typescript
// Can be added as a new service
interface ITypingCoachService {
  analyzePerformance(session: TypingSession): Promise<CoachingTips>;
  generatePersonalizedContent(userId: string): Promise<string>;
  trackImprovement(userId: string): Promise<ImprovementPlan>;
}
```

### 3. **Advanced Analytics & Insights**
```typescript
// New analytics can be plugged in easily
interface IAdvancedAnalyticsService {
  analyzeTypingPatterns(tests: TypingTest[]): Promise<TypingPatterns>;
  predictPerformance(userId: string): Promise<PerformancePrediction>;
  generateInsights(userId: string): Promise<TypingInsights>;
}
```

### 4. **Plugin System for Custom Languages & Layouts**
```typescript
// Enhanced language and layout plugin system
interface ILanguageLayoutPlugin {
  languageCode: LanguageCode;
  layouts: KeyboardLayout[];
  textGenerator: ITextGenerationService;
  layoutProviders: ILayoutProvider[];
  inputMethods: InputMethod[];
  validate(text: string): boolean;
  
  // New keyboard-specific features
  getDefaultLayout(): KeyboardLayout;
  getSupportedVariants(): LayoutVariant[];
  createCustomLayout(config: CustomLayoutConfig): Promise<KeyboardLayout>;
  validateLayoutCompatibility(layout: KeyboardLayout): ValidationResult;
}

// Dynamic layout registration
interface ILayoutRegistry {
  registerLayout(layout: KeyboardLayout): Promise<void>;
  unregisterLayout(layoutId: string): Promise<void>;
  getLayoutsByLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;
  searchLayouts(criteria: LayoutSearchCriteria): Promise<KeyboardLayout[]>;
}
```

### 5. **Advanced Typing Analytics per Layout**
```typescript
// Layout-specific analytics
interface ILayoutAnalyticsService {
  analyzeLayoutPerformance(
    userId: string, 
    layoutId: string
  ): Promise<LayoutPerformanceMetrics>;
  
  compareLayoutEfficiency(
    layoutIds: string[]
  ): Promise<LayoutComparisonReport>;
  
  recommendOptimalLayout(
    userId: string,
    language: LanguageCode
  ): Promise<LayoutRecommendation>;
  
  trackLayoutSwitchingPatterns(
    userId: string
  ): Promise<SwitchingAnalytics>;
}

// Layout-specific metrics
interface LayoutPerformanceMetrics {
  layoutId: string;
  avgWpm: number;
  avgAccuracy: number;
  fingerUtilization: Record<FingerAssignment, number>;
  mostProblematicKeys: string[];
  learningCurve: DataPoint[];
  comfortLevel: number; // 1-10 scale
}
```

### 5. **Themes and Customization Engine**
```typescript
// Theme system can be extended
interface IThemeEngine {
  loadTheme(themeId: string): Promise<Theme>;
  createCustomTheme(config: ThemeConfig): Promise<Theme>;
  applyTheme(theme: Theme): void;
}
```

## 📊 Benefits of New Architecture

### Immediate Benefits
- **Reduced Complexity**: Break down 600+ line `data-box.tsx` into focused components
- **Better Testing**: Independent testing of business logic
- **Improved Performance**: Lazy loading and optimized re-renders
- **Enhanced Reliability**: Better error handling and offline support

### Long-term Benefits
- **Easy Feature Addition**: New typing modes require minimal code changes
- **Team Scalability**: Multiple developers can work on different layers
- **Maintainability**: Clear boundaries make debugging easier
- **Future-Proof**: Architecture supports advanced features like AI coaching

### Technical Improvements
- **Type Safety**: Strong typing throughout all layers
- **Performance**: Optimized re-renders and memory usage
- **Offline Support**: Seamless offline/online experience
- **Error Resilience**: Graceful degradation when services fail

## 🔧 Development Guidelines

### Component Guidelines
- Keep components under 100 lines
- Single responsibility per component
- Use custom hooks for business logic
- Implement proper error boundaries

### Hook Guidelines
- Business logic in custom hooks
- UI state separate from business state
- Use dependency injection for services
- Handle loading and error states

### Service Guidelines
- Interface-first design
- Dependency injection
- Proper error handling
- Async/await patterns

### Testing Guidelines
- Unit tests for domain entities
- Integration tests for use cases
- Component tests with React Testing Library
- E2E tests for critical flows

This architecture provides a solid foundation for the current Typoria application while ensuring it can easily evolve to support advanced features like AI coaching, real-time multiplayer, and sophisticated analytics.
