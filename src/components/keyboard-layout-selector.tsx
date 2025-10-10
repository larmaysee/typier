/**
 * Comprehensive keyboard layout preferences for all supported languages
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  {
    id: "en-dvorak",
    name: "Dvorak",
    displayName: "Dvorak Simplified",
    variant: "dvorak",
    type: "Standard",
    difficulty: "Hard",
    description: "Alternative layout designed for efficiency and reduced finger movement",
    bestFor: ["Touch typing", "Speed typing", "Ergonomic typing"],
    popularity: 15,
    features: ["Optimized for English", "Reduced finger movement", "Better for touch typing"],
    keyPreview: ["'", ",", ".", "P", "Y", "F"],
  },
  {
    id: "en-colemak",
    name: "Colemak",
    displayName: "Colemak",
    variant: "colemak",
    type: "Standard",
    difficulty: "Medium",
    description: "Modern alternative to QWERTY with improved efficiency",
    bestFor: ["Ergonomic typing", "Programming", "Modern workflows"],
    popularity: 8,
    features: ["QWERTY shortcuts preserved", "Improved efficiency", "Easy transition"],
    keyPreview: ["Q", "W", "F", "P", "G", "J"],
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
  {
    id: "li-sil-standard",
    name: "SIL Standard",
    displayName: "Lisu (SIL Standard)",
    variant: "sil-standard",
    type: "Standard",
    difficulty: "Medium",
    description: "Standard SIL keyboard with full Lisu character support",
    bestFor: ["Professional typing", "Complete documents", "Advanced users"],
    popularity: 70,
    features: ["Full character set", "Professional grade", "Complete coverage"],
    keyPreview: ["ꓐ", "ꓑ", "ꓒ", "ꓓ", "ꓔ", "ꓕ"],
  },
  {
    id: "li-unicode-standard",
    name: "Unicode Standard",
    displayName: "Lisu (Unicode Standard)",
    variant: "unicode-standard",
    type: "Unicode",
    difficulty: "Medium",
    description: "Direct Unicode mapping for Lisu characters with standard positioning",
    bestFor: ["Unicode compliance", "Modern systems", "Cross-platform"],
    popularity: 45,
    features: ["Unicode standard", "Cross-platform", "Modern compatibility"],
    keyPreview: ["ꓐ", "ꓑ", "ꓒ", "ꓓ", "ꓔ", "ꓕ"],
  },
];

// Myanmar Layouts
const MYANMAR_LAYOUTS: LayoutOption[] = [
  {
    id: "my-myanmar3",
    name: "Myanmar3",
    displayName: "Myanmar (Myanmar3)",
    variant: "myanmar3",
    type: "Standard",
    difficulty: "Medium",
    description: "Most widely used modern Myanmar input method with full Unicode support",
    bestFor: ["General typing", "Professional documents", "Modern systems"],
    isRecommended: true,
    popularity: 95,
    features: ["Full Unicode support", "Smart input method", "Wide compatibility"],
    keyPreview: ["က", "ခ", "ဂ", "ဃ", "င", "စ"],
  },
  {
    id: "my-zawgyi",
    name: "Zawgyi",
    displayName: "Myanmar (Zawgyi)",
    variant: "zawgyi",
    type: "Legacy",
    difficulty: "Easy",
    description: "Legacy Zawgyi encoding for compatibility with older systems",
    bestFor: ["Legacy systems", "Compatibility", "Older documents"],
    popularity: 25,
    features: ["Legacy compatibility", "Simple input", "Older system support"],
    keyPreview: ["က", "ခ", "ဂ", "ဃ", "င", "စ"],
  },
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

export function LanguageLayoutSelector({
  language,
  selectedLayoutId,
  onLayoutSelect,
  onSave,
}: LanguageLayoutSelectorProps) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {language === LanguageCode.EN && "English Keyboard Layouts"}
          {language === LanguageCode.LI && "Lisu Keyboard Layouts"}
          {language === LanguageCode.MY && "Myanmar Keyboard Layouts"}
        </h3>
        {onSave && (
          <Button onClick={onSave} size="sm">
            Save Preference
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border",
              selectedLayoutId === layout.id
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-border hover:border-muted-foreground"
            )}
            onClick={() => onLayoutSelect(layout.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(layout.type)}
                      <h4 className="font-semibold text-lg">{layout.displayName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {layout.isRecommended && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Recommended
                        </Badge>
                      )}
                      <Badge className={getDifficultyColor(layout.difficulty)}>{layout.difficulty}</Badge>
                      <Badge variant="outline">{layout.popularity}% users</Badge>
                    </div>
                    {selectedLayoutId === layout.id && <Check className="h-5 w-5 text-primary" />}
                  </div>

                  <p className="text-sm text-muted-foreground">{layout.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Best for:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {layout.bestFor.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Key features:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {layout.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Preview */}
                  <div className="pt-2 border-t">
                    <h5 className="text-sm font-medium mb-2">Key preview:</h5>
                    <div className="flex gap-1">
                      {layout.keyPreview.map((key, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center w-8 h-8 border rounded text-sm font-medium bg-muted"
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {layouts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Keyboard className="h-8 w-8 mx-auto mb-2" />
          <p>No keyboard layouts available for this language.</p>
        </div>
      )}
    </div>
  );
}
