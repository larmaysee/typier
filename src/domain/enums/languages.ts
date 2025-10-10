export enum LanguageCode {
  EN = "en",
  MY = "my",
  LI = "li",
}

export enum SupportedLanguage {
  ENGLISH = "English",
  MYANMAR = "Myanmar",
  LISU = "Lisu",
}

export type LanguageDisplayName = {
  [key in LanguageCode]: string;
};

export const LANGUAGE_DISPLAY_NAMES: LanguageDisplayName = {
  [LanguageCode.EN]: "English",
  [LanguageCode.MY]: "Myanmar",
  [LanguageCode.LI]: "Lisu",
};
