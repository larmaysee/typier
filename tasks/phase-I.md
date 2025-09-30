## Phase 1: Foundation Setup – Create Domain Layer Architecture

### 🎯 Goal

Establish the foundation of clean architecture by creating the domain layer with entities, enums, value objects, and repository interfaces. This is the core business logic layer with **no external dependencies**.

---

### 📋 Tasks

#### Core Domain Entities (`src/domain/entities/`)

- [ ] Create `typing.ts` – TypingTest, TypingResults, TypingSession entities
- [ ] Create `user.ts` – User, UserPreferences, UserProfile entities
- [ ] Create `keyboard-layout.ts` – KeyboardLayout, KeyMapping, LayoutMetadata entities
- [ ] Create `statistics.ts` – TypingStatistics, LeaderboardEntry entities
- [ ] Create `competition.ts` – Competition, CompetitionEntry entities

#### Domain Enums (`src/domain/enums/`)

- [ ] Create `typing-mode.ts` – TypingMode, DifficultyLevel, SessionStatus enums
- [ ] Create `languages.ts` – LanguageCode, TextType enums
- [ ] Create `keyboard-layouts.ts` – LayoutType, LayoutVariant, InputMethod enums
- [ ] Create `competition-types.ts` – CompetitionType, CompetitionStatus enums

#### Value Objects (`src/domain/value-objects/`)

- [ ] Create `cursor-position.ts` – CursorPosition, FocusState value objects
- [ ] Create `typing-metrics.ts` – WPM, Accuracy, Duration calculations
- [ ] Create `text-content.ts` – TextContent, DifficultyConfig value objects

#### Repository Interfaces (`src/domain/interfaces/`)

- [ ] Create `repositories.ts` – ITypingRepository, IUserRepository, ICompetitionRepository, IKeyboardLayoutRepository
- [ ] Create `services.ts` – External service contracts
- [ ] Create `events.ts` – Domain events for decoupling

---

### 🏗️ Architecture Principles

- **No External Dependencies**: Domain layer must be pure business logic
- **Rich Domain Models**: Entities contain business rules and validation
- **Immutable Value Objects**: Value objects should be immutable
- **Clear Interfaces**: Repository contracts define data access ports

---

### 📁 Expected Folder Structure

```
src/domain/
├── entities/
│   ├── typing.ts
│   ├── user.ts
│   ├── keyboard-layout.ts
│   ├── statistics.ts
│   └── competition.ts
├── enums/
│   ├── typing-mode.ts
│   ├── languages.ts
│   ├── keyboard-layouts.ts
│   └── competition-types.ts
├── value-objects/
│   ├── cursor-position.ts
│   ├── typing-metrics.ts
│   └── text-content.ts
└── interfaces/
    ├── repositories.ts
    ├── services.ts
    └── events.ts
```

---

### 🎯 Keyboard Layout System Priority

Focus especially on the keyboard layout entities and enums as this is a core feature:

- Multiple layout support per language (English: QWERTY/Dvorak/Colemak, Lisu: SIL Basic/Standard/Unicode, Myanmar: Myanmar3/Zawgyi/Unicode)
- Layout switching and user preferences
- Custom layout creation capabilities

---

### ✅ Acceptance Criteria

- [ ] All domain entities properly typed with TypeScript
- [ ] Repository interfaces follow dependency inversion principle
- [ ] No imports from infrastructure, application, or presentation layers
- [ ] Business rules implemented in domain entities
- [ ] Value objects are immutable and validated
- [ ] Clear separation between entities and data transfer objects

---

### 🔗 Related Issues

This is the foundation for all subsequent refactoring phases. Must be completed before Phase 2 Infrastructure Layer work can begin.

---

### 📚 Reference

See `/docs/plan-refactor.md` for detailed specifications and examples.
