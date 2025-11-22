"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { memo } from "react";

interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
}

export const RefreshButton = memo(function RefreshButton({ onRefresh, disabled = false }: RefreshButtonProps) {
  return (
    <Button variant="outline" size="icon" onClick={onRefresh} disabled={disabled}>
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
});
