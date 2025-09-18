"use client";
import english from "@/layouts/english";
import lisu from "@/layouts/lisu";
import myanmar from "@/layouts/myanmar";
import { cn, isModifier, keyname } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import KeyButton from "./key-button";
import { usePracticeMode } from "./pratice-mode";
import { useSiteConfig } from "./site-config";

type KeyboardType = {
  defaults: [];
  shifts: [];
};

type Key =
  | string
  | "{backspace}"
  | "{tab}"
  | "{caps-lock}"
  | "{enter}"
  | "{shift}"
  | "{ctrl}"
  | "{alt}"
  | "{spacebar}";
type KeyboardRow = Key[];
type KeyboardLayout = {
  defaults: KeyboardRow[];
  shifts: KeyboardRow[];
};

export default function Keyboard() {
  const { config } = useSiteConfig();
  const { activeChar, composekey } = usePracticeMode();
  const [keyboardType, setKeyboardType] = useState<KeyboardLayout | null>(null);
  const [currentLayout, setCurrentLayout] = useState<KeyboardRow[]>();
  const [shiftLayout, setShiftLayout] = useState<KeyboardRow[]>();
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChar || !config.practiceMode) {
      setCurrentKey(null);
      return;
    }
    
    // Handle special characters
    if (activeChar === "spacebar" || activeChar === " ") {
      setCurrentKey("spacebar");
    } else {
      setCurrentKey(activeChar);
    }
  }, [activeChar, config.practiceMode]);

  useEffect(() => {
    if (!composekey) {
      setPressedKey(null);
      return;
    }

    const isModifierKey = isModifier(composekey);
    setPressedKey(isModifierKey ? keyname(composekey) : composekey);
  }, [composekey]);

  useEffect(() => {
    const layouts = {
      li: { defaults: lisu.defaults, shifts: lisu.shifts },
      en: { defaults: english.default, shifts: english.shift },
      my: { defaults: myanmar.default, shifts: myanmar.shift },
    };

    setKeyboardType(
      layouts[config.language.code as keyof typeof layouts] as KeyboardType
    );
  }, [config.language]);

  useEffect(() => {
    if (!keyboardType) return;
    setCurrentLayout(keyboardType.defaults);
    setShiftLayout(keyboardType.shifts);
  }, [keyboardType]);

  const handleShift = useCallback(
    (isShift: boolean) => {
      setShift(isShift);
      if (isShift) {
        setCurrentLayout(keyboardType?.shifts);
      } else {
        setCurrentLayout(keyboardType?.defaults);
      }
    },
    [keyboardType]
  );

  useEffect(() => {
    if (config.practiceMode && currentKey) {
      const isShiftRequired = shiftLayout?.some(
        (row) => row.includes(currentKey) && !isModifier(currentKey)
      );
      if (isShiftRequired) {
        setTimeout(() => handleShift(true), 0);
      } else {
        setTimeout(() => handleShift(false), 0);
      }
    }
  }, [config.practiceMode, currentKey, handleShift, shiftLayout]);

  const getCurrentShiftKey = (rowIndex: number, keyIndex: number) => {
    if (!shiftLayout) return "";
    return keyname(shiftLayout![rowIndex]?.[keyIndex]);
  };

  const handleKeyPress = (key: string) => {
    console.log(key);
    setPressedKey(key);

    if (key === "{shift}") {
      handleShift(!shift);
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
        // Handle caps lock logic if needed
      }
      if (shift) {
        handleShift(false);
      }
    }

    setTimeout(() => setPressedKey(null), 200); // Remove highlight after 200ms
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        event.preventDefault();
        return;
      }

      if (event.key === "Shift") {
        handleShift(true);
      }

      if (event.key === " ") {
        setPressedKey("spacebar");
      } else {
        const key = isModifier(event.key)
          ? keyname(event.key).toLowerCase()
          : event.key;
        setPressedKey(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        event.preventDefault();
        return;
      }

      setPressedKey(null);

      if (event.key === "Shift") {
        handleShift(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("selectstart", (e) => e.preventDefault());
    document.addEventListener("select", (e) => e.preventDefault());

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("selectstart", (e) => e.preventDefault());
      document.removeEventListener("select", (e) => e.preventDefault);
    };
  }, [handleShift, shift]);

  return (
    <div className={cn("border rounded-lg bg-muted-foreground/10 p-2")}>
      <div className={cn("flex flex-col gap-2")}>
        {currentLayout &&
          currentLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-1">
              {row.map((key, keyIndex) => (
                <KeyButton
                  key={keyIndex}
                  label={keyname(key)}
                  value={key}
                  shiftKey={
                    config.showShiftLabel
                      ? getCurrentShiftKey(rowIndex, keyIndex)
                      : ""
                  }
                  onClick={() => handleKeyPress(key)}
                  pressedKey={pressedKey}
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
                      : "grow min-w-10",
                    // Improved highlighting logic for practice mode
                    config.practiceMode && currentKey && (
                      currentKey === keyname(key) || 
                      currentKey === key || 
                      (currentKey === "spacebar" && keyname(key) === "spacebar") ||
                      (shift && key === "{shift}")
                    )
                      ? "bg-primary text-primary-foreground"
                      : ""
                  )}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
