"use client";
import { Icons } from "./icons";
import Profile from "./profile";
import { ThemeToggler } from "./theme-toggler";

export default function SiteToolbox() {
  return (
    <>
      <div className="border-b h-[60px] bg-background">
        <div className="flex items-center px-4 justify-between h-full container mx-auto">
          <Icons.typoria className="w-20" />
          <div className="flex gap-2">
            <ThemeToggler />
            <Profile />
          </div>
        </div>
      </div>
    </>
  );
}
