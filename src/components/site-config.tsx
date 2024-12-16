"use client";
import { KeyboardMode, LanguageCode, ThemeMode } from "@/enums/site-config";
import layouts from "@/layouts/kb-layouts";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface SiteConfig {
  theme: ThemeMode;
  language: {
    code: LanguageCode;
    name: string;
  };
  mode: KeyboardMode;
  showShiftLabel?: boolean;
}

interface SiteConfigProviderProps {
  children: ReactNode;
}

const defaultConfig: SiteConfig = {
  theme: ThemeMode.LIGHT,
  language: {
    code: LanguageCode.LI,
    name: layouts.find((layout) => layout.code === LanguageCode.LI)?.name || "",
  },
  mode: KeyboardMode.DEFAULT,
  showShiftLabel: false,
};

const SiteConfigContext = createContext<{
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}>({
  config: defaultConfig,
  setConfig: () => {},
});

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({
  children,
}) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);

  return (
    <SiteConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);
