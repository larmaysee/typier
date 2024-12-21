"use client";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function TooltipWrapper({
  children,
  tooltip,
  placement = "start",
  ...props
}: {
  children: React.ReactNode;
  tooltip: string;
  placement?: "center" | "start" | "end" | undefined;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent align={placement} {...props}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
