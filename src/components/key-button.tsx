import { cn, isModifier, keyname, titlecase } from "@/lib/utils";
import { Button } from "./ui/button";

export type KeyProps = {
  label: string;
  value: string;
  className?: string;
  shiftKey?: string | number;
  onClick?: () => void;
};

export default function KeyButton({
  label,
  value,
  className,
  shiftKey,
  onClick,
}: KeyProps) {
  return (
    <Button
      value={label}
      className={cn(
        "key-button relative bg-white text-black hover:bg-white/10 dark:bg-black dark:border-none dark:hover:bg-white/20 border dark:text-white border-gray-300 rounded-lg p-2",
        `key-${keyname(value).toLowerCase()}`,
        className
      )}
      onClick={onClick}
    >
      {shiftKey && label != shiftKey && (
        <span className="absolute top-1 right-1 animate text-muted-foreground text-xs">
          {shiftKey}
        </span>
      )}
      <span
        className={cn(
          "z-10",
          !isModifier(value) ? "" : "text-muted-foreground text-xs"
        )}
      >
        {isModifier(value) ? titlecase(label) : label}
      </span>
    </Button>
  );
}
