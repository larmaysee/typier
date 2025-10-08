# Fix: Typing Input Crash - Infinite Function Calls

## Problem Statement

When typing in the input field, the application crashed due to infinite function calls. The issue was caused by excessive re-renders and dependency cycles in React hooks, specifically in the `useTypingSession` hook.

## Root Cause Analysis

### 1. **useEffect Dependency Cycle**

The main issue was in `/src/presentation/hooks/typing/use-typing-session.ts`:

```typescript
// BEFORE - Problematic code
useEffect(() => {
  startNewSession();
}, [config.language.code, config.difficultyMode, config.practiceMode]);
```

**Problem**: The `useEffect` was triggering `startNewSession()` every time any config property changed, which could potentially cause state updates that trigger the config to update again, creating an infinite loop.

### 2. **Unstable Callback Dependencies**

The `processInput` and `completeSession` callbacks had dependencies on state values that changed frequently:

```typescript
// BEFORE - Problematic code
const processInput = useCallback(
  async (input: string) => {
    if (!state.sessionId) return;
    // ... processing logic
  },
  [state.sessionId, processInputUseCase, inputRef]
);

const completeSession = useCallback(async () => {
  if (!state.sessionId) return;
  // ... completion logic
}, [
  state.sessionId,
  state.typedText,
  completeSessionUseCase,
  addTestResult,
  config.language.code,
]);
```

**Problem**: These callbacks were being recreated on every state change because they depended on frequently changing state values (`state.sessionId`, `state.typedText`, etc.). This caused components using these callbacks to re-render unnecessarily, potentially triggering more state updates.

## Solution Implementation

### 1. **Fixed useEffect with Config Tracking**

Added a ref to track config changes and only start a new session when config actually changes:

```typescript
// AFTER - Fixed code
const configRef = useRef({
  language: config.language.code,
  difficultyMode: config.difficultyMode,
  practiceMode: config.practiceMode,
});

useEffect(() => {
  const hasConfigChanged =
    configRef.current.language !== config.language.code ||
    configRef.current.difficultyMode !== config.difficultyMode ||
    configRef.current.practiceMode !== config.practiceMode;

  if (hasConfigChanged) {
    configRef.current = {
      language: config.language.code,
      difficultyMode: config.difficultyMode,
      practiceMode: config.practiceMode,
    };
    startNewSession();
  }
}, [config.language.code, config.difficultyMode, config.practiceMode]);
```

**Benefits**:

- Only triggers new session when config truly changes
- Prevents unnecessary session restarts
- Breaks the potential infinite loop

### 2. **Stabilized Callbacks with Refs**

Replaced state dependencies with refs to keep the latest values without causing re-renders:

```typescript
// AFTER - Fixed code
const sessionIdRef = useRef<string | null>(null);
const typedTextRef = useRef<string>("");
const languageRef = useRef<string>(config.language.code);

useEffect(() => {
  sessionIdRef.current = state.sessionId;
}, [state.sessionId]);

useEffect(() => {
  typedTextRef.current = state.typedText;
}, [state.typedText]);

useEffect(() => {
  languageRef.current = config.language.code;
}, [config.language.code]);

const processInput = useCallback(async (input: string) => {
  const currentSessionId = sessionIdRef.current;
  if (!currentSessionId) return;
  // ... use refs instead of state
}, []); // Empty dependency array - stable callback

const completeSession = useCallback(async () => {
  const currentSessionId = sessionIdRef.current;
  if (!currentSessionId) return;
  // ... use refs instead of state
}, []); // Empty dependency array - stable callback
```

**Benefits**:

- Callbacks are created once and remain stable
- No re-renders triggered by callback changes
- Still have access to latest values via refs
- Use cases from DI container are stable, don't need to be in deps

## Architecture Insights

### Why This Approach Works with Clean Architecture

1. **Repository Pattern**: The `MockSessionRepository` stores sessions in memory (Map), not in Appwrite, so no network calls are made during typing.

2. **Use Case Pattern**: Use cases (`ProcessTypingInputUseCase`, `StartTypingSessionUseCase`) are resolved from the DI container and are stable references.

3. **Dependency Injection**: Services resolved from the container don't change, making them safe to use in callbacks without including them in dependency arrays.

