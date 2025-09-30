"use client";
import { Icons } from "./icons";
import Profile from "./profile";
import { ThemeToggler } from "./theme-toggler";
import ViewToggler from "./view-toggler";

interface SiteToolboxProps {
  currentView: 'typing' | 'statistics' | 'leaderboard' | 'settings' | 'competitions' | 'analytics';
  onViewChange: (view: 'typing' | 'statistics' | 'leaderboard' | 'settings' | 'competitions' | 'analytics') => void;
}

export default function SiteToolbox({ currentView, onViewChange }: SiteToolboxProps) {
  return (
    <>
      <div className="border-b h-[60px] bg-background">
        <div className="flex items-center px-4 justify-between h-full container mx-auto">
          <Icons.typoria className="w-20" />
          <div className="flex items-center gap-4">
            <ViewToggler currentView={currentView} onViewChange={onViewChange} />
            <div className="flex gap-2">
              <ThemeToggler />
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
