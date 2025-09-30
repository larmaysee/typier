## 🎯 Goal

Implement core business logic use cases that orchestrate domain entities and infrastructure services. These use cases handle the primary typing test workflows with keyboard layout integration.

## 📋 Tasks

### Typing Session Use Cases (`src/application/use-cases/typing/`)

- [ ] Create `start-typing-session.ts` - Initialize new typing session with layout selection
- [ ] Create `process-typing-input.ts` - Handle real-time input processing and validation
- [ ] Create `complete-typing-session.ts` - Finalize session, calculate results, save data
- [ ] Create `pause-resume-session.ts` - Handle session state transitions
- [ ] Add support for different typing modes (Practice, Normal, Competition)

### Keyboard Layout Use Cases (`src/application/use-cases/keyboard-layouts/`)

- [ ] Create `get-available-layouts.ts` - Retrieve layouts by language with user preferences
- [ ] Create `switch-keyboard-layout.ts` - Change active layout during session
- [ ] Create `validate-layout-compatibility.ts` - Check layout compatibility with content
- [ ] Create `customize-layout.ts` - Create and save custom keyboard layouts
- [ ] Implement layout preference persistence per user

### Statistics Use Cases (`src/application/use-cases/statistics/`)

- [ ] Create `calculate-user-statistics.ts` - Compute comprehensive performance metrics
- [ ] Create `get-leaderboard.ts` - Retrieve rankings with filtering options
- [ ] Create `track-improvement.ts` - Analyze progress trends and patterns
- [ ] Add layout-specific performance analytics

### Supporting Structures (`src/application/`)

- [ ] Create DTOs in `dto/` for data transfer between layers
- [ ] Create Commands in `commands/` for write operations
- [ ] Create Queries in `queries/` for read operations
- [ ] Implement proper validation and error handling

## 🏗️ Architecture Patterns

- **Use Case Pattern** - Single responsibility business operations
- **Command Query Separation** - Separate read and write operations
- **DTO Pattern** - Clean data transfer between layers
- **Result Pattern** - Explicit success/failure handling

## 📁 Expected Folder Structure

```
src/application/
├── use-cases/
│   ├── typing/
│   │   ├── start-typing-session.ts
│   │   ├── process-typing-input.ts
│   │   ├── complete-typing-session.ts
│   │   └── pause-resume-session.ts
│   ├── keyboard-layouts/
│   │   ├── get-available-layouts.ts
│   │   ├── switch-keyboard-layout.ts
│   │   ├── validate-layout-compatibility.ts
│   │   └── customize-layout.ts
│   └── statistics/
│       ├── calculate-user-statistics.ts
│       ├── get-leaderboard.ts
│       └── track-improvement.ts
├── dto/
│   ├── typing-session.dto.ts
│   ├── statistics.dto.ts
│   └── keyboard-layout.dto.ts
├── commands/
│   ├── start-session.command.ts
│   ├── switch-layout.command.ts
│   └── complete-session.command.ts
└── queries/
    ├── get-layouts.query.ts
    ├── get-user-stats.query.ts
    └── get-leaderboard.query.ts
```

## 🔧 Technical Requirements

### Start Typing Session Use Case

```typescript
interface StartSessionCommand {
  userId: string;
  mode: TypingMode;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  keyboardLayoutId?: string; // User's preferred layout
  duration: number;
  textType: TextType;
}

interface StartSessionResult {
  session: TypingSession;
  textContent: string;
  activeLayout: KeyboardLayout;
}
```

### Keyboard Layout Integration Priority

- Layout selection affects text generation (difficulty, character sets)
- Layout switching validates compatibility with current content
- Layout preferences saved per user per language
- Performance metrics tracked per layout

### Multi-Mode Support

- **Practice Mode**: No database recording, enhanced feedback, layout learning aids
- **Normal Mode**: Full recording, leaderboards, adaptive difficulty
- **Competition Mode**: Standardized layouts, fair competition rules

### Input Processing Requirements

- Real-time typing validation
- Error detection and correction tracking
- Layout-specific input handling
- Performance metrics calculation (WPM, accuracy, consistency)
- Mistake analysis and finger utilization

## ✅ Acceptance Criteria

- [ ] All use cases properly orchestrate domain logic
- [ ] Keyboard layout integration works seamlessly
- [ ] Different typing modes handled correctly
- [ ] Proper error handling with domain-specific errors
- [ ] Performance metrics calculated accurately
- [ ] Data validation at application boundaries
- [ ] Use cases are testable in isolation
- [ ] Proper logging for debugging and monitoring

## 🧪 Testing Strategy

- [ ] Unit tests for each use case with mocked dependencies
- [ ] Integration tests with real repositories and services
- [ ] Edge case testing (network failures, invalid input)
- [ ] Performance testing for real-time input processing
- [ ] Layout switching scenario testing
- [ ] Multi-mode functionality verification

## 🔗 Dependencies

- **Requires**: Phase 1 Domain Layer (entities, interfaces)
- **Requires**: Phase 2 Infrastructure Layer (repositories, services)
- **Enables**: Phase 4 Presentation Layer (clean hooks and components)

## 🎮 User Experience Focus

- Smooth layout switching without losing typing context
- Intelligent layout recommendations based on content
- Seamless offline/online mode transitions
- Real-time performance feedback
- Personalized difficulty adaptation

## 📚 Reference

See `/docs/plan-refactor.md` sections on use case implementation and keyboard layout system integration.
