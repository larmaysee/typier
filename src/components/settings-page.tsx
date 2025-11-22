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
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { config, setConfig, loading, saving, hasUnsavedChanges, syncToCloud } = useSiteConfig();
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
              <>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  {hasUnsavedChanges ? "Pending Sync" : "Synced"}
                </Badge>
                {hasUnsavedChanges && (
                  <Button size="sm" onClick={syncToCloud} disabled={saving} className="h-7">
                    {saving ? "Syncing..." : "Save to Cloud"}
                  </Button>
                )}
              </>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard
          </TabsTrigger>
        </TabsList>

        {/* 1. Theme Settings Tab */}
        <TabsContent value="themes" className="space-y-6">
          <Card className="rounded-2xl border border-dashed py-4">
            <CardContent className="space-y-6">
              {/* Dark/Light Mode Toggle */}
              <div className="flex justify-between items-center space-y-3">
                <div className="flex flex-col justify-start">
                  <h3 className="text-lg font-medium">Appearance Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose between light and dark modes for your typing experience.
                  </p>
                </div>
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

              <Separator className="my-4" />
              {/* Color Themes */}
              <div className="space-y-4">
                <div className="flex flex-col justify-start">
                  <h3 className="text-lg font-medium">Color Themes</h3>
                  <p className="text-xs text-muted-foreground">
                    Select a color theme to personalize the look and feel of the application.
                  </p>
                </div>
                <div className="flex gap-4">
                  {themes.map((themeOption) => (
                    <Button
                      key={themeOption.id}
                      variant={"secondary"}
                      className={
                        "relative h-10 w-10 rounded-full overflow-hidden flex flex-col border-2 " +
                        (selectedTheme === themeOption.id ? " border-primary ring-2 ring-primary/20" : " border-border")
                      }
                      style={{
                        backgroundColor: `hsl(${themeOption.colors.primary})`,
                      }}
                      onClick={() => handleThemeChange(themeOption.id)}
                    >
                      {selectedTheme === themeOption.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Check className="h-4 w-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Keyboard Layout Configuration Tab */}
        <TabsContent value="keyboard" className="space-y-6">
          <Card className="rounded-2xl border border-dashed py-4">
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-4">
                <div className="flex flex-col justify-start">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Active Language
                  </h3>
                  <p className="text-xs text-muted-foreground">Choose your primary typing language</p>
                </div>
                <div className="flex gap-3">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <Button
                      key={language.code}
                      variant={config.language.code === language.code ? "default" : "outline"}
                      className="w-10 h-10 rounded-full"
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <span className="text-xl">{language.flag}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Keyboard Layout Selection */}
              <div className="space-y-4">
                <div className="flex flex-col justify-start">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Layout
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select your preferred keyboard layout for {config.language.name}
                  </p>
                </div>
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
                />
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="allow-deletion">Allow Deletion</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow using backspace to delete characters when making mistakes
                      </p>
                    </div>
                    <Button
                      variant={config.allowDeletion ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, allowDeletion: !config.allowDeletion })}
                    >
                      {config.allowDeletion ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="show-input-box">Show Input Box</Label>
                      <p className="text-sm text-muted-foreground">
                        Display the typing input box below the text display
                      </p>
                    </div>
                    <Button
                      variant={config.showInputBox ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, showInputBox: !config.showInputBox })}
                    >
                      {config.showInputBox ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
