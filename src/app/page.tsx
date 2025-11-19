"use client";
import { AuthProvider } from "@/components/auth-provider";
import SettingsPage from "@/components/settings-page";
import { SiteConfigProvider } from "@/components/site-config";
import SiteFooter from "@/components/site-footer";
import SiteToolbox from "@/components/site-toolbox";
import StatisticsDashboard from "@/components/statistics-dashboard";
import { TypingStatisticsProvider } from "@/components/typing-statistics";
import { cn } from "@/lib/utils";
import { AnalyticsDashboard } from "@/presentation/components/analytics/analytics-dashboard";
import { CompetitionHub } from "@/presentation/components/competitions/competition-hub";
import { Leaderboard } from "@/presentation/components/leaderboard/leaderboard";
import { TypingWithKeyboard } from "@/presentation/components/typing/typing-with-keyboard";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "typing" | "statistics" | "leaderboard" | "settings" | "competitions" | "analytics"
  >("typing");
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AuthProvider>
        <SiteConfigProvider>
          <TypingStatisticsProvider>
            <div className="container max-w-5xl mx-auto h-[calc(100vh-50px)] overflow-hidden border border-dashed px-6 m-6 rounded-xl">
              <SiteToolbox currentView={currentView} onViewChange={setCurrentView} />

              <div
                className={cn(
                  "flex flex-col gap-4 flex-1 space-y-4 py-6 min-w-0 max-w-5xl mx-auto w-full h-[calc(100vh-165px)] overflow-y-auto px-4"
                )}
              >
                {currentView === "typing" ? (
                  <>
                    <TypingWithKeyboard />
                  </>
                ) : currentView === "statistics" ? (
                  <StatisticsDashboard />
                ) : currentView === "leaderboard" ? (
                  <Leaderboard />
                ) : currentView === "competitions" ? (
                  <CompetitionHub />
                ) : currentView === "analytics" ? (
                  <AnalyticsDashboard />
                ) : (
                  <SettingsPage />
                )}
              </div>
              <SiteFooter />
            </div>
          </TypingStatisticsProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </>
  );
}
