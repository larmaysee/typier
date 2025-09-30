## 🎯 Goal

Break down the massive `data-box.tsx` component (600+ lines) into focused, maintainable components following clean architecture principles. Create new hooks that use the dependency injection system.

## 📋 Critical Refactoring Tasks

### Break Down data-box.tsx

- [ ] **Analyze current `data-box.tsx`** - Identify responsibilities and extract into separate components
- [ ] **Extract typing display logic** → `typing-display/` components (text-display, cursor-indicator, typing-input)
- [ ] **Extract session controls** → `typing-controls/` components (session-controls, mode-selector, difficulty-selector)
- [ ] **Extract live statistics** → `typing-stats/` components (live-stats, progress-bar, timer-display)
- [ ] **Create main container** → `typing-container.tsx` to orchestrate child components

### New Clean Hooks (`src/presentation/hooks/`)

- [ ] `use-typing-session.ts` - Business logic for typing session state using DI container
- [ ] `use-session-controls.ts` - Start/pause/reset session controls
- [ ] `use-typing-input.ts` - Real-time input processing and validation
- [ ] `use-keyboard-layouts.ts` - Available layouts and user preferences
- [ ] `use-layout-switching.ts` - Layout switching with session preservation

### Keyboard Layout Components

- [ ] `keyboard-layout-selector.tsx` - Select layouts per language with previews
- [ ] `layout-preview.tsx` - Visual keyboard layout display
- [ ] `layout-switching-controls.tsx` - Quick layout switching during typing

### Error Boundaries & Loading States

- [ ] `error-boundary.provider.tsx` - Graceful error handling
- [ ] Component loading skeletons and error displays
- [ ] Proper user feedback for layout switching

## 🏗️ Component Architecture Principles

- **Single Responsibility** - Each component has one clear purpose
- **Dependency Injection** - Use `useDependencyInjection()` hook to access services
- **Error Boundaries** - Graceful error handling at appropriate levels
- **Loading States** - Proper loading feedback for async operations

## 📁 Expected Structure

```
src/presentation/
├── components/typing/
│   ├── typing-container.tsx          # Main orchestrator
│   ├── typing-display/
│   │   ├── text-display.tsx         # Text content display
│   │   ├── cursor-indicator.tsx     # Typing cursor
│   │   └── typing-input.tsx         # Input handling
│   ├── typing-controls/
│   │   ├── session-controls.tsx     # Start/pause/reset
│   │   ├── mode-selector.tsx        # Practice/Normal/Competition
│   │   └── difficulty-selector.tsx  # Easy/Medium/Hard
│   ├── typing-stats/
│   │   ├── live-stats.tsx          # Real-time WPM/accuracy
│   │   ├── progress-bar.tsx        # Typing progress
│   │   └── timer-display.tsx       # Session timer
│   └── keyboard-layouts/
│       ├── keyboard-layout-selector.tsx
│       ├── layout-preview.tsx
│       └── layout-switching-controls.tsx
├── hooks/typing/
│   ├── use-typing-session.ts
│   ├── use-session-controls.ts
│   └── use-typing-input.ts
└── hooks/keyboard-layouts/
    ├── use-keyboard-layouts.ts
    └── use-layout-switching.ts
```

## 🔧 Hook Implementation Requirements

```typescript
// Example clean hook structure
function useTypingSession() {
  const { container } = useDependencyInjection();
  const startSessionUseCase = container.resolve<StartTypingSessionUseCase>(
    "StartTypingSessionUseCase"
  );

  // Clean separation of concerns
  // Business logic through use cases
  // UI state management separate from business state
}
```

## ✅ Acceptance Criteria

- [ ] `data-box.tsx` broken down into components under 100 lines each
- [ ] All hooks use dependency injection container for business logic
- [ ] Keyboard layout switching works without losing typing context
- [ ] Error boundaries handle failures gracefully
- [ ] Loading states provide good user feedback
- [ ] Components are fully typed with TypeScript
- [ ] No business logic in UI components (delegated to hooks)
- [ ] Performance optimized with proper memoization

## 🔗 Dependencies

**Requires**: Phase 1-3 completion (domain, infrastructure, application layers)

## 📚 Reference

Current `src/components/data-box.tsx` needs analysis and systematic breakdown following clean architecture principles.
