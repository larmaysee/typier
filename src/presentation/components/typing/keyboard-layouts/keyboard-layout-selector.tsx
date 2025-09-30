"use client";

import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Check, Settings, ChevronDown } from "lucide-react";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { GetAvailableLayoutsUseCase } from "@/application/use-cases/keyboard-layouts/get-available-layouts";
import { SwitchKeyboardLayoutUseCase } from "@/application/use-cases/keyboard-layouts/switch-keyboard-layout";
import { LayoutsResponseDTO } from "@/application/dto/keyboard-layouts.dto";
import { LanguageCode } from "@/domain";
import { useSiteConfig } from "@/components/site-config";
import { cn } from "@/lib/utils";

// Type alias for layout summary from DTO
type LayoutSummary = LayoutsResponseDTO['layouts'][number];

interface KeyboardLayoutSelectorProps {
  compact?: boolean;
  showLayoutInfo?: boolean;
  onLayoutChange?: (layoutId: string) => void;
}

export const KeyboardLayoutSelector = memo(function KeyboardLayoutSelector({
  compact = true,
  showLayoutInfo = false,
  onLayoutChange,
}: KeyboardLayoutSelectorProps) {
  const { resolve, serviceTokens } = useDependencyInjection();
  const { config } = useSiteConfig();
  const [availableLayouts, setAvailableLayouts] = useState<LayoutSummary[]>([]);
  const [activeLayout, setActiveLayout] = useState<LayoutSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  // Load layouts when language changes
  useEffect(() => {
    loadLayouts();
  }, [config.language.code]);

  const loadLayouts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const getLayoutsUseCase = resolve<GetAvailableLayoutsUseCase>(
        serviceTokens.GET_AVAILABLE_LAYOUTS_USE_CASE
      );

      const response = await getLayoutsUseCase.execute({
        language: config.language.code as LanguageCode,
        userId: 'current_user_id', // TODO: Get from auth context
      });

      setAvailableLayouts(response.layouts || []);

      // Set active layout
      const activeLayout = response.layouts.find((l: LayoutSummary) => l.id === response.preferredLayoutId)
        || response.layouts.find((l: LayoutSummary) => l.id === response.defaultLayoutId)
        || response.layouts[0];

      setActiveLayout(activeLayout || null);

    } catch (err) {
      console.error('Failed to load layouts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load layouts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLayoutSwitch = async (layout: LayoutSummary) => {
    if (isChanging || layout.id === activeLayout?.id) return;

    try {
      setIsChanging(true);

      const switchLayoutUseCase = resolve<SwitchKeyboardLayoutUseCase>(
        serviceTokens.SWITCH_KEYBOARD_LAYOUT_USE_CASE
      );

      await switchLayoutUseCase.execute({
        layoutId: layout.id,
        userId: 'current_user_id', // TODO: Get from auth context
        previousLayoutId: activeLayout?.id,
      });

      setActiveLayout(layout);
      onLayoutChange?.(layout.id);

    } catch (err) {
      console.error('Failed to switch layout:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch layout');
    } finally {
      setIsChanging(false);
    }
  };

  // Helper functions for Myanmar-specific display
  const getLayoutTypeBadge = (layoutType: string) => {
    const badgeMap: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', label: string }> = {
      'standard': { variant: 'default', label: 'Standard' },
      'legacy': { variant: 'secondary', label: 'Legacy' },
      'unicode': { variant: 'outline', label: 'Unicode' },
      'qwerty': { variant: 'outline', label: 'QWERTY' },
      'phonetic': { variant: 'outline', label: 'Phonetic' },
    };
    return badgeMap[layoutType?.toLowerCase()] || { variant: 'outline', label: layoutType };
  };

  const getEncodingInfo = (variant: string) => {
    const encodingMap: Record<string, string> = {
      'myanmar3': 'Unicode',
      'zawgyi': 'Zawgyi (Legacy)',
      'unicode_standard': 'Unicode Standard',
      'unicode_myanmar': 'Unicode',
      'wininnwa': 'Unicode',
    };
    return encodingMap[variant] || '';
  };

  const isMyanmarLayout = config.language.code === LanguageCode.MY;

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Keyboard className="h-4 w-4 mr-2" />
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
      </Button>
    );
  }

  if (error || !availableLayouts.length) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={loadLayouts}
        className="text-destructive"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        Error
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isChanging}
          className={cn(
            "relative",
            isChanging && "opacity-50"
          )}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          {compact ? (
            <span className="max-w-20 truncate">
              {activeLayout?.name || "Layout"}
            </span>
          ) : (
            <span>{activeLayout?.displayName || "Select Layout"}</span>
          )}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
          {isChanging && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Keyboard Layouts</span>
          <Badge variant="outline" className="text-xs">
            {config.language.name}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableLayouts.map((layout) => {
          const typeBadge = getLayoutTypeBadge(layout.layoutType);
          const encoding = getEncodingInfo(layout.variant);

          return (
            <DropdownMenuItem
              key={layout.id}
              onClick={() => handleLayoutSwitch(layout)}
              className={cn(
                "flex items-start justify-between p-3 cursor-pointer",
                activeLayout?.id === layout.id && "bg-primary/10"
              )}
              disabled={isChanging}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{layout.displayName}</span>
                  {activeLayout?.id === layout.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>

                {showLayoutInfo && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Badge variant={typeBadge.variant as any} className="text-xs py-0">
                        {typeBadge.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs py-0">
                        {layout.variant}
                      </Badge>
                      {layout.isCustom && (
                        <Badge variant="default" className="text-xs py-0">Custom</Badge>
                      )}
                      {layout.isRecommended && (
                        <Badge variant="default" className="text-xs py-0">⭐</Badge>
                      )}
                    </div>

                    {isMyanmarLayout && encoding && (
                      <p className="text-xs text-muted-foreground">
                        Encoding: {encoding}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Popularity: {layout.popularity}%</span>
                      <span>•</span>
                      <span className="capitalize">{layout.layoutType}</span>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-muted-foreground"
          onClick={() => {
            // TODO: Open layout settings/customization modal
            console.log('Open layout settings');
          }}
        >
          <Settings className="h-4 w-4" />
          <span>Layout Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});