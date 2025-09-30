"use client";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { SiteConfigProvider } from "@/components/site-config";
import { TypingStatisticsProvider } from "@/components/typing-statistics";
import SiteFooter from "@/components/site-footer";
import SiteToolbox from "@/components/site-toolbox";
import { TypingWithKeyboard } from "@/presentation/components/typing/typing-with-keyboard";
import StatisticsDashboard from "@/components/statistics-dashboard";
import Leaderboard from "@/components/leaderboard";
import SettingsPage from "@/components/settings-page";
import { CompetitionHub } from "@/presentation/components/competitions/competition-hub";
import { AnalyticsDashboard } from "@/presentation/components/analytics/analytics-dashboard";
import { cn } from "@/lib/utils";

export default function Home() {
  const [currentView, setCurrentView] = useState<'typing' | 'statistics' | 'leaderboard' | 'settings' | 'competitions' | 'analytics'>('typing');
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent SSR/SSG rendering
  }

  return (
    <>
      <AuthProvider>
        <SiteConfigProvider>
          <TypingStatisticsProvider>
            <div className="grid grid-rows-[auto,1fr,auto] col-span-3 gap-2 min-h-screen">
              <SiteToolbox currentView={currentView} onViewChange={setCurrentView} />

              <div className={cn(
                "flex flex-col gap-4 w-full sm:p-4",
                currentView === 'typing' ? "max-w-full px-4" : "md:max-w-[800px] md:m-auto"
              )}>
                {/* <AdsBlock /> */}
                {currentView === 'typing' ? (
                  <TypingWithKeyboard />
                ) : currentView === 'statistics' ? (
                  <StatisticsDashboard />
                ) : currentView === 'leaderboard' ? (
                  <Leaderboard />
                ) : currentView === 'competitions' ? (
                  <CompetitionHub />
                ) : currentView === 'analytics' ? (
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
