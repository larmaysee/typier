"use client";
import { Icons } from "./icons";
import { ThemeToggler } from "./theme-toggler";
import ViewToggler from "./view-toggler";

interface SiteToolboxProps {
  currentView: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics";
  onViewChange: (view: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics") => void;
}

export default function SiteToolbox({ currentView, onViewChange }: SiteToolboxProps) {
  return (
    <>
      <div className="border-b border-dashed h-[60px]">
        <div className="flex items-center justify-between h-full container max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <Icons.typoria className="w-20" />
            <ViewToggler currentView={currentView} onViewChange={onViewChange} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <ThemeToggler />
              {/* <Profile /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
