/**
 * Helper utilities for creating keyboard layouts
 */

import { KeyPosition, KeyMapping } from "@/domain/entities/keyboard-layout";
import { FingerAssignment } from "@/domain/enums/keyboard-layouts";

/**
 * Standard QWERTY key position mapping
 * Maps physical keys to their row, column, finger assignment, and hand
 */
const STANDARD_KEY_POSITIONS: Record<string, KeyPosition> = {
  // Number row (row 0)
  '`': { row: 0, column: 0, finger: FingerAssignment.LEFT_PINKY, hand: 'left' },
  '1': { row: 0, column: 1, finger: FingerAssignment.LEFT_PINKY, hand: 'left' },
  '2': { row: 0, column: 2, finger: FingerAssignment.LEFT_RING, hand: 'left' },
  '3': { row: 0, column: 3, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' },
  '4': { row: 0, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  '5': { row: 0, column: 5, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  '6': { row: 0, column: 6, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  '7': { row: 0, column: 7, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  '8': { row: 0, column: 8, finger: FingerAssignment.RIGHT_MIDDLE, hand: 'right' },
  '9': { row: 0, column: 9, finger: FingerAssignment.RIGHT_RING, hand: 'right' },
  '0': { row: 0, column: 10, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  '-': { row: 0, column: 11, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  '=': { row: 0, column: 12, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },

  // Top row (row 1) - QWERTY
  'q': { row: 1, column: 0, finger: FingerAssignment.LEFT_PINKY, hand: 'left' },
  'w': { row: 1, column: 1, finger: FingerAssignment.LEFT_RING, hand: 'left' },
  'e': { row: 1, column: 2, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' },
  'r': { row: 1, column: 3, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  't': { row: 1, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  'y': { row: 1, column: 5, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  'u': { row: 1, column: 6, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  'i': { row: 1, column: 7, finger: FingerAssignment.RIGHT_MIDDLE, hand: 'right' },
  'o': { row: 1, column: 8, finger: FingerAssignment.RIGHT_RING, hand: 'right' },
  'p': { row: 1, column: 9, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  '[': { row: 1, column: 10, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  ']': { row: 1, column: 11, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  '\\': { row: 1, column: 12, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },

  // Home row (row 2) - ASDF
  'a': { row: 2, column: 0, finger: FingerAssignment.LEFT_PINKY, hand: 'left' },
  's': { row: 2, column: 1, finger: FingerAssignment.LEFT_RING, hand: 'left' },
  'd': { row: 2, column: 2, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' },
  'f': { row: 2, column: 3, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  'g': { row: 2, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  'h': { row: 2, column: 5, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  'j': { row: 2, column: 6, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  'k': { row: 2, column: 7, finger: FingerAssignment.RIGHT_MIDDLE, hand: 'right' },
  'l': { row: 2, column: 8, finger: FingerAssignment.RIGHT_RING, hand: 'right' },
  ';': { row: 2, column: 9, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },
  "'": { row: 2, column: 10, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },

  // Bottom row (row 3) - ZXCV
  'z': { row: 3, column: 0, finger: FingerAssignment.LEFT_PINKY, hand: 'left' },
  'x': { row: 3, column: 1, finger: FingerAssignment.LEFT_RING, hand: 'left' },
  'c': { row: 3, column: 2, finger: FingerAssignment.LEFT_MIDDLE, hand: 'left' },
  'v': { row: 3, column: 3, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  'b': { row: 3, column: 4, finger: FingerAssignment.LEFT_INDEX, hand: 'left' },
  'n': { row: 3, column: 5, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  'm': { row: 3, column: 6, finger: FingerAssignment.RIGHT_INDEX, hand: 'right' },
  ',': { row: 3, column: 7, finger: FingerAssignment.RIGHT_MIDDLE, hand: 'right' },
  '.': { row: 3, column: 8, finger: FingerAssignment.RIGHT_RING, hand: 'right' },
  '/': { row: 3, column: 9, finger: FingerAssignment.RIGHT_PINKY, hand: 'right' },

  // Space row (row 4)
  ' ': { row: 4, column: 0, finger: FingerAssignment.LEFT_THUMB, hand: 'left' },
};

/**
 * Get standard position for a key
 */
export function getKeyPosition(key: string): KeyPosition {
  const position = STANDARD_KEY_POSITIONS[key.toLowerCase()];
  if (!position) {
    // Default position for unknown keys
    return {
      row: 4,
      column: 0,
      finger: FingerAssignment.LEFT_THUMB,
      hand: 'left'
    };
  }
  return position;
}

/**
 * Create a key mapping with position
 */
export function createKeyMapping(
  key: string,
  character: string,
  shiftCharacter?: string,
  altCharacter?: string,
  ctrlCharacter?: string
): KeyMapping {
  return {
    key: key.toLowerCase(),
    character,
    shiftCharacter,
    altCharacter,
    ctrlCharacter,
    position: getKeyPosition(key)
  };
}

/**
 * Create default metadata for system layouts
 */
export function createSystemLayoutMetadata(
  description: string,
  author: string,
  difficulty: import("@/domain/enums/typing-mode").DifficultyLevel = 1 as any
) {
  const now = Date.now();
  return {
    description,
    author,
    version: '1.0.0',
    compatibility: ['web', 'desktop', 'mobile'],
    tags: ['standard', 'system'],
    difficulty,
    popularity: 100,
    dateCreated: now,
    lastModified: now,
    optimizedFor: ['speed', 'accuracy']
  };
}
