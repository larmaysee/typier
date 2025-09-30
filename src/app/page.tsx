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

export default function Home() {
  const [currentView, setCurrentView] = useState<'typing' | 'statistics' | 'leaderboard' | 'settings'>('typing');
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

              <div className="flex flex-col gap-4 w-full md:max-w-[800px] md:m-auto sm:p-4">
                {/* <AdsBlock /> */}
                {currentView === 'typing' ? (
                  <TypingWithKeyboard />
                ) : currentView === 'statistics' ? (
                  <StatisticsDashboard />
                ) : currentView === 'leaderboard' ? (
                  <Leaderboard />
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
