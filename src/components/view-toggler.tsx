"use client";
import { BarChart3, Brain, Keyboard, Medal, Settings, Trophy } from "lucide-react";
import TooltipWrapper from "./tooltip-wrapper";
import { Button } from "./ui/button";

interface ViewTogglerProps {
  currentView: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics";
  onViewChange: (view: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics") => void;
}

export default function ViewToggler({ currentView, onViewChange }: ViewTogglerProps) {
  return (
    <div className="flex gap-1 border rounded-xl p-1">
      <TooltipWrapper tooltip="Typing Test">
        <Button
          variant={currentView === "typing" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("typing")}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Statistics">
        <Button
          variant={currentView === "statistics" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("statistics")}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Leaderboard">
        <Button
          variant={currentView === "leaderboard" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("leaderboard")}
        >
          <Trophy className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Competitions">
        <Button
          variant={currentView === "competitions" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("competitions")}
        >
          <Medal className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Analytics">
        <Button
          variant={currentView === "analytics" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("analytics")}
        >
          <Brain className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Settings">
        <Button
          variant={currentView === "settings" ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => onViewChange("settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
    </div>
  );
}
