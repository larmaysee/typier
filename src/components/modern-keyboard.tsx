/**
 * Modern Keyboard component using the Layout Manager Service
 */

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KeyboardLayout, LanguageCode } from "@/domain";
import { ILayoutManagerService } from "@/domain/interfaces/keyboard-layout.interface";
import { KeyDefinition, LanguageLayoutDefinition, ModifierState } from "@/domain/interfaces/language-layout-definition";
import { keyboardLayoutRegistry } from "@/infrastructure/services/keyboard-layout-registry";
import { cn, isModifier, keyname } from "@/lib/utils";
import { useDependencyInjection } from "@/presentation/hooks/core/use-dependency-injection";
import { Info } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import KeyButton from "./key-button";
import { usePracticeMode } from "./pratice-mode";
import { useSiteConfig } from "./site-config";

export default function ModernKeyboard() {
  const { config } = useSiteConfig();
  const { activeChar, composekey } = usePracticeMode();
  const { resolve, serviceTokens } = useDependencyInjection();

  // ===== STATE =====
  const [currentLayout, setCurrentLayout] = useState<LanguageLayoutDefinition | null>(null);
  const [activeKeyboardLayout, setActiveKeyboardLayout] = useState<KeyboardLayout | null>(null);
  const [modifierState, setModifierState] = useState<ModifierState>({
    shift: false,
    alt: false,
    ctrl: false,
    capsLock: false,
  });
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [currentHighlightKey, setCurrentHighlightKey] = useState<string | null>(null);
  const [showFingerGuide, setShowFingerGuide] = useState(false);

  // Home row keys for each language layout
  const getHomeRowKeys = useCallback(() => {
    const language = config.language.code;

    // Define home row positions for different layouts
    const homeRows: Record<string, string[]> = {
      en: ["a", "s", "d", "f", "j", "k", "l", ";"], // English QWERTY
      li: ["ꓮ", "ꓢ", "ꓓ", "ꓝ", "ꓙ", "ꓗ", "ꓡ", "ꓼ"], // Lisu uses similar layout
      my: ["ေ", "ျ", "ိ", "်", "ြ", "ု", "ူ", "း"], // Myanmar uses similar layout
    };

    return homeRows[language] || homeRows["en"];
  }, [config.language.code]);

  // Get finger position styling for home row keys only
  const getFingerPositionStyle = useCallback(
    (key: KeyDefinition): string => {
      if (!showFingerGuide) return "";

      const homeRowKeys = getHomeRowKeys();
      const keyChar = key.char?.toLowerCase();

      // Check if this key is in the home row
      if (!homeRowKeys.includes(keyChar)) return "";

      // Color mapping for home row fingers
      const colorMap: Record<string, string> = {
        // English QWERTY
        a: "bg-pink-500/30 border-2 border-pink-500", // Left pinky
        s: "bg-purple-500/30 border-2 border-purple-500", // Left ring
        d: "bg-blue-500/30 border-2 border-blue-500", // Left middle
        f: "bg-green-500/30 border-2 border-green-500", // Left index
        j: "bg-green-500/30 border-2 border-green-500", // Right index
        k: "bg-blue-500/30 border-2 border-blue-500", // Right middle
        l: "bg-purple-500/30 border-2 border-purple-500", // Right ring
        ";": "bg-pink-500/30 border-2 border-pink-500", // Right pinky

        // Lisu
        ꓮ: "bg-pink-500/30 border-2 border-pink-500", // Left pinky
        ꓢ: "bg-purple-500/30 border-2 border-purple-500", // Left ring
        ꓓ: "bg-blue-500/30 border-2 border-blue-500", // Left middle
        ꓝ: "bg-green-500/30 border-2 border-green-500", // Left index
        ꓙ: "bg-green-500/30 border-2 border-green-500", // Right index
        ꓗ: "bg-blue-500/30 border-2 border-blue-500", // Right middle
        ꓡ: "bg-purple-500/30 border-2 border-purple-500", // Right ring
        ꓼ: "bg-pink-500/30 border-2 border-pink-500", // Right pinky

        // Myanmar
        "ေ": "bg-pink-500/30 border-2 border-pink-500", // Left pinky
        "ျ": "bg-purple-500/30 border-2 border-purple-500", // Left ring
        "ိ": "bg-blue-500/30 border-2 border-blue-500", // Left middle
        "်": "bg-green-500/30 border-2 border-green-500", // Left index
        "ြ": "bg-green-500/30 border-2 border-green-500", // Right index
        "ု": "bg-blue-500/30 border-2 border-blue-500", // Right middle
        "ူ": "bg-purple-500/30 border-2 border-purple-500", // Right ring
        "း": "bg-pink-500/30 border-2 border-pink-500", // Right pinky
      };

      return colorMap[keyChar] || "";
    },
    [showFingerGuide, getHomeRowKeys]
  );

  // ===== CHARACTER MAPPING UTILITIES =====

  // Find key for a character using Layout Manager Service
  const findKeyForCharacterFromLayoutService = useCallback(
    (character: string): string | null => {
      if (!activeKeyboardLayout) return null;

      for (const mapping of activeKeyboardLayout.keyMappings) {
        if (
          mapping.character === character ||
          mapping.shiftCharacter === character ||
          mapping.altCharacter === character ||
          mapping.ctrlCharacter === character
        ) {
          return mapping.key;
        }
      }
      return null;
    },
    [activeKeyboardLayout]
  );

  // Basic character finder for layout keys (legacy system for fallback)
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

  // Enhanced character finder with Layout Manager Service support
  const findKeyForCharacterEnhanced = useCallback(
    (character: string): KeyDefinition | null => {
      if (!currentLayout) return null;

      // First, try to use the Layout Manager Service for accurate mapping
      const keyFromService = findKeyForCharacterFromLayoutService(character);
      if (keyFromService) {
        // Find the corresponding key definition in the visual layout
        for (const row of currentLayout.layout.rows) {
          for (const key of row.keys) {
            if (key.key === keyFromService) {
              return key;
            }
          }
        }
      }

      // Fallback to direct character match
      const result = findKeyForCharacter(character);
      if (result) return result;

      return null;
    },
    [currentLayout, findKeyForCharacter, findKeyForCharacterFromLayoutService]
  );

  // ===== LAYOUT LOADING =====

  // Load both visual layout and keyboard layout service
  useEffect(() => {
    const loadLayouts = async () => {
      // Load visual layout from registry
      await keyboardLayoutRegistry.ensureInitialized();
      const layout = keyboardLayoutRegistry.getDefaultLayoutForLanguage(config.language.code as LanguageCode);

      if (layout) {
        setCurrentLayout(layout);
        console.log(`Loaded visual layout: ${layout.metadata.name} for ${layout.language}`);
      } else {
        console.warn(`No visual layout found for language: ${config.language.code}`);
      }

      // Load keyboard layout from Layout Manager Service
      try {
        const layoutManager = resolve<ILayoutManagerService>(serviceTokens.LAYOUT_MANAGER_SERVICE);
        const layouts = await layoutManager.getLayoutsForLanguage(config.language.code as LanguageCode);

        if (layouts.length > 0) {
          // Use the first available layout (or find SIL Basic for Lisu)
          const lisuLayout = layouts.find((l) => l.id.includes("sil-basic")) || layouts[0];
          setActiveKeyboardLayout(lisuLayout);
          console.log(`Loaded keyboard layout: ${lisuLayout.name} (${lisuLayout.id})`);
        } else {
          console.warn(`No keyboard layouts found for language: ${config.language.code}`);
        }
      } catch (error) {
        console.error("Failed to load keyboard layout from service:", error);
      }
    };

    loadLayouts();
  }, [config.language.code, resolve, serviceTokens]);

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
    setTimeout(() => setPressedKey(null), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== EFFECTS =====

  // ===== EFFECTS =====

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
    <div className={cn("border border-dashed rounded-2xl bg-muted/10 p-4 pt-2")}>
      {/* Layout info with help icon */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">{currentLayout.metadata.displayName}</span>

        {/* Finger Guide Toggle */}
        <Badge
          variant={showFingerGuide ? "default" : "outline"}
          className="cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => setShowFingerGuide(!showFingerGuide)}
        >
          <span className="text-xs">👆 Finger Guide</span>
        </Badge>

        <Dialog>
          <DialogTrigger asChild>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
              <Info className="h-3 w-3" />
            </Badge>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Keyboard Layout Guide</DialogTitle>
              <DialogDescription>
                Understanding keyboard keys and modifiers for {currentLayout.metadata.displayName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Key Types Section */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Key Types</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      Character
                    </Badge>
                    <p className="text-sm text-muted-foreground">Regular typing keys that produce characters</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      Modifier
                    </Badge>
                    <p className="text-sm text-muted-foreground">Keys like Shift, Alt, Ctrl that modify other keys</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      Space
                    </Badge>
                    <p className="text-sm text-muted-foreground">Spacebar for adding spaces between words</p>
                  </div>
                </div>
              </div>

              {/* Modifier Keys Section */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Modifier Keys</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5">Shift ⇧</Badge>
                    <p className="text-sm text-muted-foreground">
                      Hold to type uppercase letters or access alternate characters shown at the top of keys
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5">Alt</Badge>
                    <p className="text-sm text-muted-foreground">
                      Hold to access special characters and language-specific symbols
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5">Ctrl</Badge>
                    <p className="text-sm text-muted-foreground">
                      Hold to access control characters or additional special symbols
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5">Caps Lock ⇪</Badge>
                    <p className="text-sm text-muted-foreground">
                      Toggle to lock uppercase mode - press once to enable, press again to disable
                    </p>
                  </div>
                </div>
              </div>

              {/* Practice Mode Section */}
              {config.practiceMode && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Practice Mode</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="mt-0.5 bg-primary">
                        Highlighted
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Keys highlighted in blue show which key to press next. Required modifier keys are also
                        highlighted.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts Section */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Typing Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Position your fingers on the home row for optimal typing speed</li>
                  <li>Use the correct finger for each key as shown in practice mode</li>
                  <li>Keep your wrists elevated and fingers curved</li>
                  <li>Look at the screen, not your keyboard, to improve typing accuracy</li>
                  <li>Practice regularly to build muscle memory</li>
                </ul>
              </div>

              {/* Hand Position Guide */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Proper Hand Position</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Place your fingers on the home row keys and use the correct finger for each key. Enable &quot;Finger
                  Guide&quot; mode to see color-coded home row keys.
                </p>
                <div className="space-y-3">
                  {/* Home Row Keys Description */}
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="font-medium mb-2">Home Row Position:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <strong>Left Hand:</strong> A (pinky), S (ring), D (middle), F (index)
                      </div>
                      <div>
                        <strong>Right Hand:</strong> J (index), K (middle), L (ring), ; (pinky)
                      </div>
                    </div>
                  </div>

                  {/* Finger Color Legend - Home Row Only */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-pink-500/30 border-2 border-pink-500"></div>
                      <span className="text-muted-foreground">Pinky (A, ;)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500/30 border-2 border-purple-500"></div>
                      <span className="text-muted-foreground">Ring (S, L)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500/30 border-2 border-blue-500"></div>
                      <span className="text-muted-foreground">Middle (D, K)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500/30 border-2 border-green-500"></div>
                      <span className="text-muted-foreground">Index (F, J)</span>
                    </div>
                  </div>

                  {/* Hand Position Image */}
                  <div className="relative w-full aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                    <Image
                      src="/images/hand-position.png"
                      alt="Proper hand position on keyboard"
                      fill
                      className="object-contain"
                      priority={false}
                    />
                  </div>
                </div>
              </div>

              {/* Language-Specific Info */}
              {activeKeyboardLayout && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Layout Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Layout:</span>
                      <span className="ml-2 font-medium">{activeKeyboardLayout.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Language:</span>
                      <span className="ml-2 font-medium">{activeKeyboardLayout.language.toUpperCase()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Total Keys:</span>
                      <span className="ml-2 font-medium">{activeKeyboardLayout.keyMappings.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  // Finger position guide colors
                  getFingerPositionStyle(key),
                  // Highlight active keys in practice mode
                  isKeyHighlighted(key) && "bg-primary text-primary-foreground border-primary",
                  // Special styling for modifier keys
                  key.type === "modifier" &&
                    modifierState[getModifierType(key) as keyof ModifierState] &&
                    "bg-primary text-primary-foreground border-primary"
                )}
                data-key-type={key.type}
                data-key-id={key.key}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
