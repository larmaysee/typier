````instructions
# Typoria - AI Coding Assistant Instructions

## Project Overview
Typoria is a **multilingual typing test application** with **Clean Architecture** supporting English, Lisu, and Myanmar languages. Built with **Next.js 15**, **TypeScript**, and **static export** (`output: "export"`) to `build/` directory on port **3002**.

## 🏗️ Architecture Patterns

### Clean Architecture Layers (Strict Dependency Rules)
```
Presentation → Application → Domain ← Infrastructure
```
- **Domain** (`src/domain/`): Entities, enums, interfaces - ZERO external dependencies
- **Application** (`src/application/`): Use cases, DTOs, commands - only depends on Domain
- **Infrastructure** (`src/infrastructure/`): Repositories, services, DI - depends on Domain
- **Presentation** (`src/presentation/`): React components, hooks - depends on Application

### Critical DI Pattern
**ALL business logic flows through the DI container:**
```typescript
// ✅ CORRECT: Always resolve services through container
const { container } = useDependencyInjection();
const useCase = container.resolve<StartTypingSessionUseCase>('StartTypingSessionUseCase');

// ❌ WRONG: Never instantiate directly
const useCase = new StartTypingSessionUseCase(...);
```

### Repository Pattern (Online/Offline Hybrid)
The app automatically switches between data sources:
```typescript
// HybridTypingRepository automatically:
// 1. Always saves to localStorage (immediate)
// 2. Attempts Appwrite sync (if online)
// 3. Queues for later sync (if offline)
```

## 🎯 Core Business Logic

### Three Typing Modes (Key Differentiator)
- **Practice**: No recording, enhanced feedback, character-by-character analysis
- **Normal**: Database recording, leaderboards, auto-difficulty
- **Competition**: Fixed content, standardized layouts, fair rankings

### Multi-Layout Keyboard System
Each language has multiple layouts - **critical for UX:**
```typescript
const LAYOUTS = {
  [LanguageCode.EN]: ['qwerty-us', 'dvorak', 'colemak'],
  [LanguageCode.LI]: ['sil-basic', 'sil-standard', 'unicode-standard'],
  [LanguageCode.MY]: ['myanmar3', 'zawgyi', 'unicode-standard']
};
```

## 🛠️ Development Patterns

### Use Cases Are Mandatory for Complex Operations
```typescript
// ✅ Complex business logic through use cases
const startSession = container.resolve<StartTypingSessionUseCase>('StartTypingSessionUseCase');
await startSession.execute({ userId, language, mode, difficulty });

// ✅ Simple data access through repositories
const user = await userRepository.findById(userId);
```

### Component Architecture (Clean Separation)
```typescript
// ✅ Components delegate to hooks, hooks use DI container
function TypingContainer() {
  const { session, error } = useTypingSession(); // Business logic
  const { processInput } = useSessionControls();  // User interactions

  return <TypingDisplay session={session} onInput={processInput} />;
}

function useTypingSession() {
  const { container } = useDependencyInjection();
  const useCase = container.resolve<ProcessTypingInputUseCase>('ProcessTypingInputUseCase');
  // Hook implementation
}
```

### File Naming Conventions (Enforced)
- **Use Cases**: `kebab-case.ts` (e.g., `start-typing-session.ts`)
- **Repositories**: `kebab-case.repository.ts` (e.g., `hybrid-typing.repository.ts`)
- **Components**: `kebab-case.tsx` (e.g., `typing-display.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useTypingSession`)

## 🔧 Development Workflow

### Essential Commands
- **Dev**: `npm run dev` (Turbopack enabled, port 3002)
- **Build**: `npm run build` (static export to `build/`)
- **DI Debug**: Visit `/di-test` to inspect service resolution

### Environment Setup (Optional Appwrite)
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_DATABASE_ID=typoria-db
```
**App works offline without Appwrite** - uses localStorage fallback.

### Service Registration (Critical Pattern)
New services MUST be registered in `src/infrastructure/di/bindings.ts`:
```typescript
container.registerSingleton(SERVICE_TOKENS.NEW_SERVICE, () => new MockNewService());
// Use MockXXXService for development, real implementations for production
```

## 🎨 UI Patterns

### Styling Stack
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components in `src/presentation/components/ui/`
- **next-themes** for dark/light mode
- **Lucide React** for icons

### Layout System (Unique Feature)
Real-time keyboard layout switching with visual feedback:
```typescript
// Layout changes trigger re-render of typing interface
const { switchLayout } = useKeyboardLayouts();
await switchLayout(session.id, 'dvorak', user.id);
```

## 🧪 Testing & Debugging

### DI System Health Check
```typescript
// Check service resolution at `/di-test`
const healthReport = await ServiceProvider.healthCheck();
console.log('Unregistered:', healthReport.errors);
```

### Architecture Validation
```typescript
// Verify clean architecture boundaries
const repository = container.resolve<ITypingRepository>('TypingRepository');
console.log(repository.constructor.name); // Should be HybridTypingRepository
```

## 📱 Key Integration Points

### Typing Session Lifecycle
1. **Start** → `StartTypingSessionUseCase` → Creates session entity
2. **Input** → `ProcessTypingInputUseCase` → Updates live stats
3. **Complete** → `CompleteTypingSessionUseCase` → Saves results + updates statistics

### Data Flow (Hybrid Persistence)
```
UI Input → Hook → Use Case → Repository → [localStorage + Appwrite]
                                     ↓
                                Queue for sync (if offline)
```

### Multi-Language Text Generation
Different algorithms per language with layout-specific optimizations:
```typescript
const textService = container.resolve<ITextGenerationService>('TextGeneratorService');
const content = await textService.generate({
  language: LanguageCode.LI,
  difficulty: DifficultyLevel.MEDIUM,
  layoutId: 'sil-standard'
});
```

This architecture enables **offline-first operation**, **multilingual support**, and **clean testability** while maintaining strict separation of concerns.
````
