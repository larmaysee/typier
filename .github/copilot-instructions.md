# Typoria - AI Coding Assistant Instructions

## Project Overview
Typoria is a multilingual typing test application built with **Next.js 15** and **TypeScript**, implementing **Clean Architecture** with proper separation of concerns. The app features support for English, Lisu, and Myanmar languages with multiple keyboard layouts per language, three distinct typing modes (Practice, Normal, Competition), and uses **static export** (`output: "export"`) with a custom build directory (`build/`) running on port **3005**.

## 🏗️ Clean Architecture Overview

### Architecture Layers
- **Domain Layer** (`src/domain/`): Core business entities, enums, value objects, and interfaces
- **Application Layer** (`src/application/`): Use cases, DTOs, commands, queries, and business services
- **Infrastructure Layer** (`src/infrastructure/`): Repositories, external services, persistence, and DI container
- **Presentation Layer** (`src/presentation/`): React components, hooks, providers, and pages
- **Shared Layer** (`src/shared/`): Utilities, constants, types, errors, and events
- **Config Layer** (`src/config/`): Application configuration and environment settings

### Design Principles
- **Clean Architecture**: Domain-centric design with dependency inversion
- **SOLID Principles**: Single responsibility, open/closed, dependency injection
- **Hexagonal Architecture**: Ports and adapters pattern for external dependencies
- **CQRS Pattern**: Separate read/write operations with commands and queries

## 🎯 Core Business Features

### 1. Three Typing Modes
- **Practice Mode**: 
  - No database recording, enhanced visual feedback
  - Character highlighting and mistake analysis
  - Difficulty levels: Easy, Medium, Hard
  - Real-time guidance and tips
- **Normal Mode**: 
  - Records to database and leaderboard
  - Auto-difficulty based on user performance
  - Performance tracking and statistics
- **Competition Mode**: 
  - Daily/weekly challenges with fixed content
  - Standardized layouts and time limits
  - Special leaderboards and rankings
  - Fair competition with layout locking

### 2. Multi-Layout Keyboard System
#### **Language Support with Multiple Layouts**:
- **English**: QWERTY US/UK/International, Dvorak, Colemak
- **Lisu**: SIL Basic, SIL Standard, Unicode Standard, Traditional
- **Myanmar**: Myanmar3, Zawgyi, Unicode Standard, WinInnwa

#### **Layout Features**:
- User preferences per language
- Dynamic layout switching
- Custom layout creation
- Layout performance analytics
- Cross-platform compatibility

### 3. Enhanced Data Models
#### Core Domain Entities:
```typescript
// Typing with layout support
interface Typing {
  id: string; userId: string; mode: TypingMode;
  difficulty: DifficultyLevel; language: LanguageCode;
  keyboardLayout: KeyboardLayoutId; textContent: string;
  results: TypingResults; timestamp: number;
  competitionId?: string;
}

// Enhanced TypingSession
interface TypingSession {
  id: string; test: Typing; currentInput: string;
  startTime: number | null; timeLeft: number; status: SessionStatus;
  cursorPosition: CursorPosition; focusState: FocusState;
  mistakes: TypingMistake[]; liveStats: LiveTypingStats;
  activeLayout: KeyboardLayout;
}

// KeyboardLayout entity
interface KeyboardLayout {
  id: string; name: string; displayName: string;
  language: LanguageCode; layoutType: LayoutType;
  variant: LayoutVariant; keyMappings: KeyMapping[];
  metadata: LayoutMetadata; isCustom: boolean;
}
```

## Development Workflow

### Build & Development
- **Dev Server**: `npm run dev` (Turbopack enabled, port 3005)
- **Static Export**: `npm run build` creates static files in `build/` directory
- **Path Aliases**: Use `@/` for `src/` imports (configured in `tsconfig.json`)
- **Architecture**: Follow clean architecture patterns with proper layer separation

### New Folder Structure (Clean Architecture)
```
src/
├── domain/              # Core business logic (no dependencies)
│   ├── entities/        # Typing, , TypingRypingResulultss, TypingSession, KeyboardLayout, etc.
│   ├── enums/          # TypingMode, DifficultyLevel, LayoutVariant, etc.
│   ├── value-objects/  # CursorPosition, TypingMetrics, etc.
│   └── interfaces/     # Repository contracts, service interfaces
├── application/         # Business logic orchestration
│   ├── use-cases/      # StartTypingSession, SwitchKeyboardLayout, etc.
│   ├── dto/           # Data transfer objects
│   ├── commands/      # Command objects
│   └── queries/       # Query objects
├── infrastructure/     # External dependencies
│   ├── repositories/  # Appwrite, LocalStorage, Hybrid implementations
│   ├── services/      # Text generation, layout management
│   ├── persistence/   # Database clients, storage adapters
│   └── di/           # Dependency injection container
├── presentation/      # UI layer (React components)
│   ├── components/    # Clean, focused components
│   ├── hooks/        # Business logic hooks
│   ├── providers/    # React context providers
│   └── pages/        # Page components
├── shared/           # Shared utilities
│   ├── utils/        # Pure utility functions
│   ├── constants/    # Application constants
│   ├── types/        # Shared TypeScript types
│   └── errors/       # Custom error classes
└── config/           # Configuration files
```

### Styling & UI
- **Framework**: Tailwind CSS with custom CSS variables for theming
- **Component Library**: shadcn/ui components in `src/presentation/components/ui/`
- **Architecture**: Components follow clean architecture with separation of concerns
- **Theme System**: `next-themes` with light/dark/system modes
- **Icons**: Lucide React (`lucide-react` package)
- **Layout System**: Multi-layout keyboard support with visual previews

