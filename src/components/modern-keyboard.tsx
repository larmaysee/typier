/**
 * Modern Keyboard component using the new extensible layout system
 */

"use client";

import { LanguageCode } from "@/domain";
import { KeyDefinition, LanguageLayoutDefinition, ModifierState } from "@/domain/interfaces/language-layout-definition";
import { keyboardLayoutRegistry } from "@/infrastructure/services/keyboard-layout-registry";
import { cn, isModifier, keyname } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import KeyButton from "./key-button";
import { usePracticeMode } from "./pratice-mode";
import { useSiteConfig } from "./site-config";

export default function ModernKeyboard() {
  const { config } = useSiteConfig();
  const { activeChar, composekey } = usePracticeMode();

  // ===== STATE =====
  const [currentLayout, setCurrentLayout] = useState<LanguageLayoutDefinition | null>(null);
  const [modifierState, setModifierState] = useState<ModifierState>({
    shift: false,
    alt: false,
    ctrl: false,
    capsLock: false,
  });
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [currentHighlightKey, setCurrentHighlightKey] = useState<string | null>(null);

  // ===== CHARACTER MAPPING UTILITIES =====

  // Basic character finder for layout keys
  const findKeyForCharacter = useCallback(
    (character: string): KeyDefinition | null => {
      if (!currentLayout) return null;

      for (const row of currentLayout.layout.rows) {
        for (const key of row.keys) {
          if (
            key.char === character ||
            key.shiftChar === character ||
            key.altChar === character ||
            key.ctrlChar === character
          ) {
            return key;
          }
        }
      }
      return null;
    },
    [currentLayout]
  );

  // Lisu language character mapping (Latin to Lisu conversion)
  const getListuCharacterMapping = useCallback((latinChar: string): string => {
    const lisuMapping: Record<string, string> = {
      // Lowercase letters
      q: "q",
      e: "ꓪ",
      r: "ꓰ",
      t: "ꓣ",
      y: "ꓔ",
      u: "ꓬ",
      i: "ꓴ",
      o: "ꓲ",
      p: "ꓳ",
      a: "ꓮ",
      s: "ꓢ",
      d: "ꓓ",
      f: "ꓝ",
      g: "ꓖ",
      h: "ꓧ",
      j: "ꓙ",
      k: "ꓗ",
      l: "ꓡ",
      z: "ꓜ",
      x: "ꓫ",
      c: "ꓚ",
      v: "ꓦ",
      b: "ꓐ",
      n: "ꓠ",
      m: "ꓟ",

      // Uppercase letters (shift variants)
      E: "ꓱ",
      R: "ꓤ",
      T: "ꓕ",
      Y: "ꓻ",
      U: "ꓵ",
      I: "꓾",
      P: "ꓒ",
      A: "ꓯ",
      S: "ꓸꓼ",
      D: "ꓷ",
      F: "ꓞ",
      G: "ꓨ",
      H: "ꓺ",
      J: "ꓩ",
      K: "ꓘ",
      L: "ꓶ",
      C: "ꓛ",
      V: "ꓥ",
      B: "ꓭ",

      // Special characters
      "[": "ꓑ",
      ";": "ꓼ",
      "'": "ʼ",
      ",": "ꓹ",
      ".": "ꓸ",
      ":": "ꓽ",
    };

    return lisuMapping[latinChar] || latinChar;
  }, []);

  // Enhanced character finder with Lisu support
  const findKeyForCharacterEnhanced = useCallback(
    (character: string): KeyDefinition | null => {
      if (!currentLayout) return null;

      // Try direct character match first
      let result = findKeyForCharacter(character);
      if (result) return result;

      // For Lisu language, try Latin-to-Lisu mapping
      if (currentLayout.language === LanguageCode.LI) {
        const lisuChar = getListuCharacterMapping(character);
        if (lisuChar !== character) {
          result = findKeyForCharacter(lisuChar);
          if (result) return result;
        }
      }

      return null;
    },
    [currentLayout, findKeyForCharacter, getListuCharacterMapping]
  );

  // ===== MODIFIER & KEY STATE UTILITIES =====

  // Determine required modifiers for a character
  const getRequiredModifiers = useCallback((key: KeyDefinition, character: string): Partial<ModifierState> => {
    const modifiers: Partial<ModifierState> = {};

    if (key.shiftChar === character) modifiers.shift = true;
    if (key.altChar === character) modifiers.alt = true;
    if (key.ctrlChar === character) modifiers.ctrl = true;

    return modifiers;
  }, []);

  // Get current character based on modifier state
  const getCurrentCharacter = useCallback(
    (key: KeyDefinition): string => {
      let char = key.char;

      if (modifierState.ctrl && key.ctrlChar) char = key.ctrlChar;
      else if (modifierState.alt && key.altChar) char = key.altChar;
      else if ((modifierState.shift || modifierState.capsLock) && key.shiftChar) char = key.shiftChar;

      // Filter out invalid values
      return char === "NaN" || char === undefined || char === null ? "" : char;
    },
    [modifierState]
  );

  // Get shift character for display
  const getShiftCharacter = useCallback((key: KeyDefinition): string => {
    const shiftChar = key.shiftChar || key.char.toUpperCase();
    return shiftChar === "NaN" || shiftChar === undefined || shiftChar === null ? "" : shiftChar;
  }, []);

  // Determine modifier type from key
  const getModifierType = useCallback((key: KeyDefinition): string | null => {
    const char = key.char.toLowerCase();
    if (char.includes("shift") || char === "⇧") return "shift";
    if (char.includes("alt") || char === "alt") return "alt";
    if (char.includes("ctrl") || char === "ctrl") return "ctrl";
    if (char.includes("caps") || char === "⇪") return "capsLock";
    return null;
  }, []);

  // ===== STYLING UTILITIES =====

  // Get key width class based on key type
  const getKeyWidthClass = useCallback((key: KeyDefinition): string => {
    const width = key.width || 1;

    if (key.type === "space") return "grow-[10]";
    if (width >= 2) return "grow-[2]";
    if (width >= 1.5) return "grow-[2]";

    return "grow min-w-10";
  }, []);

  // Check if key should be highlighted in practice mode
  const isKeyHighlighted = useCallback(
    (key: KeyDefinition): boolean => {
      if (!config.practiceMode) return false;

      // Highlight the target key
      if (currentHighlightKey === key.key) return true;

      // Highlight required modifier keys
      if (key.type === "modifier") {
        const modifierType = getModifierType(key);
        return modifierType ? !!modifierState[modifierType as keyof ModifierState] : false;
      }

      return false;
    },
    [config.practiceMode, currentHighlightKey, modifierState, getModifierType]
  );

  // ===== EVENT HANDLERS =====

  // Handle button click events
  const handleKeyPress = useCallback((key: KeyDefinition) => {
    setPressedKey(key.key);

    // Handle modifier keys
    if (key.type === "modifier") {
      const modifierType = getModifierType(key);
      if (modifierType) {
        setModifierState((prev) => ({
          ...prev,
          [modifierType]: !prev[modifierType as keyof ModifierState],
        }));
      }
    }

    // Auto-release key highlight after short delay
    setTimeout(() => setPressedKey(null), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== EFFECTS =====

  // ===== EFFECTS =====

  // Load layout when language changes
  useEffect(() => {
    const loadLayout = async () => {
      await keyboardLayoutRegistry.ensureInitialized();
      const layout = keyboardLayoutRegistry.getDefaultLayoutForLanguage(config.language.code as LanguageCode);

      if (layout) {
        setCurrentLayout(layout);
        console.log(`Loaded layout: ${layout.metadata.name} for ${layout.language}`);
      } else {
        console.warn(`No layout found for language: ${config.language.code}`);
      }
    };

    loadLayout();
  }, [config.language.code]);

  // Handle active character highlighting for practice mode
  useEffect(() => {
    if (!activeChar || !config.practiceMode || !currentLayout) {
      setCurrentHighlightKey(null);
      return;
    }

    // Find the key that produces this character
    const targetChar = activeChar === "spacebar" || activeChar === " " ? " " : activeChar;
    const matchingKey = findKeyForCharacterEnhanced(targetChar);

    if (matchingKey) {
      setCurrentHighlightKey(matchingKey.key);

      // Update modifier state based on character requirements
      const requiredModifiers = getRequiredModifiers(matchingKey, targetChar);
      setModifierState((prev) => ({ ...prev, ...requiredModifiers }));
    } else {
      setCurrentHighlightKey(null);
    }
  }, [activeChar, config.practiceMode, currentLayout, findKeyForCharacterEnhanced, getRequiredModifiers]);

  // Handle compose key highlighting
  useEffect(() => {
    if (!composekey) {
      setPressedKey(null);
      return;
    }

    const isModifierKey = isModifier(composekey);
    setPressedKey(isModifierKey ? keyname(composekey) : composekey);
  }, [composekey]);

  // Handle physical keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        event.preventDefault();
        return;
      }

      // Update modifier state
      if (event.key === "Shift") {
        setModifierState((prev) => ({ ...prev, shift: true }));
      } else if (event.key === "Alt") {
        setModifierState((prev) => ({ ...prev, alt: true }));
      } else if (event.key === "Control") {
        setModifierState((prev) => ({ ...prev, ctrl: true }));
      }

      // Find matching key and highlight it
      const matchingKey = findKeyForCharacterEnhanced(event.key === " " ? " " : event.key);
      if (matchingKey) {
        setPressedKey(matchingKey.key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        event.preventDefault();
        return;
      }

      // Update modifier state
      if (event.key === "Shift") {
        setModifierState((prev) => ({ ...prev, shift: false }));
      } else if (event.key === "Alt") {
        setModifierState((prev) => ({ ...prev, alt: false }));
      } else if (event.key === "Control") {
        setModifierState((prev) => ({ ...prev, ctrl: false }));
      }

      setPressedKey(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("selectstart", (e) => e.preventDefault());
    document.addEventListener("select", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("selectstart", (e) => e.preventDefault());
      document.removeEventListener("select", (e) => e.preventDefault());
    };
  }, [findKeyForCharacterEnhanced]);

  // ===== RENDER =====

  // Loading state
  if (!currentLayout) {
    return (
      <div className={cn("border rounded-lg bg-muted-foreground/10 p-4")}>
        <div className="text-center text-muted-foreground">Loading keyboard layout...</div>
      </div>
    );
  }

  // Main keyboard render
  return (
    <div className={cn("border rounded-lg bg-muted-foreground/10 p-2")}>
      {/* Layout info */}
      <div className="mb-2 text-xs text-muted-foreground text-center">{currentLayout.metadata.displayName}</div>

      {/* Keyboard layout */}
      <div className={cn("flex flex-col gap-2")}>
        {currentLayout.layout.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex space-x-1"
            style={{
              justifyContent: row.properties?.alignment || "flex-start",
              gap: `${(row.properties?.spacing || 1) * 0.25}rem`,
            }}
          >
            {row.keys.map((key, keyIndex) => (
              <KeyButton
                key={`${rowIndex}-${keyIndex}`}
                label={getCurrentCharacter(key)}
                value={key.key}
                shiftKey={config.showShiftLabel ? getShiftCharacter(key) : ""}
                onClick={() => handleKeyPress(key)}
                pressedKey={pressedKey}
                className={cn(
                  getKeyWidthClass(key),
                  // Highlight active keys in practice mode
                  isKeyHighlighted(key) && "bg-primary text-primary-foreground",
                  // Special styling for modifier keys
                  key.type === "modifier" &&
                    modifierState[getModifierType(key) as keyof ModifierState] &&
                    "bg-primary text-primary-foreground"
                )}
                data-key-type={key.type}
                data-key-id={key.key}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Debug modifier state indicator */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-muted-foreground">
          Modifiers:{" "}
          {Object.entries(modifierState)
            .filter(([, active]) => active)
            .map(([modifier]) => modifier)
            .join(", ") || "none"}
        </div>
      )}
    </div>
  );
}
