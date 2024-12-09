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
import { ChevronDown, KeyboardIcon } from "lucide-react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

export default function KeyboardSelector() {
  const { config, setConfig } = useSiteConfig();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={"sm"} className="rounded-lg">
          <KeyboardIcon size={24} />

          {config.language.code === "en"
            ? "English"
            : config.language.code === "my"
            ? "Myanmar"
            : config.language.code === "li"
            ? "Lisu"
            : "Unknown"}

          {/* dropdown icon  */}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Choose Keyboard</DropdownMenuLabel>
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
