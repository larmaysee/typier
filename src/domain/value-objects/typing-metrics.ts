/**
 * Domain value objects for typing metrics calculations
 */

export interface WPMData {
  readonly wordsPerMinute: number;
  readonly charactersTyped: number;
  readonly timeElapsed: number; // in seconds
  readonly errorCount: number;
}

export interface AccuracyData {
  readonly percentage: number;
  readonly correctCharacters: number;
  readonly totalCharacters: number;
  readonly errorRate: number;
}

export interface DurationData {
  readonly startTime: number;
  readonly endTime: number;
  readonly totalSeconds: number;
  readonly activeSeconds: number; // Excluding pauses
}

export class WPM {
  private constructor(
    public readonly value: number,
    public readonly charactersTyped: number,
    public readonly timeElapsed: number,
    public readonly errorCount: number
  ) {
    if (value < 0) throw new Error('WPM cannot be negative');
    if (charactersTyped < 0) throw new Error('Characters typed cannot be negative');
    if (timeElapsed < 0) throw new Error('Time elapsed cannot be negative');
    if (errorCount < 0) throw new Error('Error count cannot be negative');
  }

  static calculate(charactersTyped: number, timeElapsed: number, errorCount: number = 0): WPM {
    if (timeElapsed === 0) {
      return new WPM(0, charactersTyped, timeElapsed, errorCount);
    }

    // Standard WPM calculation: (characters / 5) / (time in minutes)
    const words = charactersTyped / 5;
    const minutes = timeElapsed / 60;
    const grossWPM = words / minutes;
    
    // Net WPM = Gross WPM - (errors / time in minutes)
    const netWPM = Math.max(0, grossWPM - (errorCount / minutes));
    
    return new WPM(Math.round(netWPM), charactersTyped, timeElapsed, errorCount);
  }

  static fromData(data: WPMData): WPM {
    return new WPM(data.wordsPerMinute, data.charactersTyped, data.timeElapsed, data.errorCount);
  }

  static zero(): WPM {
    return new WPM(0, 0, 0, 0);
  }

  isValid(): boolean {
    return this.timeElapsed > 0 && this.charactersTyped >= 0;
  }

  equals(other: WPM): boolean {
    return this.value === other.value &&
           this.charactersTyped === other.charactersTyped &&
           this.timeElapsed === other.timeElapsed &&
           this.errorCount === other.errorCount;
  }
}

export class Accuracy {
  private constructor(
    public readonly percentage: number,
    public readonly correctCharacters: number,
    public readonly totalCharacters: number
  ) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Accuracy percentage must be between 0 and 100');
    }
    if (correctCharacters < 0) throw new Error('Correct characters cannot be negative');
    if (totalCharacters < 0) throw new Error('Total characters cannot be negative');
    if (correctCharacters > totalCharacters) {
      throw new Error('Correct characters cannot exceed total characters');
    }
  }

  static calculate(correctCharacters: number, totalCharacters: number): Accuracy {
    if (totalCharacters === 0) {
      return new Accuracy(100, 0, 0);
    }

    const percentage = (correctCharacters / totalCharacters) * 100;
    return new Accuracy(Math.round(percentage * 100) / 100, correctCharacters, totalCharacters);
  }

  static fromData(data: AccuracyData): Accuracy {
    return new Accuracy(data.percentage, data.correctCharacters, data.totalCharacters);
  }

  static perfect(): Accuracy {
    return new Accuracy(100, 0, 0);
  }

  get errorCount(): number {
    return this.totalCharacters - this.correctCharacters;
  }

  get errorRate(): number {
    if (this.totalCharacters === 0) return 0;
    return (this.errorCount / this.totalCharacters) * 100;
  }

  isValid(): boolean {
    return this.percentage >= 0 && this.percentage <= 100;
  }

  equals(other: Accuracy): boolean {
    return this.percentage === other.percentage &&
           this.correctCharacters === other.correctCharacters &&
           this.totalCharacters === other.totalCharacters;
  }
}

export class Duration {
  private constructor(
    public readonly totalSeconds: number,
    public readonly activeSeconds: number,
    public readonly startTime: number,
    public readonly endTime: number
  ) {
    if (totalSeconds < 0) throw new Error('Total seconds cannot be negative');
    if (activeSeconds < 0) throw new Error('Active seconds cannot be negative');
    if (activeSeconds > totalSeconds) {
      throw new Error('Active seconds cannot exceed total seconds');
    }
    if (startTime > endTime) throw new Error('Start time cannot be after end time');
  }

  static fromTimespan(startTime: number, endTime: number, pausedTime: number = 0): Duration {
    const total = (endTime - startTime) / 1000; // Convert to seconds
    const active = Math.max(0, total - pausedTime);
    
    return new Duration(total, active, startTime, endTime);
  }

  static fromData(data: DurationData): Duration {
    return new Duration(data.totalSeconds, data.activeSeconds, data.startTime, data.endTime);
  }

  static zero(): Duration {
    const now = Date.now();
    return new Duration(0, 0, now, now);
  }

  get pausedSeconds(): number {
    return this.totalSeconds - this.activeSeconds;
  }

  get minutes(): number {
    return this.totalSeconds / 60;
  }

  get activeMinutes(): number {
    return this.activeSeconds / 60;
  }

  isValid(): boolean {
    return this.totalSeconds >= 0 && 
           this.activeSeconds >= 0 && 
           this.activeSeconds <= this.totalSeconds;
  }

  equals(other: Duration): boolean {
    return this.totalSeconds === other.totalSeconds &&
           this.activeSeconds === other.activeSeconds &&
           this.startTime === other.startTime &&
           this.endTime === other.endTime;
  }
}