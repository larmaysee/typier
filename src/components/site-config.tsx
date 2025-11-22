"use client";

import themesConfig from "@/config/themes.json";
import { DifficultyLevel, LANGUAGE_DISPLAY_NAMES, LanguageCode, TestMode, TextType } from "@/domain";
import { dbToLanguageCode, languageCodeToDb, TypingDatabaseService } from "@/lib/appwrite";
import { applyThemeColors } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

interface SiteConfig {
  theme: ThemeMode;
  language: {
    code: LanguageCode;
    name: string;
  };
  showShiftLabel?: boolean;
  practiceMode?: boolean;
  allowDeletion?: boolean; // Allow backspace/delete when typing incorrectly
  showInputBox?: boolean; // Show/hide typing display input box
  textType: TextType; // What type of content to generate
  difficultyLevel: DifficultyLevel; // How difficult the content should be
  testMode: TestMode; // Time-based or word-based test
  selectedTime?: number; // Selected time duration in seconds
  selectedWords?: number; // Selected word count
  // Keyboard layout preferences per language
  preferredLayouts?: {
    [LanguageCode.EN]?: string;
    [LanguageCode.LI]?: string;
    [LanguageCode.MY]?: string;
  };
}

interface SiteConfigContextType {
  config: SiteConfig;
  setConfig: (newConfig: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void;
  loading: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  syncToCloud: () => Promise<void>;
  saveSettings: (newConfig: SiteConfig) => Promise<void>;
}

interface SiteConfigProviderProps {
  children: ReactNode;
}

const defaultConfig: SiteConfig = {
  theme: ThemeMode.DARK,
  language: {
    code: LanguageCode.LI,
    name: LANGUAGE_DISPLAY_NAMES[LanguageCode.LI] || "Lisu",
  },
  showShiftLabel: false,
  practiceMode: false,
  allowDeletion: true, // Default to allowing deletion
  showInputBox: true, // Default to showing input box
  textType: TextType.CHARS, // Default to characters
  difficultyLevel: DifficultyLevel.EASY, // Default to easy difficulty
  testMode: TestMode.TIME, // Default to time-based test
  selectedTime: 30, // Default 30 seconds
  selectedWords: 50, // Default 50 words
  preferredLayouts: {
    [LanguageCode.EN]: "en-us",
    [LanguageCode.LI]: "li-sil-basic",
    [LanguageCode.MY]: "my-unicode-myanmar",
  },
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultConfig,
  setConfig: () => {},
  loading: false,
  saving: false,
  hasUnsavedChanges: false,
  syncToCloud: async () => {},
  saveSettings: async () => {},
});

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
  const [config, setConfigState] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const STORAGE_KEY = "typoria_site_config";

  // Function to apply color theme
  const applyColorTheme = useCallback(
    (themeId?: string) => {
      if (typeof window === "undefined") return; // Guard for SSR

      const colorThemeId = themeId || localStorage.getItem("selectedColorTheme") || "default";
      const themes = themesConfig.themes;
      const selectedThemeData = themes.find((t) => t.id === colorThemeId);

      if (selectedThemeData) {
        const isDarkMode = theme === "dark";
        applyThemeColors(selectedThemeData, isDarkMode);
      }
    },
    [theme]
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      if (user && !user.id.startsWith("guest_") && !user.id.startsWith("anonymous")) {
        // Load from Appwrite for authenticated users
        const userSettings = await TypingDatabaseService.getUserSettings(user.id);
        if (userSettings) {
          const loadedConfig: SiteConfig = {
            theme:
              userSettings.theme === "light"
                ? ThemeMode.LIGHT
                : userSettings.theme === "dark"
                ? ThemeMode.DARK
                : ThemeMode.SYSTEM,
            language: {
              code: dbToLanguageCode(userSettings.preferred_language),
              name: LANGUAGE_DISPLAY_NAMES[dbToLanguageCode(userSettings.preferred_language)] || "English",
            },
            showShiftLabel: userSettings.show_shift_label ?? false,
            practiceMode: userSettings.practice_mode ?? false,
            allowDeletion: userSettings.allow_deletion ?? true,
            showInputBox: userSettings.show_input_box ?? true,
            textType: (userSettings.text_type as TextType) ?? TextType.CHARS,
            difficultyLevel: (userSettings.difficulty_level as DifficultyLevel) ?? DifficultyLevel.EASY,
            testMode: (userSettings.test_mode as TestMode) ?? TestMode.TIME,
            selectedTime: userSettings.selected_time ?? 30,
            selectedWords: userSettings.selected_words ?? 50,
            preferredLayouts: userSettings.preferred_layouts
              ? JSON.parse(userSettings.preferred_layouts)
              : defaultConfig.preferredLayouts,
          };
          setConfigState(loadedConfig);
          setHasUnsavedChanges(false);

          // Also save color theme if present and apply it
          if (userSettings.color_theme) {
            localStorage.setItem("selectedColorTheme", userSettings.color_theme);
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
            setConfigState({ ...defaultConfig, ...parsedConfig });
            setHasUnsavedChanges(false);

            // Apply saved color theme for guest users
            applyColorTheme();
          } catch (error) {
            console.error("Error parsing saved config:", error);
          }
        } else {
          // Apply default theme for new users
          applyColorTheme();
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fall back to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedConfig = JSON.parse(saved);
          setConfigState({ ...defaultConfig, ...parsedConfig });
          setHasUnsavedChanges(false);

          // Apply color theme from localStorage fallback
          applyColorTheme();
        } catch (parseError) {
          console.error("Error parsing saved config:", parseError);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, applyColorTheme is stable

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

  // Sync to cloud (Appwrite)
  const syncToCloud = useCallback(async () => {
    if (!user || user.id.startsWith("guest_") || user.id.startsWith("anonymous")) {
      return; // Skip for guest users
    }

    setSaving(true);
    try {
      console.log("[SiteConfig] Syncing to Appwrite...", { practiceMode: config.practiceMode });
      const colorTheme = localStorage.getItem("selectedColorTheme") || "default";

      await TypingDatabaseService.createOrUpdateUserSettings(user.id, {
        theme: config.theme === ThemeMode.LIGHT ? "light" : config.theme === ThemeMode.DARK ? "dark" : "system",
        preferred_language: languageCodeToDb(config.language.code),
        default_test_duration: 60,
        show_leaderboard: true,
        show_shift_label: config.showShiftLabel,
        practice_mode: config.practiceMode,
        allow_deletion: config.allowDeletion,
        show_input_box: config.showInputBox,
        text_type: config.textType,
        difficulty_level: config.difficultyLevel,
        test_mode: config.testMode,
        selected_time: config.selectedTime ?? 30,
        selected_words: config.selectedWords ?? 50,
        color_theme: colorTheme,
        preferred_layouts: config.preferredLayouts ? JSON.stringify(config.preferredLayouts) : undefined,
      });

      setHasUnsavedChanges(false);
      console.log("[SiteConfig] Synced to Appwrite successfully");
    } catch (error) {
      console.error("[SiteConfig] Error syncing to Appwrite:", error);
      // Keep hasUnsavedChanges true so user can retry
    } finally {
      setSaving(false);
    }
  }, [user, config]);

  // Sync to cloud with explicit config (avoids stale closure)
  const syncToCloudWithConfig = useCallback(
    async (configToSync: SiteConfig) => {
      if (!user || user.id.startsWith("guest_") || user.id.startsWith("anonymous")) {
        return; // Skip for guest users
      }

      setSaving(true);
      try {
        console.log("[SiteConfig] Syncing to Appwrite with explicit config...", {
          practiceMode: configToSync.practiceMode,
        });
        const colorTheme = localStorage.getItem("selectedColorTheme") || "default";

        await TypingDatabaseService.createOrUpdateUserSettings(user.id, {
          theme:
            configToSync.theme === ThemeMode.LIGHT
              ? "light"
              : configToSync.theme === ThemeMode.DARK
              ? "dark"
              : "system",
          preferred_language: languageCodeToDb(configToSync.language.code),
          default_test_duration: 60,
          show_leaderboard: true,
          show_shift_label: configToSync.showShiftLabel,
          practice_mode: configToSync.practiceMode,
          allow_deletion: configToSync.allowDeletion,
          show_input_box: configToSync.showInputBox,
          text_type: configToSync.textType,
          difficulty_level: configToSync.difficultyLevel,
          test_mode: configToSync.testMode,
          selected_time: configToSync.selectedTime ?? 30,
          selected_words: configToSync.selectedWords ?? 50,
          color_theme: colorTheme,
          preferred_layouts: configToSync.preferredLayouts ? JSON.stringify(configToSync.preferredLayouts) : undefined,
        });

        setHasUnsavedChanges(false);
        console.log("[SiteConfig] Synced to Appwrite successfully with explicit config");
      } catch (error) {
        console.error("[SiteConfig] Error syncing to Appwrite:", error);
        // Keep hasUnsavedChanges true so user can retry
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const saveSettings = async (newConfig: SiteConfig) => {
    try {
      console.log("[SiteConfig] saveSettings called with:", {
        practiceMode: newConfig.practiceMode,
        textType: newConfig.textType,
        difficultyLevel: newConfig.difficultyLevel,
      });

      // Always save to localStorage immediately (fast, no blocking)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfigState(newConfig);

      // Mark as having unsaved changes for cloud sync
      if (user && !user.id.startsWith("guest_") && !user.id.startsWith("anonymous")) {
        setHasUnsavedChanges(true);

        // Debounced background sync (5 seconds after last change)
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          console.log("[SiteConfig] Debounced sync triggered after 5 seconds");
          // Read the latest config from localStorage to avoid stale closure
          const latestConfig = localStorage.getItem(STORAGE_KEY);
          if (latestConfig) {
            const parsedConfig = JSON.parse(latestConfig);
            console.log("[SiteConfig] Syncing with latest config from localStorage:", {
              practiceMode: parsedConfig.practiceMode,
            });
            syncToCloudWithConfig(parsedConfig);
          } else {
            syncToCloud();
          }
        }, 5000);
      }
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Wrap setConfig to use saveSettings
  const handleConfigChange = (newConfig: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
    const configToSave = typeof newConfig === "function" ? newConfig(config) : newConfig;
    saveSettings(configToSave);
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        setConfig: handleConfigChange,
        loading,
        saving,
        hasUnsavedChanges,
        syncToCloud,
        saveSettings,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);
