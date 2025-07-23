"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Palette, Monitor, Sun, Moon, Check } from 'lucide-react';
import { useSiteConfig } from './site-config';
import { LanguageCode } from '@/enums/site-config';
import kbLayouts from '@/layouts/kb-layouts';
import themesConfig from '@/config/themes.json';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
  darkColors: Record<string, string>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { config, setConfig } = useSiteConfig();
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedColorTheme') || 'default';
    setSelectedTheme(savedTheme);

    // Apply the saved theme
    const savedThemeData = themes.find(t => t.id === savedTheme);
    if (savedThemeData) {
      applyThemeColors(savedThemeData);
    }
  }, []);

  useEffect(() => {
    // Reapply theme colors when light/dark mode changes
    if (mounted && selectedTheme) {
      const selectedThemeData = themes.find(t => t.id === selectedTheme);
      if (selectedThemeData) {
        applyThemeColors(selectedThemeData);
      }
    }
  }, [theme, mounted, selectedTheme]);

  const themes: Theme[] = themesConfig.themes;

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('selectedColorTheme', themeId);

    const selectedThemeData = themes.find(t => t.id === themeId);
    if (selectedThemeData) {
      applyThemeColors(selectedThemeData);
    }
  };

  const applyThemeColors = (themeData: Theme) => {
    const root = document.documentElement;
    const colors = theme === 'dark' ? themeData.darkColors : themeData.colors;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const handleLanguageChange = (languageCode: LanguageCode) => {
    const language = kbLayouts.find(layout => layout.code === languageCode);
    if (language) {
      setConfig({
        ...config,
        language: {
          code: languageCode,
          name: language.name
        }
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your typing experience with themes, languages, and preferences.
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark/Light Mode Toggle */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Appearance Mode</h3>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          <Separator />

          {/* Color Themes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Color Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((themeOption) => (
                <div
                  key={themeOption.id}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTheme === themeOption.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700'
                    }`}
                  onClick={() => handleThemeChange(themeOption.id)}
                >
                  {selectedTheme === themeOption.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{themeOption.name}</h4>
                      {themeOption.id === 'default' && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {themeOption.description}
                    </p>

                    {/* Color Preview */}
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: `hsl(${themeOption.colors.primary})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: `hsl(${themeOption.colors.secondary})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: `hsl(${themeOption.colors.accent})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: `hsl(${themeOption.colors.muted})` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keyboard Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {kbLayouts.map((layout) => (
                <Button
                  key={layout.code}
                  variant={config.language.code === layout.code ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => handleLanguageChange(layout.code)}
                >
                  <div className="text-left">
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-sm opacity-70">{layout.code.toUpperCase()}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show Shift Labels</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display shift key labels on the virtual keyboard
                </p>
              </div>
              <Button
                variant={config.showShiftLabel ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, showShiftLabel: !config.showShiftLabel })}
              >
                {config.showShiftLabel ? 'On' : 'Off'}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Practice Mode</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable practice mode for focused typing sessions
                </p>
              </div>
              <Button
                variant={config.practiceMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, practiceMode: !config.practiceMode })}
              >
                {config.practiceMode ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}