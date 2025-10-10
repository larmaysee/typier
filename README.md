# Typoria - Multilingual Typing Test Application

**Typoria** is a sophisticated multilingual typing test application that supports English, Lisu, and Myanmar languages with multiple keyboard layouts per language. Built with **Next.js 15**, **TypeScript**, and **Clean Architecture** principles, it provides an engaging typing experience with three distinct modes and comprehensive performance analytics.

## 🌟 Key Features

### 🌍 Multilingual Support

- **English**: QWERTY US/UK/International, Dvorak, Colemak layouts
- **Lisu**: SIL Basic, SIL Standard, Unicode Standard, Traditional layouts
- **Myanmar**: Myanmar3, Zawgyi, Unicode Standard, WinInnwa layouts

### 🎯 Three Typing Modes

- **Practice Mode**: No recording, enhanced visual feedback, mistake analysis
- **Normal Mode**: Performance tracking, leaderboards, auto-difficulty adjustment
- **Competition Mode**: Daily/weekly challenges, standardized layouts, fair rankings

### 🚀 Advanced Features

- **Clean Architecture**: Domain-driven design with dependency injection
- **Hybrid Data Persistence**: Appwrite + LocalStorage with offline support
- **Real-time Analytics**: Live WPM, accuracy, consistency tracking
- **Custom Layouts**: Create and validate custom keyboard layouts
- **Performance Insights**: Detailed statistics and improvement recommendations

## 🏗️ Architecture Overview

Typoria implements **Clean Architecture** with clear separation of concerns:

```
src/
├── domain/              # Core business logic (entities, enums, interfaces)
├── application/         # Use cases, DTOs, commands, queries
├── infrastructure/      # Repositories, services, persistence, DI container
├── presentation/        # React components, hooks, providers
├── shared/             # Utilities, constants, types, errors
└── config/             # Application configuration
```

### Core Principles

