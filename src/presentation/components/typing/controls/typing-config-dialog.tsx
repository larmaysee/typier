"use client";

import { useSiteConfig } from "@/components/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DifficultyLevel, LANGUAGE_DISPLAY_NAMES, LanguageCode, TextType } from "@/domain";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Code,
  DeleteIcon,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Languages,
  Lightbulb,
  Settings2,
  Target,
  Type,
  Zap,
} from "lucide-react";
import { memo, useState } from "react";

interface TypingConfigDialogProps {
  disabled?: boolean;
  onLayoutChange?: (layoutId: string) => void;
}

// Language options
const LANGUAGES = [
  { code: LanguageCode.LI, name: LANGUAGE_DISPLAY_NAMES.li, icon: "⛰️" },
  { code: LanguageCode.EN, name: LANGUAGE_DISPLAY_NAMES.en, icon: "🇺🇸" },
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

export const TypingConfigDialog = memo(function TypingConfigDialog({ disabled = false }: TypingConfigDialogProps) {
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

  const handleAllowDeletionToggle = async () => {
    await setConfig({
      ...config,
      allowDeletion: !config.allowDeletion,
    });
  };

  const handleShowInputBoxToggle = async () => {
    await setConfig({
      ...config,
      showInputBox: !config.showInputBox,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" disabled={disabled} className="gap-2">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Typing Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2 flex justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4" />
              Language
            </div>
            <div className="flex gap-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "flex-1 px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                    language.code === config.language.code ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{language.icon}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Text Type Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4" />
              Text Type
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TEXT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleTextTypeChange(option.type)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                    option.type === config.textType ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Difficulty Level Selection */}
          <div className="space-y-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Difficulty
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.level}
                  onClick={() => handleDifficultyChange(option.level)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                    option.level === config.difficultyLevel ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Practice Mode */}
          <div className="space-y-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4" />
              Practice Mode
            </div>
            <button
              onClick={handlePracticeModeToggle}
              className={cn(
                "px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                config.practiceMode ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <Badge variant={config.practiceMode ? "default" : "secondary"} className="text-xs">
                  {config.practiceMode ? "On" : "Off"}
                </Badge>
              </div>
            </button>
          </div>

          <Separator />

          {/* Allow Deletion */}
          <div className="space-y-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DeleteIcon className="h-4 w-4" />
              Allow Deletion
            </div>
            <button
              onClick={handleAllowDeletionToggle}
              className={cn(
                "px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                config.allowDeletion ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <Badge variant={config.allowDeletion ? "default" : "secondary"} className="text-xs">
                  {config.allowDeletion ? "On" : "Off"}
                </Badge>
              </div>
            </button>
          </div>

          <Separator />

          {/* Show Input Box */}
          <div className="space-y-2 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              {config.showInputBox ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Show Input Box
            </div>
            <button
              onClick={handleShowInputBoxToggle}
              className={cn(
                "px-3 py-2 border rounded-lg transition-all hover:border-primary/50 text-sm",
                config.showInputBox ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <Badge variant={config.showInputBox ? "default" : "secondary"} className="text-xs">
                  {config.showInputBox ? "Visible" : "Hidden"}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
