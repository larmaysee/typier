import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function keyname(key: string) {
  return key.replace(/{(.*?)}/g, "$1").replace(/NaN/g, "");
}

export function titlecase(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isModifier(key: string) {
  return [
    "{tab}",
    "{caps-lock}",
    "{shift}",
    "{ctrl}",
    "{alt}",
    "{window}",
    "{spacebar}",
    "{enter}",
    "{backspace}",
    "Backspace",
    "Tab",
    "CapsLock",
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "Enter",
    "Space",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ].includes(key);
}
