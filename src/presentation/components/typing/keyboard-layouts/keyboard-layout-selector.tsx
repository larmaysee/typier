"use client";

import { memo } from "react";
import { useKeyboardLayouts } from "@/presentation/hooks/keyboard-layouts/use-keyboard-layouts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Keyboard, Check } from "lucide-react";
import { LoadingSpinner } from "../loading-spinner";

export const KeyboardLayoutSelector = memo(function KeyboardLayoutSelector() {
  const {
    availableLayouts,
    activeLayout,
    isLoading,
    switchLayout,
  } = useKeyboardLayouts();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Keyboard className="h-4 w-4 mr-2" />
        <LoadingSpinner size="sm" message="" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Keyboard className="h-4 w-4 mr-2" />
          {activeLayout?.displayName || "Select Layout"}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {availableLayouts.map((layout) => (
          <DropdownMenuItem
            key={layout.id}
            onClick={() => switchLayout(layout.id)}
            className="flex items-center justify-between"
          >
            <span>{layout.displayName}</span>
            {activeLayout?.id === layout.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});