"use client";
import { useState } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { TypingStatisticsProvider } from "@/components/typing-statistics";
import SiteFooter from "@/components/site-footer";
import SiteToolbox from "@/components/site-toolbox";
import TestUi from "@/components/test-ui";
import StatisticsDashboard from "@/components/statistics-dashboard";
import Leaderboard from "@/components/leaderboard";
import SettingsPage from "@/components/settings-page";

export default function Home() {
  const [currentView, setCurrentView] = useState<'typing' | 'statistics' | 'leaderboard' | 'settings'>('typing');

  return (
    <>
      <AuthProvider>
        <TypingStatisticsProvider>
          <div className="grid grid-rows-[auto,1fr,auto] col-span-3 gap-2 min-h-screen">
            <SiteToolbox currentView={currentView} onViewChange={setCurrentView} />

            <div className="flex flex-col gap-4 w-full md:max-w-[800px] md:m-auto sm:p-4">
              {/* <AdsBlock /> */}
              {currentView === 'typing' ? (
                <TestUi />
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
      </AuthProvider>
    </>
  );
}
