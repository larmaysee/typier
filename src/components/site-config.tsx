"use client";
import { LanguageCode, ThemeMode } from "@/enums/site-config";
import layouts from "@/layouts/kb-layouts";
import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { TypingDatabaseService, languageCodeToDb, dbToLanguageCode } from "@/lib/appwrite";
import { useAuth } from "./auth-provider";
import { applyThemeColors, Theme } from "@/lib/utils";
import { useTheme } from "next-themes";
import themesConfig from "@/config/themes.json";

interface SiteConfig {
  theme: ThemeMode;
  language: {
    code: LanguageCode;
    name: string;
  };
  showShiftLabel?: boolean;
  practiceMode?: boolean;
  difficultyMode: 'chars' | 'syntaxs'; // New property for difficulty mode
}

interface SiteConfigContextType {
  config: SiteConfig;
  setConfig: (newConfig: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => Promise<void>;
  loading: boolean;
  saveSettings: (newConfig: SiteConfig) => Promise<void>;
}

interface SiteConfigProviderProps {
  children: ReactNode;
}

const defaultConfig: SiteConfig = {
  theme: ThemeMode.LIGHT,
  language: {
    code: LanguageCode.LI,
    name: layouts.find((layout) => layout.code === LanguageCode.LI)?.name || "",
  },
  showShiftLabel: false,
  practiceMode: false,
  difficultyMode: 'syntaxs', // Default to syntax mode
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultConfig,
  setConfig: async () => { },
  loading: false,
  saveSettings: async () => { },
});

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({
  children,
}) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  const STORAGE_KEY = 'typoria_site_config';

  // Function to apply color theme
  const applyColorTheme = useCallback((themeId?: string) => {
    if (typeof window === 'undefined') return; // Guard for SSR

    const colorThemeId = themeId || localStorage.getItem('selectedColorTheme') || 'default';
    const themes = themesConfig.themes;
    const selectedThemeData = themes.find(t => t.id === colorThemeId);

    if (selectedThemeData) {
      const isDarkMode = theme === 'dark';
      applyThemeColors(selectedThemeData, isDarkMode);
    }
  }, [theme]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      if (user && !user.id.startsWith('guest_') && !user.id.startsWith('anonymous')) {
        // Load from Appwrite for authenticated users
        const userSettings = await TypingDatabaseService.getUserSettings(user.id);
        if (userSettings) {
          const loadedConfig: SiteConfig = {
            theme: userSettings.theme === 'light' ? ThemeMode.LIGHT
              : userSettings.theme === 'dark' ? ThemeMode.DARK
                : ThemeMode.SYSTEM,
            language: {
              code: dbToLanguageCode(userSettings.preferred_language),
              name: layouts.find(l => l.code === dbToLanguageCode(userSettings.preferred_language))?.name || "English"
            },
            showShiftLabel: userSettings.show_shift_label ?? false,
            practiceMode: userSettings.practice_mode ?? false,
            difficultyMode: userSettings.difficulty_mode ?? 'syntaxs'
          };
          setConfig(loadedConfig);

          // Also save color theme if present and apply it
          if (userSettings.color_theme) {
            localStorage.setItem('selectedColorTheme', userSettings.color_theme);
            applyColorTheme(userSettings.color_theme);
          } else {
            // Apply default theme
            applyColorTheme();
          }
        }
      } else {
        // Load from localStorage for guest users or when Appwrite is not available
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsedConfig = JSON.parse(saved);
            setConfig({ ...defaultConfig, ...parsedConfig });

            // Apply saved color theme for guest users
            applyColorTheme();
          } catch (error) {
            console.error('Error parsing saved config:', error);
          }
        } else {
          // Apply default theme for new users
          applyColorTheme();
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fall back to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedConfig = JSON.parse(saved);
          setConfig({ ...defaultConfig, ...parsedConfig });

          // Apply color theme from localStorage fallback
          applyColorTheme();
        } catch (parseError) {
          console.error('Error parsing saved config:', parseError);
          // Apply default theme as final fallback
          applyColorTheme();
        }
      } else {
        // Apply default theme
        applyColorTheme();
      }
    } finally {
      setLoading(false);
    }
  }, [user, applyColorTheme]);

  // Load settings when user changes or on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Reapply color theme when light/dark mode changes
  useEffect(() => {
    if (theme) {
      applyColorTheme();
    }
  }, [theme, applyColorTheme]);

  const saveSettings = async (newConfig: SiteConfig) => {
    setLoading(true);
    try {
      if (user && !user.id.startsWith('guest_') && !user.id.startsWith('anonymous')) {
        // Get the current color theme from localStorage
        const colorTheme = localStorage.getItem('selectedColorTheme') || 'default';

        // Save to Appwrite for authenticated users
        await TypingDatabaseService.createOrUpdateUserSettings(user.id, {
          theme: newConfig.theme === ThemeMode.LIGHT ? 'light'
            : newConfig.theme === ThemeMode.DARK ? 'dark'
              : 'system',
          preferred_language: languageCodeToDb(newConfig.language.code),
          default_test_duration: 60, // Default value, could be made configurable
          show_leaderboard: true, // Default value, could be made configurable
          show_shift_label: newConfig.showShiftLabel,
          practice_mode: newConfig.practiceMode,
          difficulty_mode: newConfig.difficultyMode,
          color_theme: colorTheme
        });
      }

      // Always save to localStorage as backup/fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving settings:', error);
      // Fall back to localStorage only
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } finally {
      setLoading(false);
    }
  };

  // Wrap setConfig to use saveSettings
  const handleConfigChange = async (newConfig: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
    const configToSave = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    await saveSettings(configToSave);
  };

  return (
    <SiteConfigContext.Provider value={{
      config,
      setConfig: handleConfigChange,
      loading,
      saveSettings
    }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);