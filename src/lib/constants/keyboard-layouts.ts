/**
 * Language keyboard layout definitions for settings
 */

import { LANGUAGE_DISPLAY_NAMES, LanguageCode } from "@/domain";

export interface LanguageLayoutOption {
  code: LanguageCode;
  name: string;
  description: string;
  flag?: string;
  isSupported: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageLayoutOption[] = [
  {
    code: LanguageCode.EN,
    name: LANGUAGE_DISPLAY_NAMES[LanguageCode.EN],
    description: "English language with QWERTY, Dvorak, and Colemak layouts",
    flag: "🇺🇸",
    isSupported: true,
  },
  {
    code: LanguageCode.LI,
    name: LANGUAGE_DISPLAY_NAMES[LanguageCode.LI],
    description: "Lisu language with SIL Basic, Standard, and Unicode layouts",
    flag: "🏔️",
    isSupported: true,
  },
  {
    code: LanguageCode.MY,
    name: LANGUAGE_DISPLAY_NAMES[LanguageCode.MY],
    description: "Myanmar language with Myanmar3, Zawgyi, and Unicode layouts",
    flag: "🇲🇲",
    isSupported: true,
  },
];

// For backward compatibility with existing code
export const kbLayouts = SUPPORTED_LANGUAGES.map((lang) => ({
  code: lang.code,
  name: lang.name,
}));

export default kbLayouts;
