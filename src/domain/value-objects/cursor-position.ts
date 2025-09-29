/**
 * Domain value objects for cursor positioning and focus management
 */

export interface CursorPosition {
  readonly characterIndex: number;
  readonly wordIndex: number;
  readonly lineNumber: number;
  readonly columnNumber: number;
}

export interface FocusState {
  readonly isFocused: boolean;
  readonly hasSelection: boolean;
  readonly selectionStart?: number;
  readonly selectionEnd?: number;
  readonly lastFocusTime: number;
}

export class CursorPositionValue {
  private constructor(
    public readonly characterIndex: number,
    public readonly wordIndex: number,
    public readonly lineNumber: number,
    public readonly columnNumber: number
  ) {
    if (characterIndex < 0) throw new Error('Character index must be non-negative');
    if (wordIndex < 0) throw new Error('Word index must be non-negative');
    if (lineNumber < 0) throw new Error('Line number must be non-negative');
    if (columnNumber < 0) throw new Error('Column number must be non-negative');
  }

  static create(data: CursorPosition): CursorPositionValue {
    return new CursorPositionValue(
      data.characterIndex,
      data.wordIndex,
      data.lineNumber,
      data.columnNumber
    );
  }

  static zero(): CursorPositionValue {
    return new CursorPositionValue(0, 0, 0, 0);
  }

  advance(): CursorPositionValue {
    return new CursorPositionValue(
      this.characterIndex + 1,
      this.wordIndex,
      this.lineNumber,
      this.columnNumber + 1
    );
  }

  nextWord(): CursorPositionValue {
    return new CursorPositionValue(
      this.characterIndex,
      this.wordIndex + 1,
      this.lineNumber,
      0 // Reset column for new word
    );
  }

  equals(other: CursorPositionValue): boolean {
    return this.characterIndex === other.characterIndex &&
           this.wordIndex === other.wordIndex &&
           this.lineNumber === other.lineNumber &&
           this.columnNumber === other.columnNumber;
  }
}

export class FocusStateValue {
  private constructor(
    public readonly isFocused: boolean,
    public readonly hasSelection: boolean,
    public readonly selectionStart: number | undefined,
    public readonly selectionEnd: number | undefined,
    public readonly lastFocusTime: number
  ) {}

  static create(data: FocusState): FocusStateValue {
    return new FocusStateValue(
      data.isFocused,
      data.hasSelection,
      data.selectionStart,
      data.selectionEnd,
      data.lastFocusTime
    );
  }

  static focused(): FocusStateValue {
    return new FocusStateValue(true, false, undefined, undefined, Date.now());
  }

  static unfocused(): FocusStateValue {
    return new FocusStateValue(false, false, undefined, undefined, Date.now());
  }

  withSelection(start: number, end: number): FocusStateValue {
    return new FocusStateValue(
      this.isFocused,
      true,
      start,
      end,
      this.lastFocusTime
    );
  }

  clearSelection(): FocusStateValue {
    return new FocusStateValue(
      this.isFocused,
      false,
      undefined,
      undefined,
      this.lastFocusTime
    );
  }
}