- **Domain-Driven Design**: Business logic isolated from external dependencies
- **Dependency Injection**: Services resolved through DI container
- **Repository Pattern**: Abstract data access with multiple implementations
- **CQRS**: Separate read/write operations with commands and queries
- **Hexagonal Architecture**: Ports and adapters for external integrations

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/larmaysee/typoria.git
   cd typoria
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup** (Optional - for Appwrite integration)

   ```bash
   cp .env.example .env.local
   ```

   Configure Appwrite settings:

   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=typoria-db
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3002](http://localhost:3002) in your browser.

## 🛠️ Development Guide

### Project Structure

#### **Domain Layer** (`src/domain/`)

Contains pure business logic with no external dependencies:

```typescript
// Domain entities
interface TypingSession {
  id: string;
  test: TypingTest;
  currentInput: string;
  startTime: number | null;
  timeLeft: number;
  status: SessionStatus;
  activeLayout: KeyboardLayout;
  liveStats: LiveTypingStats;
  mistakes: TypingMistake[];
}

// Domain enums
enum TypingMode {
  PRACTICE = "practice",
  NORMAL = "normal",
  COMPETITION = "competition",
}
```

#### **Application Layer** (`src/application/`)

Orchestrates business logic through use cases:

```typescript
// Use case example
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
    // Business logic implementation
  }
}
```

#### **Infrastructure Layer** (`src/infrastructure/`)

Implements external dependencies and data persistence:

```typescript
// Repository implementations
export class HybridTypingRepository implements ITypingRepository {
  constructor(
    private appwriteRepo: AppwriteTypingRepository,
    private localRepo: LocalTypingRepository,
    private logger: ILogger,
    private storage: LocalStorageClient
  ) {}

  async save(test: TypingTest): Promise<void> {
    // Always save locally first
    await this.localRepo.save(test);

    try {
      // Try to sync to Appwrite
      await this.appwriteRepo.save(test);
    } catch (error) {
      // Queue for later sync if offline
      await this.storage.queueForSync(test);
    }
  }
}
```

#### **Presentation Layer** (`src/presentation/`)

Clean React components with business logic in hooks:

```typescript
// Component with clean separation
export function TypingContainer() {
  const { session, error, isLoading } = useTypingSession();
  const { startSession, processInput } = useSessionControls();

  if (error) return <ErrorDisplay error={error} />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="typing-container">
      <TypingDisplay session={session} onInput={processInput} />
      <LiveStatistics session={session} />
    </div>
  );
}

// Business logic in hooks
function useTypingSession() {
  const { container } = useDependencyInjection();
  const [session, setSession] = useState<TypingSessionState | null>(null);

  const startSessionUseCase = container.resolve<StartTypingSessionUseCase>(
    "StartTypingSessionUseCase"
  );

  // Hook implementation
}
```

### Dependency Injection System

The application uses a sophisticated DI container for service resolution:

```typescript
// Service registration
container.registerSingleton(SERVICE_TOKENS.TYPING_REPOSITORY, () => {
  if (isAppwriteConfigured()) {
    return new HybridTypingRepository(
      container.resolve("AppwriteTypingRepository"),
      container.resolve("LocalTypingRepository"),
      container.resolve("Logger"),
      container.resolve("LocalStorageClient")
    );
  }
  return container.resolve("LocalTypingRepository");
});

// Service resolution in components
const { container } = useDependencyInjection();
const typingRepository =
  container.resolve<ITypingRepository>("TypingRepository");
```

### Key Development Patterns

#### **1. Use Cases for Business Logic**

```typescript
// Always use use cases for complex operations
const completeSessionUseCase = container.resolve<CompleteTypingSessionUseCase>(
  "CompleteTypingSessionUseCase"
);

await completeSessionUseCase.execute({
  sessionId: session.id,
  finalInput: typedText,
  timestamp: Date.now(),
});
```

#### **2. Repository Pattern for Data Access**

```typescript
// Never access data directly - always through repositories
const userRepository = container.resolve<IUserRepository>("UserRepository");
const user = await userRepository.findById(userId);
```

#### **3. Clean Component Design**

```typescript
// Components focus on UI, delegate business logic to hooks
function TypingDisplay({ session, onInput }: TypingDisplayProps) {
  const { textContent } = useTextGeneration(session.test.language);
  const { handleKeyPress } = useTypingInput(onInput);

  return (
    <div className="typing-display">
      <TextRenderer content={textContent} />
      <TypingInput onKeyPress={handleKeyPress} />
    </div>
  );
}
```

#### **4. Multi-Layout Keyboard Support**

```typescript
// Layout switching via use cases
const switchLayoutUseCase = container.resolve<SwitchKeyboardLayoutUseCase>(
  "SwitchKeyboardLayoutUseCase"
);

await switchLayoutUseCase.execute({
  sessionId: session.id,
  layoutId: "qwerty-dvorak",
  userId: user.id,
});
```

### Development Commands

| Command         | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start development server with Turbopack (port 3002) |
| `npm run build` | Build static export to `build/` directory           |
| `npm run start` | Start production server                             |
| `npm run lint`  | Run ESLint code analysis                            |

### Environment Configuration

#### **Local Development (Offline)**

Works out of the box with localStorage persistence.

#### **Appwrite Integration (Online)**

Configure these environment variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=typoria-db

# Collection IDs (optional - defaults provided)
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_TYPING_TESTS=typing_tests
NEXT_PUBLIC_APPWRITE_COLLECTION_LEADERBOARDS=leaderboards
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_SETTINGS=user_settings
```

### Testing & Debugging

#### **DI System Diagnostics**

Visit `/di-test` to inspect the dependency injection system:

- View registered/unregistered services
- Check service health status
- Monitor environment configuration
- Test service resolution

#### **Architecture Validation**

```typescript
// Example: Testing repository pattern
const testRepository = container.resolve<ITypingRepository>("TypingRepository");
console.log("Repository type:", testRepository.constructor.name);
// Output: HybridTypingRepository (online) or LocalTypingRepository (offline)
```

## 🎨 Styling & Theming

- **Framework**: Tailwind CSS with custom design system
- **Components**: shadcn/ui component library
- **Theming**: `next-themes` with light/dark/system modes
- **Icons**: Lucide React icon library
- **Fonts**: Geist Sans & Mono (locally hosted)

## 📁 Key Files & Directories

| Path                               | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `src/domain/entities/`             | Core business entities (Typing, User, KeyboardLayout) |
| `src/application/use-cases/`       | Business logic orchestration                          |
| `src/infrastructure/di/`           | Dependency injection configuration                    |
| `src/infrastructure/repositories/` | Data access implementations                           |
| `src/presentation/components/`     | UI components                                         |
| `src/presentation/hooks/`          | Business logic hooks                                  |
| `src/config/`                      | Application configuration                             |

## 🚀 Deployment

The application builds to static files for easy deployment:

```bash
npm run build
```

Deploy the `build/` directory to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- Any static web server

## 🤝 Contributing

1. **Follow Clean Architecture**: Keep business logic in domain/application layers
2. **Use Dependency Injection**: Resolve services through the DI container
3. **Repository Pattern**: Abstract data access behind interfaces
4. **Clean Components**: Delegate business logic to hooks and use cases
5. **Type Safety**: Use strong TypeScript types throughout

### Adding New Features

1. **Define Domain Entities** (`src/domain/entities/`)
2. **Create Repository Interfaces** (`src/domain/interfaces/`)
3. **Implement Use Cases** (`src/application/use-cases/`)
4. **Create Repository Implementations** (`src/infrastructure/repositories/`)
5. **Register Services** in DI container (`src/infrastructure/di/bindings.ts`)
6. **Build UI Components** (`src/presentation/components/`)
7. **Create Business Logic Hooks** (`src/presentation/hooks/`)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Appwrite** - For the backend-as-a-service platform
- **shadcn/ui** - For the beautiful component library
- **Tailwind CSS** - For the utility-first CSS framework
