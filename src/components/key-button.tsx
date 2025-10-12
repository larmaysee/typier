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

export default function KeyButton({ label, value, className, shiftKey, pressedKey, onClick }: KeyProps) {
  const isPressed = pressedKey === value;
  const isModifierKey = isModifier(value);
  const displayLabel = isModifierKey ? titlecase(label) : label;
  const isEmpty = !displayLabel || displayLabel.trim() === "";

  return (
    <Button
      value={label}
      variant={"secondary"}
      disabled={isEmpty}
      className={cn(
        "key-button relative p-2 border",
        `key-${keyname(value).toLowerCase()}`,
        isPressed ? "bg-primary text-primary-foreground" : "",
        isEmpty && "opacity-30 cursor-not-allowed",
        className
      )}
      onClick={isEmpty ? undefined : onClick}
    >
      {shiftKey && label !== shiftKey && (
        <span className="absolute top-1 right-1 animate text-muted-foreground text-xs">{shiftKey}</span>
      )}
      <span className={cn("z-10 min-w-5", isModifierKey ? "text-sm" : "font-medium text-lg")}>{displayLabel}</span>
    </Button>
  );
}
