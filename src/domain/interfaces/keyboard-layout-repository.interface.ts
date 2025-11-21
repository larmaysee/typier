import { KeyboardLayout } from "../entities/keyboard-layout";
import { LayoutVariant } from "../enums";
import { LanguageCode } from "../enums/languages";

export interface IKeyboardLayoutRepository {
  create(layout: Omit<KeyboardLayout, "id" | "createdAt" | "updatedAt">): Promise<KeyboardLayout>;
  findById(id: string): Promise<KeyboardLayout | null>;
  findByLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;
  findByVariant(variant: LayoutVariant): Promise<KeyboardLayout | null>;
  findCustomLayouts(userId: string): Promise<KeyboardLayout[]>;
  findPublicLayouts(): Promise<KeyboardLayout[]>;
  update(id: string, data: Partial<KeyboardLayout>): Promise<KeyboardLayout>;
  delete(id: string): Promise<void>;
}
