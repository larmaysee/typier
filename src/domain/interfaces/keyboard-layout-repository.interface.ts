import { KeyboardLayout } from "../entities/keyboard-layout";
import { LanguageCode } from "../enums/language-code"; 
import { KeyboardLayoutVariant } from "../enums/keyboard-layout-variant";

export interface IKeyboardLayoutRepository {
  create(layout: Omit<KeyboardLayout, 'id' | 'createdAt' | 'updatedAt'>): Promise<KeyboardLayout>;
  findById(id: string): Promise<KeyboardLayout | null>;
  findByLanguage(language: LanguageCode): Promise<KeyboardLayout[]>;
  findByVariant(variant: KeyboardLayoutVariant): Promise<KeyboardLayout | null>;
  findCustomLayouts(userId: string): Promise<KeyboardLayout[]>;
  findPublicLayouts(): Promise<KeyboardLayout[]>;
  update(id: string, data: Partial<KeyboardLayout>): Promise<KeyboardLayout>;
  delete(id: string): Promise<void>;
  
  // Layout sharing
  exportLayout(id: string): Promise<string>; // JSON string
  importLayout(layoutData: string, userId: string): Promise<KeyboardLayout>;
}