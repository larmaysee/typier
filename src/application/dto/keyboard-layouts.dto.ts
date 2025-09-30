import { KeyboardLayout } from "@/domain/entities/keyboard-layout";
import { LanguageCode } from "@/enums/site-config";

export interface LayoutsResponseDTO {
  layouts: Array<{
    id: string;
    name: string;
    displayName: string;
    language: LanguageCode;
    layoutType: string;
    variant: string;
    isCustom: boolean;
    popularity: number;
    isRecommended: boolean;
    userTestsCount: number;
    userAverageWpm?: number;
    userAverageAccuracy?: number;
  }>;
  preferredLayoutId: string | null;
  defaultLayoutId: string;
  customLayoutsCount: number;
}

export interface LayoutCompatibilityResponseDTO {
  isCompatible: boolean;
  compatibilityScore: number;
  issues: Array<{
    type: "error" | "warning" | "info";
    message: string;
    affectedKeys?: string[];
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
}

export interface CustomLayoutCreationResponseDTO {
  success: boolean;
  layoutId?: string;
  layout?: KeyboardLayout;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  warnings?: string[];
}
