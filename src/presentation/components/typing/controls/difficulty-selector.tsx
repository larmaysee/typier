"use client";

import { memo } from "react";
import { useSiteConfig } from "@/components/site-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Type, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  compact?: boolean;
  disabled?: boolean;
}

type DifficultyMode = 'chars' | 'syntaxs';

interface DifficultyOption {
  mode: DifficultyMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    mode: 'chars',
    label: 'Characters',
    icon: <Type className="h-4 w-4" />,
    description: 'Individual characters',
  },
  {
    mode: 'syntaxs',
    label: 'Sentences',
    icon: <FileText className="h-4 w-4" />,
    description: 'Full sentences',
  },
];

export const DifficultySelector = memo(function DifficultySelector({
  compact = false,
  disabled = false,
}: DifficultySelectorProps) {
  const { config, setConfig } = useSiteConfig();

  const currentDifficulty = DIFFICULTY_OPTIONS.find(
    (opt) => opt.mode === config.difficultyMode
  ) || DIFFICULTY_OPTIONS[1];

  const handleDifficultyChange = async (mode: DifficultyMode) => {
    await setConfig({
      ...config,
      difficultyMode: mode,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2",
            compact ? "h-8" : "h-9"
          )}
        >
          {currentDifficulty.icon}
          {!compact && <span>{currentDifficulty.label}</span>}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {DIFFICULTY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.mode}
            onClick={() => handleDifficultyChange(option.mode)}
            className={cn(
              "flex items-start gap-2 cursor-pointer",
              option.mode === config.difficultyMode && "bg-accent"
            )}
          >
            <div className="mt-0.5">{option.icon}</div>
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">
                {option.description}
              </div>
            </div>
            {option.mode === config.difficultyMode && (
              <span className="text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
