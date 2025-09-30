"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
}

export const RefreshButton = memo(function RefreshButton({
  onRefresh,
  disabled = false,
}: RefreshButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={disabled}
            className="h-9"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh test (Ctrl+R)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
