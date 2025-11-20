/**
 * Comprehensive keyboard layout preferences for all supported languages
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { LanguageCode } from "@/domain";
import { cn } from "@/lib/utils";
import { BookOpen, Check, Clock, Keyboard, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface LayoutOption {
  id: string;
  name: string;
  displayName: string;
  variant: string;
  type: "Standard" | "Legacy" | "Unicode" | "Phonetic";
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  bestFor: string[];
  isRecommended?: boolean;
  popularity: number;
  features: string[];
  keyPreview: string[];
}

// English Layouts
const ENGLISH_LAYOUTS: LayoutOption[] = [
  {
    id: "en-qwerty-us",
    name: "QWERTY US",
    displayName: "QWERTY (US Standard)",
    variant: "qwerty-us",
    type: "Standard",
    difficulty: "Easy",
    description: "Standard US QWERTY layout, most commonly used worldwide",
    bestFor: ["General typing", "Programming", "Standard documents"],
    isRecommended: true,
    popularity: 98,
    features: ["Universal compatibility", "Standard layout", "Easy to learn"],
    keyPreview: ["Q", "W", "E", "R", "T", "Y"],
  },
];

// Lisu Layouts
const LISU_LAYOUTS: LayoutOption[] = [
  {
    id: "li-sil-basic",
    name: "SIL Basic",
    displayName: "Lisu (SIL Basic)",
    variant: "sil-basic",
    type: "Standard",
    difficulty: "Easy",
    description: "Basic SIL keyboard for Lisu script with simplified character mapping",
    bestFor: ["Beginners", "Basic text", "Learning Lisu"],
    isRecommended: true,
    popularity: 85,
    features: ["Simple mapping", "Beginner friendly", "Basic character set"],
    keyPreview: ["ꓐ", "ꓑ", "ꓒ", "ꓓ", "ꓔ", "ꓕ"],
  },
];

// Myanmar Layouts
const MYANMAR_LAYOUTS: LayoutOption[] = [
  {
    id: "my-unicode-standard",
    name: "Unicode Standard",
    displayName: "Myanmar (Unicode)",
    variant: "unicode-standard",
    type: "Unicode",
    difficulty: "Medium",
    description: "Standard Unicode Myanmar layout for modern applications",
    bestFor: ["Modern systems", "Unicode compliance", "New projects"],
    popularity: 80,
    features: ["Unicode standard", "Modern compatibility", "Future-proof"],
    keyPreview: ["က", "ခ", "ဂ", "ဃ", "င", "စ"],
  },
];

interface LanguageLayoutSelectorProps {
  language: LanguageCode;
  selectedLayoutId?: string;
  onLayoutSelect: (layoutId: string) => void;
  onSave?: () => void;
}

export function LanguageLayoutSelector({ language, selectedLayoutId, onLayoutSelect }: LanguageLayoutSelectorProps) {
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);

  // Get layouts based on language
  useEffect(() => {
    switch (language) {
      case LanguageCode.EN:
        setLayouts(ENGLISH_LAYOUTS);
        break;
      case LanguageCode.LI:
        setLayouts(LISU_LAYOUTS);
        break;
      case LanguageCode.MY:
        setLayouts(MYANMAR_LAYOUTS);
        break;
      default:
        setLayouts([]);
    }
  }, [language]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Standard":
        return <Keyboard className="h-4 w-4" />;
      case "Unicode":
        return <Zap className="h-4 w-4" />;
      case "Legacy":
        return <Clock className="h-4 w-4" />;
      case "Phonetic":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Keyboard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className={cn(
              "cursor-pointer transition-all px-3 py-2 rounded-md border border-dashed flex items-center justify-between hover:bg-muted/30",
              selectedLayoutId === layout.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border"
            )}
            onClick={() => onLayoutSelect(layout.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(layout.type)}
                <h4 className="font-medium text-sm">{layout.displayName}</h4>
              </div>
              <div className="flex items-center gap-2">
                {layout.isRecommended && (
                  <Badge variant="default" className="flex items-center gap-1 text-xs h-5">
                    <Star className="h-3 w-3" />
                    Recommended
                  </Badge>
                )}
                <Badge className={getDifficultyColor(layout.difficulty) + " text-xs h-5"}>{layout.difficulty}</Badge>
                <Badge variant="outline" className="text-xs h-5">
                  {layout.popularity}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {layout.keyPreview.slice(0, 4).map((key, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center w-6 h-6 border rounded text-xs font-medium bg-muted/50"
                  >
                    {key}
                  </div>
                ))}
              </div>
              {selectedLayoutId === layout.id && <Check className="h-4 w-4 text-primary" />}
            </div>
          </div>
        ))}
      </div>

      {layouts.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Keyboard className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No keyboard layouts available for this language.</p>
        </div>
      )}
    </div>
  );
}
