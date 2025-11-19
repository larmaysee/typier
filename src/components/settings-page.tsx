"use client";

import themesConfig from "@/config/themes.json";
import { LanguageCode } from "@/domain";
import { SUPPORTED_LANGUAGES } from "@/lib/constants/keyboard-layouts";
import { applyThemeColors, Theme } from "@/lib/utils";
import { Check, Cloud, Globe, HardDrive, Keyboard, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { LanguageLayoutSelector } from "./keyboard-layout-selector";
import { useSiteConfig } from "./site-config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { config, setConfig, loading } = useSiteConfig();
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("themes");

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("selectedColorTheme") || "default";
    setSelectedTheme(savedTheme);

    // Apply the saved theme
    const savedThemeData = themes.find((t) => t.id === savedTheme);
    if (savedThemeData) {
      applyThemeColors(savedThemeData, theme === "dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, theme]);

  useEffect(() => {
    // Reapply theme colors when light/dark mode changes
    if (mounted && selectedTheme) {
      const selectedThemeData = themes.find((t) => t.id === selectedTheme);
      if (selectedThemeData) {
        applyThemeColors(selectedThemeData, theme === "dark");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mounted, selectedTheme]);

  const themes: Theme[] = themesConfig.themes;

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem("selectedColorTheme", themeId);

    const selectedThemeData = themes.find((t) => t.id === themeId);
    if (selectedThemeData) {
      applyThemeColors(selectedThemeData, theme === "dark");
    }

    // Save color theme preference for authenticated users
    try {
      await setConfig({
        ...config,
        // Trigger a settings save that will include the color theme
      });
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    const language = SUPPORTED_LANGUAGES.find((layout) => layout.code === languageCode);
    if (language) {
      await setConfig({
        ...config,
        language: {
          code: languageCode,
          name: language.name,
        },
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6 container max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Customize your typing experience with themes, languages, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user && !user.id.startsWith("guest_") && !user.id.startsWith("anonymous") ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                Synced to Cloud
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                Stored Locally
              </Badge>
            )}
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
          </div>
        </div>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme Settings
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Layouts
          </TabsTrigger>
        </TabsList>

        {/* 1. Theme Settings Tab */}
        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark/Light Mode Toggle */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Appearance Mode</h3>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
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
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTheme === themeOption.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground"
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
                          {themeOption.id === "default" && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">{themeOption.description}</p>

                        {/* Color Preview */}
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-4 rounded-full border border-muted"
                            style={{ backgroundColor: `hsl(${themeOption.colors.primary})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-muted"
                            style={{ backgroundColor: `hsl(${themeOption.colors.secondary})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-muted"
                            style={{ backgroundColor: `hsl(${themeOption.colors.accent})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full border border-muted"
                            style={{ backgroundColor: `hsl(${themeOption.colors.muted})` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Display Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Display Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="shift-labels">Show Shift Labels</Label>
                      <p className="text-sm text-muted-foreground">Display shift key labels on the virtual keyboard</p>
                    </div>
                    <Button
                      variant={config.showShiftLabel ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, showShiftLabel: !config.showShiftLabel })}
                    >
                      {config.showShiftLabel ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="practice-mode">Practice Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable practice mode with finger position guides and key highlighting
                      </p>
                    </div>
                    <Button
                      variant={config.practiceMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, practiceMode: !config.practiceMode })}
                    >
                      {config.practiceMode ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Keyboard Layout Configuration Tab */}
        <TabsContent value="keyboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Active Language</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <Button
                      key={language.code}
                      variant={config.language.code === language.code ? "default" : "outline"}
                      className="justify-start h-auto p-4 space-y-2"
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{language.flag}</span>
                        <div className="text-left flex-1">
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm opacity-70">{language.code.toUpperCase()}</div>
                        </div>
                        {config.language.code === language.code && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Selected:</strong> {config.language.name} ({config.language.code.toUpperCase()})
                  <br />
                  {SUPPORTED_LANGUAGES.find((l) => l.code === config.language.code)?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Layout Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <LanguageLayoutSelector
                language={config.language.code}
                selectedLayoutId={config.preferredLayouts?.[config.language.code]}
                onLayoutSelect={(layoutId) => {
                  setConfig({
                    ...config,
                    preferredLayouts: {
                      ...config.preferredLayouts,
                      [config.language.code]: layoutId,
                    },
                  });
                }}
                onSave={async () => {
                  // Save is automatic with setConfig
                  console.log("Layout preference saved for", config.language.code);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
