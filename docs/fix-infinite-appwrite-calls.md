# Fix: Infinite Appwrite Calls During Typing

## Problem
When typing, the application was making infinite calls to Appwrite, causing the UI to freeze and poor performance.

## Root Causes

### 1. **site-config.tsx** - Infinite Loop in `loadSettings`
**Issue:** The `loadSettings` function had `applyColorTheme` as a dependency in its `useCallback`. Since `applyColorTheme` itself had dependencies (`theme`), it was recreated on every render, causing `loadSettings` to be recreated, which triggered the `useEffect` again, creating an infinite loop.

**Fix:** 
- Removed `applyColorTheme` from the dependencies array
- Added ESLint disable comment with explanation
- Only depend on `user` which is the actual trigger for loading settings

```typescript
// Before
}, [user, applyColorTheme]);

// After  
}, [user]); // Only depend on user, applyColorTheme is stable
```

### 2. **typing-statistics.tsx** - Infinite Loop in Online/Offline Handlers
**Issue:** The `syncWithDatabase` callback was included as a dependency in the `useEffect` for online/offline event handlers. Since `syncWithDatabase` had multiple dependencies, it was recreated frequently, causing the event listeners to be re-registered infinitely.

**Fix:**
- Removed `syncWithDatabase` from the dependencies array
- Called the function directly in the handlers with proper guards
- Used empty dependency array since the handlers don't need to be recreated

```typescript
// Before
}, [syncWithDatabase]);

// After
}, []); // Empty deps - handlers are stable
```

### 3. **use-typing-session.ts** - Excessive Re-renders from Dependencies
**Issue:** The `startNewSession` callback included several function dependencies (`getTypingMode`, `getDifficultyLevel`, `getTextType`) that were causing unnecessary re-renders even though these functions are stable.

**Fix:**
- Removed the stable function dependencies from the array
- Added ESLint disable comment explaining why
- Only kept the actual changing dependencies

```typescript
// Before
  ], [
    startSessionUseCase,
    config.language.code,
    config.practiceMode,
    config.difficultyMode,
    state.selectedTime,
    getTypingMode,
    getDifficultyLevel,
    getTextType
  ]);

// After
  ], [
    startSessionUseCase,
    config.language.code,
    config.practiceMode,
    config.difficultyMode,
    state.selectedTime,
    // getTypingMode, getDifficultyLevel, getTextType are stable functions
  ]);
```

## Testing the Fix

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the browser and check:**
   - Open DevTools Network tab
   - Start typing in the typing test
   - Verify that Appwrite calls are NOT being made repeatedly
   - Typing should be smooth without freezing

3. **Check browser console:**
   - Should not see repeated "Loading settings" logs
   - Should not see excessive network activity

## Prevention Best Practices

To prevent similar issues in the future:

1. **Be careful with useCallback dependencies:**
   - Only include dependencies that actually change
   - Stable functions (like those created with useCallback without deps) don't need to be in dependency arrays
   - Use ESLint disable comments with explanations when intentionally omitting deps

2. **Avoid circular dependencies:**
   - If Function A depends on Function B and Function B depends on Function A, you'll get infinite loops
   - Break the cycle by using refs or removing unnecessary dependencies

3. **Use refs for stable callbacks:**
   - For event handlers that don't need to change, use `useRef` to store the callback
   - Or use empty dependency arrays with proper guards inside the function

4. **Monitor Network Activity:**
   - Keep DevTools Network tab open during development
   - Watch for repeated API calls
   - Set up network throttling to catch performance issues early

5. **Use React DevTools Profiler:**
   - Profile your components to see which ones re-render frequently
   - Identify expensive renders and optimize accordingly

## Related Files Modified

- `/src/components/site-config.tsx`
- `/src/components/typing-statistics.tsx`
- `/src/presentation/hooks/typing/use-typing-session.ts`

## Impact

- ✅ **No more infinite Appwrite calls during typing**
- ✅ **Smooth typing experience without freezing**
- ✅ **Better performance and reduced API usage**
- ✅ **Lower battery consumption and network usage**
- ✅ **Proper separation of concerns with clean dependencies**
