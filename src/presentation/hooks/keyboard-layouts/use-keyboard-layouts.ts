"use client";

import { useState, useEffect } from "react";
import { useSiteConfig } from "@/components/site-config";

interface KeyboardLayout {
  id: string;
  name: string;
  displayName: string;
  language: string;
  isDefault: boolean;
}

// Mock keyboard layouts data - in a real implementation this would come from domain layer
const KEYBOARD_LAYOUTS: KeyboardLayout[] = [
  { id: "qwerty-us", name: "QWERTY US", displayName: "QWERTY (US)", language: "en", isDefault: true },
  { id: "qwerty-uk", name: "QWERTY UK", displayName: "QWERTY (UK)", language: "en", isDefault: false },
  { id: "dvorak", name: "Dvorak", displayName: "Dvorak", language: "en", isDefault: false },
  { id: "colemak", name: "Colemak", displayName: "Colemak", language: "en", isDefault: false },
  
  { id: "sil-basic", name: "SIL Basic", displayName: "SIL Basic", language: "li", isDefault: true },
  { id: "sil-standard", name: "SIL Standard", displayName: "SIL Standard", language: "li", isDefault: false },
  { id: "unicode-standard", name: "Unicode Standard", displayName: "Unicode Standard", language: "li", isDefault: false },
  { id: "traditional", name: "Traditional", displayName: "Traditional", language: "li", isDefault: false },
  
  { id: "myanmar3", name: "Myanmar3", displayName: "Myanmar3", language: "my", isDefault: true },
  { id: "zawgyi", name: "Zawgyi", displayName: "Zawgyi", language: "my", isDefault: false },
  { id: "unicode-standard-my", name: "Unicode Standard", displayName: "Unicode Standard", language: "my", isDefault: false },
  { id: "wininnwa", name: "WinInnwa", displayName: "WinInnwa", language: "my", isDefault: false },
];

export function useKeyboardLayouts() {
  const { config } = useSiteConfig();
  const [availableLayouts, setAvailableLayouts] = useState<KeyboardLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<KeyboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter layouts by current language and set active layout
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate async loading
    setTimeout(() => {
      const languageLayouts = KEYBOARD_LAYOUTS.filter(
        layout => layout.language === config.language.code
      );
      
      setAvailableLayouts(languageLayouts);
      
      // Set default active layout
      const defaultLayout = languageLayouts.find(layout => layout.isDefault) 
        || languageLayouts[0];
      
      setActiveLayout(defaultLayout || null);
      setIsLoading(false);
    }, 100);
    
  }, [config.language.code]);

  const switchLayout = (layoutId: string) => {
    const layout = availableLayouts.find(l => l.id === layoutId);
    if (layout) {
      setActiveLayout(layout);
      // TODO: In a real implementation, this would trigger a use case
      // to switch the layout and potentially preserve typing session
    }
  };

  const getLayoutPreview = (layoutId: string) => {
    // TODO: Return visual representation of the keyboard layout
    return null;
  };

  return {
    availableLayouts,
    activeLayout,
    isLoading,
    switchLayout,
    getLayoutPreview,
  };
}