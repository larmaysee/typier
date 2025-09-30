/**
 * Mock implementation of ISessionRepository for development and testing
 */

import { ISessionRepository } from "../../../domain/interfaces/repositories";
import { TypingSession } from "../../../domain/entities/typing";

export class MockSessionRepository implements ISessionRepository {
  private sessions: Map<string, TypingSession> = new Map();

  async save(session: TypingSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<TypingSession | null> {
    return this.sessions.get(id) || null;
  }

  async update(session: TypingSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async findActiveByUser(userId: string): Promise<TypingSession | null> {
    for (const session of this.sessions.values()) {
      if (session.test.userId === userId && session.isActive()) {
        return session;
      }
    }
    return null;
  }
}