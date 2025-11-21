"use client";

import { Trophy } from "lucide-react";

export function Leaderboard() {
  return (
    <div className="container mx-auto p-4 min-h-[60vh] flex items-center justify-center">
      <div className="text-center py-12 space-y-6">
        <Trophy className="h-24 w-24 mx-auto text-primary opacity-50" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Coming Soon</h1>
          <p className="text-xl text-muted-foreground">Global Leaderboard</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto pt-4">
            We&apos;re working on bringing you competitive rankings across languages, test modes, and time periods. Stay
            tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
