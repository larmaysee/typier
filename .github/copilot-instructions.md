# Typoria - AI Coding Assistant Instructions

## Project Overview
Typoria is a multilingual typing test application built with **Next.js 15** and **TypeScript**, featuring support for English, Lisu, and Myanmar languages. The app uses **static export** (`output: "export"`) with a custom build directory (`build/`) and runs on port **3005** by default.

## Architecture & Key Patterns

### 1. Component Organization
- **Provider Pattern**: All stateful logic uses React Context providers (`AuthProvider`, `TypingStatisticsProvider`, `SiteConfigProvider`)
- **Compound Components**: UI components follow shadcn/ui patterns with consistent prop interfaces
- **Client-Side Only**: Most components use `"use client"` directive due to browser-specific features (localStorage, typing detection)

### 2. Multi-Language Support
- **Language Enum**: Use `LanguageCode` enum from `@/enums/site-config` (EN, MY, LI)
- **Data Structure**: Language data is organized in `src/datas/` with separate files per language
  - `english-data.ts`, `lisu-data.ts`, `myanmar-data.ts`
  - Each contains `syntaxs` (full sentences) and `chars` (individual characters) arrays
- **Layout Mapping**: Keyboard layouts in `src/layouts/` define language-specific keyboard mappings

### 3. State Management
- **Local Storage**: Statistics and user data persist via localStorage with namespace `typoria_typing_statistics`
- **Context Providers**: Chain providers in this order: `AuthProvider` → `TypingStatisticsProvider` → content
- **Anonymous Users**: Default user ID is `anonymous_user` when not authenticated

### 4. Data Models
Key interface is `TypingTestResult`:
```typescript
{
  id: string; userId: string; wpm: number; accuracy: number;
  correctWords: number; incorrectWords: number; totalWords: number;
  testDuration: number; language: string; timestamp: number;
  charactersTyped: number; errors: number;
}
```

## Development Workflow

### Build & Development
- **Dev Server**: `npm run dev` (Turbopack enabled, port 3005)
- **Static Export**: `npm run build` creates static files in `build/` directory
- **Path Aliases**: Use `@/` for `src/` imports (configured in `tsconfig.json`)

### Styling & UI
- **Framework**: Tailwind CSS with custom CSS variables for theming
- **Component Library**: shadcn/ui components in `src/components/ui/`
- **Theme System**: `next-themes` with light/dark/system modes
- **Icons**: Lucide React (`lucide-react` package)

### External Dependencies
- **Authentication**: Appwrite SDK (optional, gracefully degrades if env vars missing)
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Fonts**: Geist Sans & Mono (local fonts in `src/app/fonts/`)
- **Appwrite Integration**: Use Appwrite MCP server tools for database operations, authentication, and API interactions

## Project-Specific Conventions

### Component Patterns
1. **Provider Components**: Always include TypeScript interfaces for context values
2. **Hook Pattern**: Each provider exports a corresponding `use*` hook (e.g., `useAuth`, `useTypingStatistics`)
3. **Error Boundaries**: Providers throw descriptive errors when used outside context

### File Naming
- **Components**: kebab-case (e.g., `typing-statistics.tsx`, `site-config.tsx`)
- **Data Files**: language-prefixed (e.g., `lisu-data.ts`, `english-data.ts`)
- **Layouts**: language-specific keyboard layouts (e.g., `lisu.ts`, `myanmar.ts`)

### Environment Configuration
- **Appwrite**: Optional integration via `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- **Graceful Degradation**: App functions without backend (localStorage fallback)
- **Appwrite Development**: When working with Appwrite features (authentication, database operations, user management), use the Appwrite MCP server tools for accurate API documentation and code examples

## Critical Integration Points

### View State Management
Main app uses view switching pattern:
```typescript
const [currentView, setCurrentView] = useState<'typing' | 'statistics' | 'leaderboard' | 'settings'>('typing');
```

### Statistics Calculation
Complex statistics logic in `TypingStatisticsProvider`:
- Per-user data filtering
- Improvement trend calculation (last 10 vs previous 10 tests)
- Real-time statistics updates after each test

### Language-Specific Features
- **Difficulty Modes**: `chars` (individual characters) vs `syntaxs` (full sentences)
- **Keyboard Layouts**: Each language has corresponding visual keyboard layout
- **Unicode Support**: Special handling for Lisu and Myanmar scripts

When working with this codebase, prioritize understanding the provider chain and language data structure, as these are central to most features.
