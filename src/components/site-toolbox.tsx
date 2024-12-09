"use client";
import { KeyboardMode } from "@/enums/site-config";
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
              config.mode == KeyboardMode.DEFAULT ? "secondary" : "default"
            }
            size={"sm"}
            onClick={() =>
              setConfig({
                ...config,
                mode:
                  config.mode == KeyboardMode.DEFAULT
                    ? KeyboardMode.PRACTICE
                    : KeyboardMode.DEFAULT,
              })
            }
          >
            {config.mode == KeyboardMode.DEFAULT ? (
              <ToggleLeft size={16} />
            ) : (
              <ToggleRight size={16} />
            )}
            Practice Mode
          </Button>
          <ModeToggle />
        </div>
      </div>
    </>
  );
}
