/**
 * Keyboard layout types and variants
 */
export enum LayoutType {
  STANDARD = "standard",
  PHONETIC = "phonetic", 
  UNICODE = "unicode",
  LEGACY = "legacy"
}

/**
 * Layout variants for different languages
 */
export enum LayoutVariant {
  // English layouts
  QWERTY_US = "qwerty-us",
  QWERTY_UK = "qwerty-uk", 
  QWERTY_INTERNATIONAL = "qwerty-international",
  DVORAK = "dvorak",
  COLEMAK = "colemak",
  
  // Lisu layouts
  SIL_BASIC = "sil-basic",
  SIL_STANDARD = "sil-standard",
  UNICODE_STANDARD = "unicode-standard",
  TRADITIONAL = "traditional",
  
  // Myanmar layouts
  MYANMAR3 = "myanmar3",
  ZAWGYI = "zawgyi",
  WININNWA = "wininnwa"
}

/**
 * Session status states
 */
export enum SessionStatus {
  IDLE = "idle",
  ACTIVE = "active", 
  PAUSED = "paused",
  COMPLETED = "completed",
  ABORTED = "aborted"
}

/**
 * Focus states for typing session
 */
export enum FocusState {
  FOCUSED = "focused",
  BLURRED = "blurred"
}