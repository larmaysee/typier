# Application Layer Implementation Examples

This directory contains the full Application Layer implementation for the Typier application following Clean Architecture principles.

## Structure

```
src/application/
├── use-cases/
│   ├── typing/                     # Typing session management
│   ├── keyboard-layouts/           # Layout management
│   └── statistics/                 # Analytics and reporting
├── dto/                           # Data transfer objects
├── commands/                      # Command objects for write operations
└── queries/                       # Query objects for read operations
```

## Key Features

### Typing Session Management
- **StartTypingSessionUseCase**: Initialize new typing sessions with layout selection
- **ProcessTypingInputUseCase**: Real-time input processing and validation
- **CompleteTypingSessionUseCase**: Finalize sessions and save results
- **PauseResumeSessionUseCase**: Handle session state transitions

### Keyboard Layout Management
- **GetAvailableLayoutsUseCase**: Retrieve layouts by language with user preferences
- **SwitchKeyboardLayoutUseCase**: Change active layout during sessions
- **ValidateLayoutCompatibilityUseCase**: Check layout compatibility with content
- **CustomizeLayoutUseCase**: Create and save custom layouts

### Statistics and Analytics
- **CalculateUserStatisticsUseCase**: Comprehensive performance metrics
- **GetLeaderboardUseCase**: Rankings with filtering options
- **TrackImprovementUseCase**: Progress analysis and recommendations

## Usage Example

```typescript
import { StartTypingSessionUseCase } from '@/application/use-cases';
import { TypingMode, DifficultyLevel, TextType } from '@/domain/entities/typing';

// Example usage of starting a typing session
const startSession = new StartTypingSessionUseCase(
  sessionRepository,
  userRepository,
  layoutRepository,
  textGenerationService
);

const result = await startSession.execute({
  userId: 'user123',
  mode: TypingMode.NORMAL,
  difficulty: DifficultyLevel.MEDIUM,
  language: LanguageCode.EN,
  keyboardLayoutId: 'qwerty-us',
  duration: 60,
  textType: TextType.SENTENCES
});
```

## Design Patterns

- **Use Case Pattern**: Single responsibility business operations
- **Command Query Separation**: Separate read and write operations
- **DTO Pattern**: Clean data transfer between layers
- **Dependency Injection**: Loose coupling between layers
- **Repository Pattern**: Abstract data access

## Multi-Mode Support

The implementation supports three distinct typing modes:

1. **Practice Mode**: No database recording, enhanced feedback
2. **Normal Mode**: Full recording, leaderboards, adaptive difficulty
3. **Competition Mode**: Standardized layouts, fair competition rules

## Keyboard Layout Integration

- Layout selection affects text generation and difficulty
- Layout switching validates compatibility with current content
- Layout preferences saved per user per language
- Performance metrics tracked per layout