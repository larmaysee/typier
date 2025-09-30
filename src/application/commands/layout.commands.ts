import { LayoutType } from "@/domain/enums/keyboard-layouts";
import { LanguageCode } from "@/enums/site-config";

export interface SwitchLayoutCommand {
  sessionId: string;
  layoutId: string;
  userId?: string;
}

export interface CreateCustomLayoutCommand {
  userId: string;
  name: string;
  displayName: string;
  language: LanguageCode;
  layoutType: LayoutType;
  baseLayoutId?: string;
  keyMappings: Array<{
    key: string;
    character: string;
    shiftCharacter?: string;
    altCharacter?: string;
  }>;
  metadata: {
    description: string;
    author: string;
  };
}

export interface SetPreferredLayoutCommand {
  userId: string;
  language: LanguageCode;
  layoutId: string;
}
