import { ToggleLeft, ToggleRight } from "lucide-react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function ModeToggler() {
  const { config, setConfig } = useSiteConfig();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={config.practiceMode ? "default" : "secondary"}
            size={"sm"}
            onClick={() =>
              setConfig({
                ...config,
                practiceMode: !config.practiceMode,
              })
            }
          >
            <span className="sr-only">Toggle Pratice Mode</span>
            {config.practiceMode ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Pratice Mode</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
