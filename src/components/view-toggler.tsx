"use client";
import { BarChart3, Keyboard, Settings, Trophy } from "lucide-react";
import TooltipWrapper from "./tooltip-wrapper";
import { Button } from "./ui/button";

interface ViewTogglerProps {
  currentView: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics";
  onViewChange: (view: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics") => void;
}

export default function ViewToggler({ currentView, onViewChange }: ViewTogglerProps) {
  return (
    <div className="flex gap-2">
      <TooltipWrapper tooltip="Typing Test">
        <Button
          variant={currentView === "typing" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("typing")}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Statistics">
        <Button
          variant={currentView === "statistics" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("statistics")}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Leaderboard">
        <Button
          variant={currentView === "leaderboard" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("leaderboard")}
        >
          <Trophy className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      {/* <TooltipWrapper tooltip="Competitions">
        <Button
          variant={currentView === "competitions" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("competitions")}
        >
          <Medal className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper tooltip="Analytics">
        <Button
          variant={currentView === "analytics" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("analytics")}
        >
          <Brain className="h-4 w-4" />
        </Button>
      </TooltipWrapper> */}
      <TooltipWrapper tooltip="Settings">
        <Button
          variant={currentView === "settings" ? "default" : "outline"}
          size="icon"
          className="w-8 h-8 p-0 rounded-sm"
          onClick={() => onViewChange("settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipWrapper>
    </div>
  );
}
