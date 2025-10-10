// Collection IDs and schema definitions for Appwrite
export const COLLECTIONS = {
  USERS: "users",
  TYPING_TESTS: "typing_tests",
  LEADERBOARDS: "leaderboards",
  USER_SETTINGS: "user_settings",
  COMPETITIONS: "competitions",
  COMPETITION_ENTRIES: "competition_entries",
  KEYBOARD_LAYOUTS: "keyboard_layouts",
  USER_PREFERENCES: "user_preferences",
} as const;

// Appwrite document interfaces that match database schema
export interface AppwriteUserDocument {
  $id: string;
  username: string;
  email: string;
  total_tests: number;
  best_wpm: number;
  average_accuracy: number;
  favorite_language: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface AppwriteTypingTestDocument {
  $id: string;
  user_id: string;
  mode: string;
  difficulty: string;
  language: string;
  keyboard_layout_id: string;
  text_content: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  incorrect_words: number;
  total_words: number;
  duration: number;
  characters_typed: number;
  errors: number;
  consistency: number;
  finger_utilization: string; // JSON stringified
  competition_id?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface AppwriteUserPreferencesDocument {
  $id: string;
  user_id: string;
  default_language: string;
  keyboard_layouts: string; // JSON stringified Record<LanguageCode, string>
  theme: string;
  sound_enabled: boolean;
  visual_feedback: boolean;
  auto_complete_enabled: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface AppwriteCompetitionDocument {
  $id: string;
  title: string;
  description: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  text_content: string;
  language: string;
  allowed_layouts: string; // JSON stringified string[]
  is_active: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface AppwriteCompetitionEntryDocument {
  $id: string;
  competition_id: string;
  user_id: string;
  username: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  incorrect_words: number;
  total_words: number;
  duration: number;
  characters_typed: number;
  errors: number;
  consistency: number;
  finger_utilization: string; // JSON stringified
  submitted_at: string; // ISO date string
  $createdAt: string;
  $updatedAt: string;
}

export interface AppwriteKeyboardLayoutDocument {
  $id: string;
  name: string;
  display_name: string;
  language: string;
  variant: string;
  key_mappings: string; // JSON stringified KeyMapping[]
  metadata: string; // JSON stringified LayoutMetadata
  is_custom: boolean;
  created_by?: string;
  $createdAt: string;
  $updatedAt: string;
}
