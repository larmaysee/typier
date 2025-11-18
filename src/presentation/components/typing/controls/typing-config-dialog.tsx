"use client";

import { useSiteConfig } from "@/components/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DifficultyLevel, LANGUAGE_DISPLAY_NAMES, LanguageCode, TextType } from "@/domain";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Code,
  FileText,
  Hash,
  Keyboard,
  Languages,
  Lightbulb,
  Settings,
  Target,
  Type,
  Zap,
} from "lucide-react";
import { memo, useState } from "react";
import { KeyboardLayoutSelector } from "../keyboard-layouts/keyboard-layout-selector";

interface TypingConfigDialogProps {
  disabled?: boolean;
  onLayoutChange?: (layoutId: string) => void;
}

// Language options
const LANGUAGES = [
  { code: LanguageCode.EN, name: LANGUAGE_DISPLAY_NAMES.en, icon: "🇺🇸" },
  { code: LanguageCode.LI, name: LANGUAGE_DISPLAY_NAMES.li, icon: "⛰️" },
  { code: LanguageCode.MY, name: LANGUAGE_DISPLAY_NAMES.my, icon: "🇲🇲" },
];

// Text type options
interface TextTypeOption {
  type: TextType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TEXT_TYPE_OPTIONS: TextTypeOption[] = [
  {
    type: TextType.CHARS,
    label: "Characters",
    description: "Individual letters and basic symbols",
    icon: <Type className="h-5 w-5" />,
  },
  {
    type: TextType.WORDS,
    label: "Words",
    description: "Common vocabulary and word combinations",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    type: TextType.NUMBERS,
    label: "Numbers",
    description: "Numeric sequences and mathematical symbols",
    icon: <Hash className="h-5 w-5" />,
  },
  {
    type: TextType.SENTENCES,
    label: "Sentences",
    description: "Complete sentences with proper punctuation",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: TextType.PARAGRAPHS,
    label: "Paragraphs",
    description: "Multi-sentence text blocks and essays",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    type: TextType.CODE,
    label: "Code",
    description: "Programming syntax and special characters",
    icon: <Code className="h-5 w-5" />,
  },
];

// Difficulty level options
interface DifficultyOption {
  level: DifficultyLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    level: DifficultyLevel.EASY,
    label: "Easy",
    description: "Simple content with basic characters and common patterns",
    icon: <Zap className="h-5 w-5 text-green-500" />,
  },
  {
    level: DifficultyLevel.MEDIUM,
    label: "Medium",
    description: "Moderate complexity with mixed content and punctuation",
    icon: <Target className="h-5 w-5 text-yellow-500" />,
  },
  {
    level: DifficultyLevel.HARD,
    label: "Hard",
    description: "Advanced content with special characters and complex patterns",
    icon: <Zap className="h-5 w-5 text-red-500" />,
  },
];

export const TypingConfigDialog = memo(function TypingConfigDialog({
  disabled = false,
  onLayoutChange,
}: TypingConfigDialogProps) {
  const { config, setConfig } = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    const selectedLanguage = LANGUAGES.find((lang) => lang.code === languageCode);
    if (!selectedLanguage) return;

    await setConfig({
      ...config,
      language: {
        code: languageCode,
        name: selectedLanguage.name,
      },
    });
  };

  const handleTextTypeChange = async (textType: TextType) => {
    await setConfig({
      ...config,
      textType,
    });
  };

  const handleDifficultyChange = async (difficultyLevel: DifficultyLevel) => {
    await setConfig({
      ...config,
      difficultyLevel,
    });
  };

  const handlePracticeModeToggle = async () => {
    await setConfig({
      ...config,
      practiceMode: !config.practiceMode,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" disabled={disabled} className="gap-2">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Typing Configuration
          </DialogTitle>
          <DialogDescription>
            Customize your typing experience by selecting language, difficulty, keyboard layout, and practice mode
            settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Languages className="h-5 w-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LANGUAGES.map((language) => (
                  <div
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      "relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      language.code === config.language.code ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.icon}</span>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.code.toUpperCase()}</div>
                      </div>
                    </div>
                    {language.code === config.language.code && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Text Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5" />
                Text Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEXT_TYPE_OPTIONS.map((option) => (
                  <div
                    key={option.type}
                    onClick={() => handleTextTypeChange(option.type)}
                    className={cn(
                      "relative p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      option.type === config.textType ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <div className="font-medium text-sm">{option.label}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                    {option.type === config.textType && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Level Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <div
                    key={option.level}
                    onClick={() => handleDifficultyChange(option.level)}
                    className={cn(
                      "relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      option.level === config.difficultyLevel ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <div className="font-medium">{option.label}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    {option.level === config.difficultyLevel && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practice Mode & Keyboard Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Practice Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5" />
                  Practice Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onClick={handlePracticeModeToggle}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                    config.practiceMode ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="space-y-2">
                    <div className="font-medium">{config.practiceMode ? "Enabled" : "Disabled"}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.practiceMode
                        ? "Key highlighting and enhanced feedback active"
                        : "Standard typing mode without highlighting"}
                    </div>
                  </div>
                  {config.practiceMode && (
                    <div className="mt-2">
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Select your preferred keyboard layout for the current language.
                  </div>
                  <KeyboardLayoutSelector compact={false} showLayoutInfo={true} onLayoutChange={onLayoutChange} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
