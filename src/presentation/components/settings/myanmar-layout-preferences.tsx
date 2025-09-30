"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Info, Star, Zap, BookOpen, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MyanmarLayoutOption {
  id: string;
  name: string;
  displayName: string;
  variant: string;
  type: 'Standard' | 'Legacy' | 'Unicode';
  encoding: 'Unicode' | 'Zawgyi (Legacy)';
  inputMethod: 'IME' | 'Direct';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  bestFor: string[];
  isRecommended?: boolean;
  popularity: number;
  features: string[];
}

const MYANMAR_LAYOUTS: MyanmarLayoutOption[] = [
  {
    id: 'my-myanmar3',
    name: 'Myanmar3',
    displayName: 'Myanmar (Myanmar3)',
    variant: 'myanmar3',
    type: 'Standard',
    encoding: 'Unicode',
    inputMethod: 'IME',
    difficulty: 'Medium',
    description: 'Most widely used modern Myanmar input method with full Unicode support',
    bestFor: ['General typing', 'Professional documents', 'Modern systems'],
    isRecommended: true,
    popularity: 95,
    features: ['Full Unicode support', 'Smart input method', 'Wide compatibility']
  },
  {
    id: 'my-zawgyi',
    name: 'Zawgyi',
    displayName: 'Myanmar (Zawgyi)',
    variant: 'zawgyi',
    type: 'Legacy',
    encoding: 'Zawgyi (Legacy)',
    inputMethod: 'IME',
    difficulty: 'Medium',
    description: 'Traditional encoding widely used before Unicode standardization',
    bestFor: ['Legacy systems', 'Older documents', 'Compatibility with old software'],
    isRecommended: false,
    popularity: 70,
    features: ['Legacy support', 'Backward compatible', 'Traditional input']
  },
  {
    id: 'my-unicode-standard',
    name: 'Unicode Standard',
    displayName: 'Myanmar (Unicode Standard)',
    variant: 'unicode_standard',
    type: 'Unicode',
    encoding: 'Unicode',
    inputMethod: 'Direct',
    difficulty: 'Hard',
    description: 'Official Unicode Consortium keyboard layout following standard specifications',
    bestFor: ['Unicode purists', 'Technical writing', 'Cross-platform documents'],
    isRecommended: false,
    popularity: 60,
    features: ['Unicode compliant', 'Direct input', 'Official standard']
  },
  {
    id: 'my-wininnwa',
    name: 'WinInnwa',
    displayName: 'Myanmar (WinInnwa)',
    variant: 'wininnwa',
    type: 'Legacy',
    encoding: 'Unicode',
    inputMethod: 'IME',
    difficulty: 'Medium',
    description: 'Popular traditional input method with modern Unicode encoding',
    bestFor: ['Traditional users', 'Familiar with WinInnwa', 'Desktop applications'],
    isRecommended: false,
    popularity: 65,
    features: ['Traditional layout', 'Unicode output', 'Desktop optimized']
  }
];

interface MyanmarLayoutPreferencesProps {
  selectedLayout?: string;
  onLayoutSelect: (layoutId: string) => void;
  onSave?: () => void;
}

export function MyanmarLayoutPreferences({
  selectedLayout,
  onLayoutSelect,
  onSave
}: MyanmarLayoutPreferencesProps) {
  const [selected, setSelected] = useState<string>(selectedLayout || 'my-myanmar3');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (selectedLayout) {
      setSelected(selectedLayout);
    }
  }, [selectedLayout]);

  const handleLayoutChange = (layoutId: string) => {
    setSelected(layoutId);
    onLayoutSelect(layoutId);
  };

  const selectedLayoutData = MYANMAR_LAYOUTS.find(l => l.id === selected);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <Zap className="h-3 w-3" />;
      case 'Medium': return <BookOpen className="h-3 w-3" />;
      case 'Hard': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Myanmar Keyboard Layout Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred Myanmar keyboard layout. Each layout has different character mappings
          and input methods suited for different use cases.
        </p>
      </div>

      <div className="space-y-3">
        {MYANMAR_LAYOUTS.map((layout) => (
          <Card
            key={layout.id}
            className={cn(
              "relative p-4 cursor-pointer transition-all hover:shadow-md",
              selected === layout.id && "ring-2 ring-primary border-primary"
            )}
            onClick={() => handleLayoutChange(layout.id)}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                value={layout.id}
                id={layout.id}
                checked={selected === layout.id}
                onChange={() => handleLayoutChange(layout.id)}
                className="mt-1 h-4 w-4 border-primary text-primary focus:ring-primary"
              />

              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={layout.id}
                        className="text-base font-semibold cursor-pointer"
                      >
                        {layout.name}
                      </label>
                      {layout.isRecommended && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {layout.description}
                    </p>
                  </div>

                  {selected === layout.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <span className="text-xs">Type:</span>
                    <span className="font-medium">{layout.type}</span>
                  </Badge>

                  <Badge variant="outline" className="gap-1">
                    <span className="text-xs">Encoding:</span>
                    <span className="font-medium">{layout.encoding}</span>
                  </Badge>

                  <Badge variant="outline" className="gap-1">
                    <span className="text-xs">Input:</span>
                    <span className="font-medium">{layout.inputMethod}</span>
                  </Badge>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", getDifficultyColor(layout.difficulty))}
                        >
                          {getDifficultyIcon(layout.difficulty)}
                          <span className="font-medium">{layout.difficulty}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {layout.difficulty === 'Easy' && 'Easy to learn and use'}
                          {layout.difficulty === 'Medium' && 'Moderate learning curve'}
                          {layout.difficulty === 'Hard' && 'Requires practice to master'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Badge variant="secondary" className="gap-1">
                    <span className="text-xs">Popularity:</span>
                    <span className="font-medium">{layout.popularity}%</span>
                  </Badge>
                </div>

                {/* Best For */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {layout.bestFor.map((use, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Features:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {layout.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Layout Summary */}
      {selectedLayoutData && (
        <>
          <Separator />
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">
                  Selected: {selectedLayoutData.displayName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedLayoutData.description}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  {onSave && (
                    <Button
                      size="sm"
                      onClick={onSave}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save Preference
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Layout Preview (Placeholder for future implementation) */}
      {showPreview && selectedLayoutData && (
        <Card className="p-4">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              Layout preview coming soon...
            </p>
            <p className="text-xs mt-2">
              Test {selectedLayoutData.name} layout during typing sessions
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
