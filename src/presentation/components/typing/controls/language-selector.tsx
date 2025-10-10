"use client";

import { useSiteConfig } from "@/components/site-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGE_DISPLAY_NAMES, LanguageCode } from "@/domain";
import { cn } from "@/lib/utils";
import { ChevronDown, Languages } from "lucide-react";
import { memo } from "react";

interface LanguageSelectorProps {
  compact?: boolean;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: LanguageCode.EN, name: LANGUAGE_DISPLAY_NAMES.en, icon: "🇺🇸" },
  { code: LanguageCode.LI, name: LANGUAGE_DISPLAY_NAMES.li, icon: "⛰️" },
  { code: LanguageCode.MY, name: LANGUAGE_DISPLAY_NAMES.my, icon: "🇲🇲" },
];

export const LanguageSelector = memo(function LanguageSelector({
  compact = false,
  disabled = false,
}: LanguageSelectorProps) {
  const { config, setConfig } = useSiteConfig();

  const currentLanguage = LANGUAGES.find((lang) => lang.code === config.language.code) || LANGUAGES[0];

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className={cn("gap-2", compact ? "h-8" : "h-9")}>
          <Languages className="h-4 w-4" />
          {!compact && (
            <>
              <span className="hidden sm:inline">{currentLanguage.icon}</span>
              <span>{currentLanguage.name}</span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              language.code === config.language.code && "bg-accent"
            )}
          >
            <span className="text-lg">{language.icon}</span>
            <span className="flex-1">{language.name}</span>
            {language.code === config.language.code && <span className="text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
