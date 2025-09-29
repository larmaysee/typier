import { TypingAnalytics, AnalysisType } from "../entities/typing-analytics";

export interface IAnalyticsRepository {
  create(analytics: Omit<TypingAnalytics, 'id' | 'generatedAt'>): Promise<TypingAnalytics>;
  findById(id: string): Promise<TypingAnalytics | null>;
  findByUserId(userId: string): Promise<TypingAnalytics[]>;
  findByUserAndType(userId: string, type: AnalysisType): Promise<TypingAnalytics[]>;
  findBySessionId(sessionId: string): Promise<TypingAnalytics[]>;
  update(id: string, data: Partial<TypingAnalytics>): Promise<TypingAnalytics>;
  delete(id: string): Promise<void>;
  
  // Analytics queries
  getUserPerformanceTrend(userId: string, days: number): Promise<TypingAnalytics[]>;
  getLayoutPerformanceComparison(userId: string): Promise<TypingAnalytics[]>;
}