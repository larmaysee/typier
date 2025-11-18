"use client";

import { useSiteConfig } from "@/components/site-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DifficultyLevel } from "@/domain";
import { cn } from "@/lib/utils";
import { ChevronDown, Target } from "lucide-react";
import { memo } from "react";

interface DifficultySelectorProps {
  compact?: boolean;
  disabled?: boolean;
}

interface DifficultyOption {
  level: DifficultyLevel;
  label: string;
  description: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    level: DifficultyLevel.EASY,
    label: "Easy",
    description: "Simple content",
  },
  {
    level: DifficultyLevel.MEDIUM,
    label: "Medium",
    description: "Moderate difficulty",
  },
  {
    level: DifficultyLevel.HARD,
    label: "Hard",
    description: "Advanced content",
  },
];

export const DifficultySelector = memo(function DifficultySelector({
  compact = false,
  disabled = false,
}: DifficultySelectorProps) {
  const { config, setConfig } = useSiteConfig();

  const currentDifficulty =
    DIFFICULTY_OPTIONS.find((opt) => opt.level === config.difficultyLevel) || DIFFICULTY_OPTIONS[0];

  const handleDifficultyChange = async (level: DifficultyLevel) => {
    await setConfig({
      ...config,
      difficultyLevel: level,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className={cn("gap-2", compact ? "h-8" : "h-9")}>
          <Target className="h-4 w-4" />
          {!compact && <span>{currentDifficulty.label}</span>}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {DIFFICULTY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.level}
            onClick={() => handleDifficultyChange(option.level)}
            className={cn(
              "flex items-start gap-2 cursor-pointer",
              option.level === config.difficultyLevel && "bg-accent"
            )}
          >
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
            {option.level === config.difficultyLevel && <span className="text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
