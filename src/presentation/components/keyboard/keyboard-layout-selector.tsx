"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { KeyboardIcon } from "lucide-react";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { GetAvailableLayoutsUseCase } from "@/application/use-cases/keyboard-layouts/get-available-layouts";
import { SwitchKeyboardLayoutUseCase } from "@/application/use-cases/keyboard-layouts/switch-keyboard-layout";
import { LanguageCode } from "@/domain";
import { cn } from "@/lib/utils";

interface KeyboardLayoutSelectorProps {
  language: LanguageCode;
  currentLayoutId?: string;
  sessionId?: string;
  userId?: string;
  onLayoutChange?: (layoutId: string) => void;
  className?: string;
}

interface LayoutOption {
  id: string;
  name: string;
  displayName: string;
  variant: string;
  isRecommended: boolean;
  isCustom: boolean;
}

export function KeyboardLayoutSelector({
  language,
  currentLayoutId,
  sessionId,
  userId,
  onLayoutChange,
  className
}: KeyboardLayoutSelectorProps) {
  const { resolve, serviceTokens } = useDependencyInjection();
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | undefined>(currentLayoutId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available layouts when language changes
  const loadLayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const getLayoutsUseCase = resolve<GetAvailableLayoutsUseCase>(
        serviceTokens.GET_AVAILABLE_LAYOUTS_USE_CASE
      );

      const response = await getLayoutsUseCase.execute({
        language,
        userId,
        includeCustom: true
      });

      setLayouts(response.layouts);

      // Set the preferred or first layout as default if no current layout
      if (!selectedLayoutId && response.layouts.length > 0) {
        const defaultLayout = response.preferredLayoutId
          ? response.layouts.find(l => l.id === response.preferredLayoutId)
          : response.layouts[0];

        if (defaultLayout) {
          setSelectedLayoutId(defaultLayout.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layouts');
      console.error('Failed to load keyboard layouts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, userId, resolve, serviceTokens, selectedLayoutId]);

  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  const handleLayoutSwitch = async (layoutId: string) => {
    try {
      const switchLayoutUseCase = resolve<SwitchKeyboardLayoutUseCase>(
        serviceTokens.SWITCH_KEYBOARD_LAYOUT_USE_CASE
      );

      await switchLayoutUseCase.execute({
        sessionId,
        layoutId,
        userId,
        previousLayoutId: selectedLayoutId
      });

      setSelectedLayoutId(layoutId);
      onLayoutChange?.(layoutId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch layout');
      console.error('Failed to switch keyboard layout:', err);
    }
  };

  const currentLayout = layouts.find(l => l.id === selectedLayoutId);

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        {error}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          title="Choose Keyboard Layout"
          disabled={isLoading || layouts.length === 0}
          className={className}
        >
          <KeyboardIcon size={20} className="mr-2" />
          <span className="text-xs">
            {isLoading ? 'Loading...' : currentLayout?.displayName || 'Select Layout'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-muted-foreground text-sm font-normal">
          Keyboard Layouts
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {layouts.map((layout) => (
            <DropdownMenuItem
              key={layout.id}
              onClick={() => handleLayoutSwitch(layout.id)}
              className={cn(
                "cursor-pointer",
                layout.id === selectedLayoutId && "bg-accent"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <KeyboardIcon size={16} />
                  <div className="flex flex-col">
                    <span className="font-medium">{layout.displayName}</span>
                    {layout.variant && (
                      <span className="text-xs text-muted-foreground">
                        {layout.variant}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {layout.isRecommended && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                  {layout.isCustom && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {layouts.length === 0 && !isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No layouts available for this language
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
