import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import kbLayouts from "@/layouts/kb-layouts";
import { KeyboardIcon } from "lucide-react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

export default function KeyboardSelector() {
  const { config, setConfig } = useSiteConfig();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={"sm"} title="Choose Keyboard">
          <KeyboardIcon size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-muted-foreground text-sm font-normal">
          Choose Keyboard
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {kbLayouts.map((layout) => (
            <DropdownMenuItem
              key={layout.code}
              onClick={() =>
                setConfig({
                  ...config,
                  language: layout,
                })
              }
            >
              <KeyboardIcon />
              <span>{layout.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
