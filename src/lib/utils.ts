import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
  darkColors: Record<string, string>;
}

export function applyThemeColors(themeData: Theme, isDarkMode: boolean = false) {
  if (typeof document === 'undefined') return; // Guard for SSR

  const root = document.documentElement;
  const colors = isDarkMode ? themeData.darkColors : themeData.colors;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
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
