/**
 * Domain enums for keyboard layout system
 */

export enum LayoutVariant {
  // English variants
  US = "us",
  UK = "uk",
  INTERNATIONAL = "international",

  // Lisu variants
  SIL_BASIC = "sil_basic",
  SIL_STANDARD = "sil_standard",
  UNICODE_STANDARD = "unicode_standard",
  TRADITIONAL = "traditional",

  // Myanmar variants
  MYANMAR3 = "myanmar3",
  ZAWGYI = "zawgyi",
  UNICODE_MYANMAR = "unicode_myanmar",
  WININNWA = "wininnwa",
}

export enum FingerAssignment {
  LEFT_PINKY = "left_pinky",
  LEFT_RING = "left_ring",
  LEFT_MIDDLE = "left_middle",
  LEFT_INDEX = "left_index",
  LEFT_THUMB = "left_thumb",
  RIGHT_THUMB = "right_thumb",
  RIGHT_INDEX = "right_index",
  RIGHT_MIDDLE = "right_middle",
  RIGHT_RING = "right_ring",
  RIGHT_PINKY = "right_pinky",
}
