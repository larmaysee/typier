/**
 * React Hook for Keyboard Layout Management
 * Provides keyboard layout functionality within React components following clean architecture
 */

import { LayoutsResponseDTO } from "@/application/dto/keyboard-layouts.dto";
import { GetAvailableLayoutsUseCase } from "@/application/use-cases/keyboard-layouts/get-available-layouts";
import { SwitchKeyboardLayoutUseCase } from "@/application/use-cases/keyboard-layouts/switch-keyboard-layout";
import { LanguageCode } from "@/domain";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { DomainError } from "@/shared/errors/domain-errors";
import { useCallback, useEffect, useState } from "react";

// Type alias for layout summary from DTO
type LayoutSummary = LayoutsResponseDTO["layouts"][number];

export interface UseKeyboardLayoutsOptions {
  language: LanguageCode;
  userId?: string;
  autoLoad?: boolean;
}

export interface UseKeyboardLayoutsResult {
  // State
  availableLayouts: LayoutSummary[];
  activeLayout: LayoutSummary | null;
  isLoading: boolean;
  error: string | null;
  isChanging: boolean;

  // Actions
  loadLayouts: () => Promise<void>;
  switchLayout: (layoutId: string) => Promise<void>;
  refreshLayouts: () => Promise<void>;
  clearError: () => void;

  // Computed
  hasLayouts: boolean;
  defaultLayoutId: string | null;
  preferredLayoutId: string | null;
}

/**
 * Hook for managing keyboard layouts within React components
 *
 * @example
 * ```tsx
 * function KeyboardSelector() {
 *   const { availableLayouts, activeLayout, switchLayout, isLoading } = useKeyboardLayouts({
 *     language: LanguageCode.EN,
 *     userId: 'user123'
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <select onChange={(e) => switchLayout(e.target.value)}>
 *       {availableLayouts.map(layout => (
 *         <option key={layout.id} value={layout.id}>
 *           {layout.displayName}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useKeyboardLayouts({
  language,
  userId = "anonymous",
  autoLoad = true,
}: UseKeyboardLayoutsOptions): UseKeyboardLayoutsResult {
  const { resolve, serviceTokens } = useDependencyInjection();

  // State
  const [availableLayouts, setAvailableLayouts] = useState<LayoutSummary[]>([]);
  const [activeLayout, setActiveLayout] = useState<LayoutSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [defaultLayoutId, setDefaultLayoutId] = useState<string | null>(null);
  const [preferredLayoutId, setPreferredLayoutId] = useState<string | null>(
    null
  );

  // Load layouts use case
  const loadLayouts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const getLayoutsUseCase = resolve<GetAvailableLayoutsUseCase>(
        serviceTokens.GET_AVAILABLE_LAYOUTS_USE_CASE
      );

      const response = await getLayoutsUseCase.execute({
        language,
        userId,
      });

      setAvailableLayouts(response.layouts);
      setDefaultLayoutId(response.defaultLayoutId);
      setPreferredLayoutId(response.preferredLayoutId);

      // Set active layout priority: preferred > default > first available
      const activeLayout =
        response.layouts.find(
          (l: LayoutSummary) => l.id === response.preferredLayoutId
        ) ||
        response.layouts.find(
          (l: LayoutSummary) => l.id === response.defaultLayoutId
        ) ||
        response.layouts[0] ||
        null;

      setActiveLayout(activeLayout);
    } catch (err) {
      const errorMessage =
        err instanceof DomainError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to load keyboard layouts";

      setError(errorMessage);
      console.error("Failed to load keyboard layouts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [language, userId, resolve, serviceTokens.GET_AVAILABLE_LAYOUTS_USE_CASE]);

  // Switch layout use case
  const switchLayout = useCallback(
    async (layoutId: string) => {
      if (isChanging || layoutId === activeLayout?.id) {
        return;
      }

      try {
        setIsChanging(true);
        setError(null);

        const switchLayoutUseCase = resolve<SwitchKeyboardLayoutUseCase>(
          serviceTokens.SWITCH_KEYBOARD_LAYOUT_USE_CASE
        );

        await switchLayoutUseCase.execute({
          layoutId,
          userId,
          previousLayoutId: activeLayout?.id,
        });

        // Update active layout
        const newActiveLayout = availableLayouts.find(
          (l: LayoutSummary) => l.id === layoutId
        );
        if (newActiveLayout) {
          setActiveLayout(newActiveLayout);
          setPreferredLayoutId(layoutId); // Update preferred layout
        }
      } catch (err) {
        const errorMessage =
          err instanceof DomainError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to switch keyboard layout";

        setError(errorMessage);
        console.error("Failed to switch keyboard layout:", err);
      } finally {
        setIsChanging(false);
      }
    },
    [
      activeLayout?.id,
      isChanging,
      availableLayouts,
      userId,
      resolve,
      serviceTokens.SWITCH_KEYBOARD_LAYOUT_USE_CASE,
    ]
  );

  // Refresh layouts (reload with cache bust)
  const refreshLayouts = useCallback(async () => {
    await loadLayouts();
  }, [loadLayouts]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load layouts when language changes
  useEffect(() => {
    if (autoLoad) {
      loadLayouts();
    }
  }, [language, autoLoad, loadLayouts]);

  // Computed values
  const hasLayouts = availableLayouts.length > 0;

  return {
    // State
    availableLayouts,
    activeLayout,
    isLoading,
    error,
    isChanging,

    // Actions
    loadLayouts,
    switchLayout,
    refreshLayouts,
    clearError,

    // Computed
    hasLayouts,
    defaultLayoutId,
    preferredLayoutId,
  };
}

/**
 * Hook for managing single layout state (useful for components that only need current layout)
 *
 * @example
 * ```tsx
 * function TypingArea() {
 *   const { layout, isLoading } = useActiveLayout(LanguageCode.EN);
 *
 *   if (isLoading || !layout) return <Spinner />;
 *
 *   return <VirtualKeyboard layout={layout} />;
 * }
 * ```
 */
export function useActiveLayout(language: LanguageCode, userId?: string) {
  const { activeLayout, isLoading, error, loadLayouts } = useKeyboardLayouts({
    language,
    userId,
    autoLoad: true,
  });

  return {
    layout: activeLayout,
    isLoading,
    error,
    reload: loadLayouts,
  };
}

/**
 * Hook for layout switching with optimistic updates
 *
 * @example
 * ```tsx
 * function QuickLayoutSwitcher() {
 *   const { currentLayoutId, switchToLayout, isChanging } = useLayoutSwitcher(LanguageCode.EN);
 *
 *   return (
 *     <button
 *       onClick={() => switchToLayout('qwerty-us')}
 *       disabled={isChanging}
 *     >
 *       Switch to QWERTY
 *     </button>
 *   );
 * }
 * ```
 */
export function useLayoutSwitcher(language: LanguageCode, userId?: string) {
  const { activeLayout, switchLayout, isChanging, error } = useKeyboardLayouts({
    language,
    userId,
    autoLoad: true,
  });

  const switchToLayout = useCallback(
    async (layoutId: string) => {
      await switchLayout(layoutId);
    },
    [switchLayout]
  );

  return {
    currentLayoutId: activeLayout?.id || null,
    currentLayout: activeLayout,
    switchToLayout,
    isChanging,
    error,
  };
}
