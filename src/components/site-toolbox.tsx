"use client";
import { ToggleLeft, ToggleRight } from "lucide-react";
import KeyboardSelector from "./keyboard-selector";
import { ModeToggle } from "./mode-toggler";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

export default function SiteToolbox() {
  const { config, setConfig } = useSiteConfig();

  return (
    <>
      <div className="border-b h-[50px] flex items-center px-4 justify-between">
        <h3 className="text-xl font-bold">Typier</h3>
        <div className="flex gap-2">
          <KeyboardSelector />
          <Button
            variant={
              config.practiceMode ? "default" : "secondary"
            }
            size={"sm"}
            onClick={() =>
              setConfig({
                ...config,
                practiceMode:
                  !config.practiceMode
              })
            }
          >
            {config.practiceMode ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
            Practice Mode
          </Button>
          <ModeToggle />
        </div>
      </div>
    </>
  );
}
