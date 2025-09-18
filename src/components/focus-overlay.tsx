"use client";

import { Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

export function FocusOverlay({ isVisible, onClick }: FocusOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-background/90"
      onClick={onClick}
    >
      <div className="text-center space-y-3 p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-2">
          <Keyboard className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Click or Press Any Key
          </h3>
          <p className="text-sm text-muted-foreground">
            Focus the typing area to start your test
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
            Any Key
          </kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
            Click
          </kbd>
        </div>
      </div>
    </div>
  );
}