import { LanguageCode } from "@/enums/site-config";
import { KeyboardLayout } from "../entities";

export interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(userId: string, language: LanguageCode): Promise<string | null>;
  setUserPreferredLayout(userId: string, language: LanguageCode, layoutId: string): Promise<void>;
  deleteCustomLayout(layoutId: string, userId: string): Promise<void>;
  getAllCustomLayouts(userId: string): Promise<KeyboardLayout[]>;
}