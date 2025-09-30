"use client";

import { memo } from "react";
import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FingerAssignment } from "@/domain/enums/keyboard-layouts";

interface LayoutPreviewProps {
  layout: KeyboardLayout | null;
  showFingerPositions?: boolean;
  highlightActiveKey?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onKeyClick?: (key: string) => void;
}

const FINGER_COLORS: Record<FingerAssignment, string> = {
  [FingerAssignment.LEFT_PINKY]: "bg-red-200 dark:bg-red-800",
  [FingerAssignment.LEFT_RING]: "bg-orange-200 dark:bg-orange-800",
  [FingerAssignment.LEFT_MIDDLE]: "bg-yellow-200 dark:bg-yellow-800",
  [FingerAssignment.LEFT_INDEX]: "bg-green-200 dark:bg-green-800",
  [FingerAssignment.LEFT_THUMB]: "bg-blue-200 dark:bg-blue-800",
  [FingerAssignment.RIGHT_THUMB]: "bg-blue-200 dark:bg-blue-800",
  [FingerAssignment.RIGHT_INDEX]: "bg-green-200 dark:bg-green-800",
  [FingerAssignment.RIGHT_MIDDLE]: "bg-yellow-200 dark:bg-yellow-800",
  [FingerAssignment.RIGHT_RING]: "bg-orange-200 dark:bg-orange-800",
  [FingerAssignment.RIGHT_PINKY]: "bg-red-200 dark:bg-red-800",
};

const SIZE_CLASSES = {
  sm: "h-6 w-8 text-xs",
  md: "h-8 w-10 text-sm",
  lg: "h-10 w-12 text-base",
};

interface KeyProps {
  mapping: {
    key: string;
    character: string;
    shiftCharacter?: string;
    position?: {
      row: number;
      column: number;
      finger?: FingerAssignment;
    };
  };
  isHighlighted?: boolean;
  showFingerColor?: boolean;
  size: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

const KeyButton = memo(function KeyButton({
  mapping,
  isHighlighted,
  showFingerColor,
  size,
  interactive,
  onClick,
}: KeyProps) {
  const fingerColor = showFingerColor && mapping.position?.finger
    ? FINGER_COLORS[mapping.position.finger]
    : "";

  return (
    <Button
      variant={isHighlighted ? "default" : "outline"}
      size="sm"
      className={cn(
        "relative flex flex-col justify-center items-center p-1 min-h-0",
        SIZE_CLASSES[size],
        fingerColor,
        isHighlighted && "ring-2 ring-primary ring-offset-2",
        interactive && "hover:scale-105 transition-transform",
        !interactive && "pointer-events-none"
      )}
      onClick={interactive ? onClick : undefined}
    >
      <span className="font-mono leading-none">{mapping.character}</span>
      {mapping.shiftCharacter && (
        <span className="absolute top-0 right-0 text-xs opacity-60">
          {mapping.shiftCharacter}
        </span>
      )}
    </Button>
  );
});

export const LayoutPreview = memo(function LayoutPreview({
  layout,
  showFingerPositions = false,
  highlightActiveKey,
  size = "md",
  interactive = false,
  onKeyClick,
}: LayoutPreviewProps) {
  if (!layout) {
    return (
      <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground">No layout selected</p>
      </div>
    );
  }

  // Group key mappings by row
  const keyRows = layout.keyMappings.reduce((rows, mapping) => {
    const row = mapping.position?.row || 0;
    if (!rows[row]) rows[row] = [];
    rows[row].push(mapping);
    return rows;
  }, {} as Record<number, typeof layout.keyMappings>);

  // Sort rows and keys within rows
  const sortedRows = Object.entries(keyRows)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([, mappings]) =>
      mappings.sort((a, b) => (a.position?.column || 0) - (b.position?.column || 0))
    );

  return (
    <div className="keyboard-preview space-y-5">
      {/* Layout Info Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{layout.layoutType}</Badge>
          <Badge variant="outline">{layout.variant}</Badge>
          {layout.isCustom && <Badge variant="default">Custom</Badge>}
        </div>
        {showFingerPositions && (
          <div className="text-xs text-muted-foreground">
            Finger position guide
          </div>
        )}
      </div>

      {/* Virtual Keyboard */}
      <div className="keyboard-layout border rounded-lg p-8 bg-muted/5">
        <div className="space-y-2">
          {sortedRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1.5 justify-center">
              {row.map((mapping) => (
                <KeyButton
                  key={mapping.key}
                  mapping={mapping}
                  isHighlighted={highlightActiveKey === mapping.key}
                  showFingerColor={showFingerPositions}
                  size={size}
                  interactive={interactive}
                  onClick={() => onKeyClick?.(mapping.key)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Layout Statistics */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Total Keys</span>
          <span className="font-mono font-semibold text-base">{layout.keyMappings.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Input Method</span>
          <span className="font-medium text-sm">{layout.inputMethod}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Difficulty</span>
          <Badge variant="outline" className="w-fit">
            {layout.metadata.difficulty}
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Popularity</span>
          <span className="font-semibold text-base">{layout.metadata.popularity}%</span>
        </div>
      </div>

      {/* Finger Position Legend */}
      {showFingerPositions && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Finger Positions:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {Object.entries(FINGER_COLORS).map(([finger, colorClass]) => (
              <div key={finger} className="flex items-center gap-2">
                <div className={cn("w-3.5 h-3.5 rounded", colorClass)} />
                <span className="capitalize text-xs">
                  {finger.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});