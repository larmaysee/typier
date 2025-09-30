## 🎯 Goal

Break down massive `data-box.tsx` (600+ lines) into focused components using clean architecture with dependency injection.

## 📋 Tasks

### Component Breakdown

- [ ] Analyze `src/components/data-box.tsx` and extract into focused components
- [ ] Create `typing-container.tsx` as main orchestrator
- [ ] Extract `typing-display/` components (text-display, cursor, input)
- [ ] Extract `typing-controls/` components (session controls, selectors)
- [ ] Extract `typing-stats/` components (live stats, progress, timer)

### Clean Hooks with DI

- [ ] `use-typing-session.ts` - Session state via DI container
- [ ] `use-keyboard-layouts.ts` - Layout management
- [ ] `use-layout-switching.ts` - Seamless layout changes
- [ ] `use-session-controls.ts` - Start/pause/reset logic

### Keyboard Layout UI

- [ ] `keyboard-layout-selector.tsx` - Layout selection with previews
- [ ] `layout-switching-controls.tsx` - Quick switching during typing
- [ ] Error boundaries and loading states

## ✅ Acceptance Criteria

- [ ] Components under 100 lines each with single responsibility
- [ ] Hooks use DI container for business logic separation
- [ ] Layout switching preserves typing context
- [ ] Graceful error handling and loading states

**Requires**: Phases 1-3 completion
