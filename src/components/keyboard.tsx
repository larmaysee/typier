"use client";
import english from "@/layouts/english";
import lisu from "@/layouts/lisu";
import myanmar from "@/layouts/myanmar";
import { cn, keyname } from "@/lib/utils";
import { useEffect, useState } from "react";
import KeyButton from "./key-button";
import { useSiteConfig } from "./site-config";
type KeyboardType = {
  defaults: string[];
  shifts: string[];
};
export default function Keyboard() {
  const { config } = useSiteConfig();
  const [keyboardType, setKeyboardType] = useState<KeyboardType | null>(null);
  const [currentLayout, setCurrentLayout] = useState<string[]>();
  const [shiftLayout, setShiftLayout] = useState<string[]>();
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const layouts = {
      li: { defaults: lisu.defaults, shifts: lisu.shifts },
      en: { defaults: english.default, shifts: english.shift },
      my: { defaults: myanmar.default, shifts: myanmar.shift },
    };

    setKeyboardType(layouts[config.language.code]);
  }, [config.language]);

  useEffect(() => {
    if (!keyboardType) return;
    setCurrentLayout(keyboardType.defaults);
    setShiftLayout(keyboardType.shifts);
  }, [keyboardType]);

  const getCurrentShiftKey = (rowIndex: number, keyIndex: number) => {
    if (!shiftLayout) return "";
    return keyname(shiftLayout![rowIndex]?.split(" ")[keyIndex]);
  };

  const handleShift = () => {
    setCurrentLayout(shiftLayout);
    setShiftLayout(currentLayout);
  };

  const handleKeyPress = (key: string) => {
    console.log(key);

    if (key === "{shift}") {
      setShift(!shift);
      handleShift();
    } else if (key === "{caps-lock}") {
      setCapsLock(!capsLock);
      if (capsLock) {
        setCurrentLayout(keyboardType?.defaults);
        setShiftLayout(keyboardType?.shifts);
      } else {
        setCurrentLayout(keyboardType?.shifts);
        setShiftLayout(keyboardType?.defaults);
      }
    } else {
      if (capsLock) {
      }
      if (shift) {
        setShift(false);
        handleShift();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Shift") {
        setShift(true);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "Shift") {
        setShift(false);
      }
    });
  }, []);

  return (
    <div className={cn("border rounded-lg bg-muted  p-2")}>
      <div className={cn("flex flex-col gap-2")}>
        {currentLayout &&
          currentLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-1">
              {row.split(" ").map((key, keyIndex) => (
                <KeyButton
                  key={keyIndex}
                  label={keyname(key)}
                  value={key}
                  shiftKey={getCurrentShiftKey(rowIndex, keyIndex)}
                  onClick={() => handleKeyPress(key)}
                  className={cn(
                    keyname(key) === "spacebar"
                      ? "grow-[10]"
                      : keyname(key) === "shift"
                      ? "grow-[2]"
                      : keyname(key) === "enter"
                      ? "grow-[2]"
                      : keyname(key) === "backspace"
                      ? "grow-[2]"
                      : keyname(key) === "ctrl"
                      ? "grow-[2]"
                      : keyname(key) === "alt"
                      ? "grow-[2]"
                      : keyname(key) === "window"
                      ? "grow-[2]"
                      : keyname(key) === "caps-lock"
                      ? "grow-[2]"
                      : keyname(key) === "tab"
                      ? "grow-[2]"
                      : "grow min-w-10"
                  )}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
