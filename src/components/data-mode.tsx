"use client";
import { Button } from "./ui/button";
import { useSiteConfig } from "./site-config";

export default function DataMode() {
  const { config, setConfig } = useSiteConfig();

  const handleModeChange = (mode: 'chars' | 'syntaxs') => {
    setConfig(prev => ({
      ...prev,
      difficultyMode: mode
    }));
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground mr-2">Difficulty:</span>
      <div className="flex">
        <Button
          variant={config.difficultyMode === 'chars' ? 'default' : 'secondary'}
          size="sm"
          className="border-r-0 rounded-r-none"
          onClick={() => handleModeChange('chars')}
        >
          <span className="text-sm">Characters</span>
        </Button>
        <Button 
          variant={config.difficultyMode === 'syntaxs' ? 'default' : 'secondary'}
          size="sm" 
          className="rounded-l-none"
          onClick={() => handleModeChange('syntaxs')}
        >
          <span className="text-sm">Sentences</span>
        </Button>
      </div>
    </div>
  );
}