4. **State Management**: By separating "current state for rendering" (React state) from "latest values for callbacks" (refs), we avoid dependency cycles.

## Testing the Fix

### Before Testing:

1. Open browser DevTools Console
2. Open Network tab
3. Filter for Appwrite API calls (if applicable)

### Test Procedure:

1. Start the development server: `npm run dev`
2. Navigate to the typing test
3. Start typing in the input field
4. Observe:
   - ✅ Smooth typing without lag or freezing
   - ✅ No excessive console logs
   - ✅ No infinite loops in the console
   - ✅ No repeated network calls (since using MockRepository)
   - ✅ Input handles correctly without crashes

### Success Criteria:

- [x] No browser freezing or crashing
- [x] Typing is smooth and responsive
- [x] No console errors or warnings
- [x] State updates correctly on each keystroke
- [x] Session completes successfully
- [x] Results modal shows correct statistics

## Related Files Modified

- `/src/presentation/hooks/typing/use-typing-session.ts` - Main fix location
  - Added config tracking with refs
  - Stabilized `processInput` callback
  - Stabilized `completeSession` callback
  - Added refs for session state values

## Prevention Best Practices

### 1. **Use Refs for Latest Values**

When you need the latest value in a callback but don't want the callback to change:

```typescript
const valueRef = useRef(initialValue);
useEffect(() => {
  valueRef.current = value;
}, [value]);

const stableCallback = useCallback(() => {
  const latestValue = valueRef.current;
  // use latestValue
}, []); // Empty deps - callback is stable
```

### 2. **Track Changes Before Acting**

Before triggering side effects, verify that values actually changed:

```typescript
const previousConfigRef = useRef(config);
useEffect(() => {
  if (previousConfigRef.current !== config) {
    previousConfigRef.current = config;
    // Do side effect
  }
}, [config]);
```

### 3. **DI Container Services are Stable**

Services from the DI container don't need to be in dependency arrays:

```typescript
const useCase = resolve<SomeUseCase>("SomeUseCase");

const callback = useCallback(() => {
  useCase.execute(command);
}, []); // useCase is stable, don't include it
```

### 4. **Be Careful with State-Dependent Effects**

Avoid effects that depend on state they might update:

```typescript
// BAD - Potential infinite loop
useEffect(() => {
  if (condition) {
    setState(newValue); // Changes state
  }
}, [state]); // Depends on state it changes

// GOOD - Use refs or functional updates
useEffect(() => {
  if (condition) {
    setState((prev) => computeNewValue(prev));
  }
}, [condition]); // Only depends on external condition
```

### 5. **Monitor Performance During Development**

- Keep DevTools Performance tab open
- Watch for excessive renders in React DevTools Profiler
- Set up ESLint rules for hook dependencies
- Use `why-did-you-render` library in development

## Impact

### ✅ Fixed Issues:

- No more infinite function calls during typing
- Smooth typing experience without freezing
- Proper state management with stable callbacks
- Better performance and reduced memory usage
- Clean separation between rendering state and callback values

### ✅ Maintained Functionality:

- Session initialization works correctly
- Input processing through use cases
- Session completion and statistics
- Results modal displays properly
- All clean architecture patterns preserved

### ✅ Architecture Benefits:

- Demonstrates proper use of refs in clean architecture
- Shows how DI container provides stable references
- Proper separation of concerns maintained
- Repository pattern prevents unwanted side effects

## Additional Notes

1. **MockSessionRepository**: Currently using in-memory storage, so no Appwrite calls are made. When switching to real Appwrite repository, ensure it also uses proper caching/batching to avoid excessive API calls.

2. **data-box.tsx**: The old `data-box.tsx` component is not being used in the current implementation. The new clean architecture components (`TypingWithKeyboard`, `TypingContainer`) are being used instead.

3. **Previous Fixes**: This fix builds on previous infinite loop fixes documented in `/docs/fix-infinite-appwrite-calls.md` for `site-config.tsx`, `typing-statistics.tsx`, and the original `use-typing-session.ts`.

## Conclusion

The infinite function call issue during typing was resolved by:

1. Adding proper change tracking for config updates
2. Using refs to access latest values without dependency changes
3. Creating stable callbacks with empty dependency arrays
4. Leveraging the DI container's stable service references

This maintains the clean architecture principles while ensuring optimal React performance and preventing infinite loops.
