/**
 * Mock implementation of IAnalyticsService for development and testing
 */

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface IAnalyticsService {
  track(eventName: string, properties?: Record<string, unknown>): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
  page(pageName: string, properties?: Record<string, unknown>): Promise<void>;
  getEvents(userId?: string, limit?: number): Promise<AnalyticsEvent[]>;
}

export class MockAnalyticsService implements IAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private currentUserId: string | null = null;

  async track(
    eventName: string,
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
      userId: this.currentUserId || undefined,
      sessionId: this.generateSessionId(),
    };

    this.events.push(event);

    // Keep only last 1000 events to prevent memory bloat
    if (this.events.length > 1000) {
      this.events.splice(0, this.events.length - 1000);
    }

    console.log(`[Analytics] Event tracked: ${eventName}`, properties);
  }

  async identify(
    userId: string,
    traits: Record<string, unknown> = {}
  ): Promise<void> {
    this.currentUserId = userId;

    await this.track("user_identified", {
      userId,
      traits,
    });
  }

  async page(
    pageName: string,
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    await this.track("page_view", {
      page: pageName,
      ...properties,
    });
  }

  async getEvents(userId?: string, limit = 100): Promise<AnalyticsEvent[]> {
    let filteredEvents = this.events;

    if (userId) {
      filteredEvents = this.events.filter((event) => event.userId === userId);
    }

    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods for common typing events
  async trackTypingTestStarted(
    language: string,
    mode: string,
    difficulty: string
  ): Promise<void> {
    await this.track("typing_test_started", {
      language,
      mode,
      difficulty,
    });
  }

  async trackTypingTestCompleted(
    language: string,
    mode: string,
    wpm: number,
    accuracy: number,
    duration: number
  ): Promise<void> {
    await this.track("typing_test_completed", {
      language,
      mode,
      wpm,
      accuracy,
      duration,
    });
  }

  async trackLayoutChanged(
    fromLayout: string,
    toLayout: string,
    language: string
  ): Promise<void> {
    await this.track("layout_changed", {
      fromLayout,
      toLayout,
      language,
    });
  }
}
