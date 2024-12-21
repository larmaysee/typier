import { cn, isModifier, keyname, titlecase } from "@/lib/utils";
import { Button } from "./ui/button";

export type KeyProps = {
  label: string;
  value: string;
  className?: string;
  shiftKey?: string | number;
  pressedKey?: string | null;
  onClick?: () => void;
};

export default function KeyButton({
  label,
  value,
  className,
  shiftKey,
  pressedKey,
  onClick,
}: KeyProps) {
  const isPressed = pressedKey === label;
  const isModifierKey = isModifier(value);
  const displayLabel = isModifierKey ? titlecase(label) : label;
  return (
    <Button
      value={label}
      variant={"outline"}
      className={cn(
        "key-button relative p-2",
        `key-${keyname(value).toLowerCase()}`,
        isPressed ? "bg-primary" : "",
        className
      )}
      onClick={onClick}
    >
      {shiftKey && label !== shiftKey && (
        <span className="absolute top-1 right-1 animate text-muted-foreground text-xs">
          {shiftKey}
        </span>
      )}
      <span
        className={cn(
          "z-10 min-w-5",
          isModifierKey ? "text-sm" : "font-medium text-lg"
        )}
      >
        {displayLabel}
      </span>
    </Button>
  );
}
