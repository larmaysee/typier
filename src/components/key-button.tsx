import { cn, isModifier, keyname, titlecase } from "@/lib/utils";
import { Button } from "./ui/button";

import { Lisu_Bosa } from "next/font/google";

const lisuBosa = Lisu_Bosa({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export type KeyProps = {
  label: string;
  value: string;
  className?: string;
  shiftKey?: string | number;
  pressedKey?: string | null;
  isShift?: boolean;
  onClick?: () => void;
};

export default function KeyButton({
  label,
  value,
  className,
  shiftKey,
  pressedKey,
  isShift,
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
        "key-button shadow-md relative rounded p-2",
        `key-${keyname(value).toLowerCase()}`,
        (isPressed || (isShift && label === 'shift')) ? "bg-muted" : "",
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
          isModifierKey ? "text-sm" : "font-medium text-lg",
          lisuBosa.className,
        )}
      >
        {displayLabel}
      </span>
    </Button>
  );
}
