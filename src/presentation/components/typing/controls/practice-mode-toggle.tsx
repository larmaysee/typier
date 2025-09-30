"use client";

import { memo } from "react";
import { useSiteConfig } from "@/components/site-config";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PracticeModeToggleProps {
  disabled?: boolean;
}

export const PracticeModeToggle = memo(function PracticeModeToggle({
  disabled = false,
}: PracticeModeToggleProps) {
  const { config, setConfig } = useSiteConfig();

  const handleToggle = async () => {
    await setConfig({
      ...config,
      practiceMode: !config.practiceMode,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={config.practiceMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={disabled}
            className="h-9 gap-2"
          >
            {config.practiceMode ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            <span className="hidden md:inline">Practice</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.practiceMode ? "Disable" : "Enable"} practice mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
