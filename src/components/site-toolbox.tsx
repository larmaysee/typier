"use client";
import { Share2 } from "lucide-react";
import { Icons } from "./icons";
import Profile from "./profile";
import { ThemeToggler } from "./theme-toggler";
import { Button } from "./ui/button";
import ViewToggler from "./view-toggler";

interface SiteToolboxProps {
  currentView: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics";
  onViewChange: (view: "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics") => void;
}

export default function SiteToolbox({ currentView, onViewChange }: SiteToolboxProps) {
  const handleShare = async () => {
    const shareData = {
      title: "Typoria - Multilingual Typing Test",
      text: "Test your typing speed in English, Lisu, and Myanmar!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

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
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="w-8 h-8 p-0 rounded-sm"
                title="Share Typoria"
              >
                <Share2 className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <ThemeToggler />
              <Profile />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