### External Dependencies
- **Authentication**: Appwrite SDK with graceful degradation (via repository pattern)
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Fonts**: Geist Sans & Mono (local fonts in `src/app/fonts/`)
- **Architecture**: Dependency injection with clean interfaces
- **Data Persistence**: Hybrid approach (Appwrite + LocalStorage) via repository pattern
- **Appwrite Integration**: Use Appwrite MCP server tools for database operations, authentication, and API interactions

## Project-Specific Conventions

### Clean Architecture Patterns
1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Use cases orchestrate business logic
3. **Infrastructure Layer**: External services, repositories, persistence
4. **Presentation Layer**: Clean React components with focused responsibilities
5. **Dependency Injection**: Services resolved via DI container

### Component Guidelines
1. **Separation of Concerns**: UI logic separate from business logic
2. **Hook Pattern**: Business logic in custom hooks (e.g., `useTypingSession`, `useKeyboardLayouts`)
3. **Repository Pattern**: Data access through repository interfaces
4. **Use Case Pattern**: Complex operations through dedicated use cases
5. **Error Boundaries**: Proper error handling at component boundaries

### File Naming Conventions
- **Domain Entities**: kebab-case (e.g., `typing.ts`, `keyboard-layout.ts`)
- **Use Cases**: kebab-case with descriptive names (e.g., `start-typing-session.ts`, `switch-keyboard-layout.ts`)
- **Repositories**: kebab-case with suffix (e.g., `appwrite-typing.repository.ts`, `hybrid-typing.repository.ts`)
- **Components**: kebab-case (e.g., `typing-container.tsx`, `keyboard-layout-selector.tsx`)
- **Services**: kebab-case with suffix (e.g., `layout-manager.service.ts`, `text-generator.service.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTypingSession`, `useKeyboardLayouts`)

### Environment Configuration
- **Appwrite**: Optional integration via `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- **Graceful Degradation**: App functions without backend (localStorage fallback via hybrid repository)
- **Feature Flags**: Environment-based feature toggles in `config/feature-flags.config.ts`
- **Architecture**: Repository pattern enables seamless online/offline operation
- **Appwrite Development**: When working with Appwrite features (authentication, database operations, user management), use the Appwrite MCP server tools for accurate API documentation and code examples

## Critical Integration Points

### Typing Mode System
The application supports three distinct typing modes:

```typescript
enum TypingMode {
  PRACTICE = "practice",  // No DB recording, enhanced feedback
  NORMAL = "normal",      // DB recording, leaderboard integration  
  COMPETITION = "competition" // Daily challenges, standardized layouts
}
```

### Multi-Layout Keyboard System
Each language supports multiple keyboard layouts:

```typescript
// Language-Layout mapping
const SUPPORTED_LAYOUTS = {
  [LanguageCode.EN]: ['qwerty-us', 'qwerty-uk', 'dvorak', 'colemak'],
  [LanguageCode.LI]: ['sil-basic', 'sil-standard', 'unicode-standard', 'traditional'],
  [LanguageCode.MY]: ['myanmar3', 'zawgyi', 'unicode-standard', 'wininnwa']
};

// Layout switching via use cases
const switchLayoutUseCase = container.resolve<SwitchKeyboardLayoutUseCase>('SwitchKeyboardLayoutUseCase');
await switchLayoutUseCase.execute({ sessionId, layoutId, userId });
```

### Data Flow Architecture
1. **UI Components** trigger actions → **Custom Hooks** 
2. **Custom Hooks** call → **Use Cases** via DI container
3. **Use Cases** coordinate → **Domain Services** and **Repositories**
4. **Repositories** handle → **Data Persistence** (Appwrite + LocalStorage)

### Session Management
Sessions are managed through clean use cases:
- `StartTypingSessionUseCase`: Initialize new typing session
- `ProcessTypingInputUseCase`: Handle real-time input processing
- `CompleteTypingSessionUseCase`: Finalize session and save results
- `PauseResumeSessionUseCase`: Handle session state transitions

### Statistics and Analytics
Statistics calculation through dedicated services:
- **Per-Mode Analytics**: Different tracking for Practice/Normal/Competition
- **Layout Performance**: Track efficiency per keyboard layout
- **User Improvement**: Trend analysis and recommendations
- **Leaderboard Integration**: Mode-specific rankings

### Language-Specific Features
- **Difficulty Modes**: `chars` (individual characters) vs `sentences` (full text passages)
- **Layout Variants**: Each language has multiple input methods and layouts
- **Cultural Adaptation**: Layout preferences based on regional usage
- **Unicode Support**: Special handling for Lisu and Myanmar scripts with proper rendering

## Architecture Guidelines

### When Working with This Codebase

1. **Use Cases First**: Complex operations should go through use cases, not direct repository calls
2. **Repository Pattern**: Always access data through repository interfaces
3. **Dependency Injection**: Resolve services through the DI container
4. **Clean Components**: UI components should be pure and delegate business logic to hooks
5. **Type Safety**: Use strong typing for all domain entities and value objects

### Component Development
- Use `useTypingSession()` for typing session state management
- Use `useKeyboardLayouts()` for layout selection and switching
- Use `useUserStatistics()` for performance data
- Implement error boundaries for graceful error handling
- Follow the dependency injection pattern for service access

### Data Migration
When refactoring existing components:
1. Extract business logic to use cases
2. Move data access to repositories 
3. Create clean hooks that use the DI container
4. Update components to use the new hooks
5. Maintain backward compatibility during transition

This architecture prioritizes extensibility, testability, and maintainability while preserving the multilingual typing test functionality with enhanced keyboard layout support.
