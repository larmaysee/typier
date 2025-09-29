export interface TypingAnalytics {
  id: string;
  userId: string;
  sessionId: string;
  language: string;
  layoutVariant: string;
  analysisType: AnalysisType;
  data: AnalyticsData;
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

export enum AnalysisType {
  TYPING_PATTERNS = "typing-patterns",
  LAYOUT_PERFORMANCE = "layout-performance", 
  SESSION_COMPARISON = "session-comparison",
  IMPROVEMENT_PLAN = "improvement-plan",
  LAYOUT_SWITCHING = "layout-switching"
}

export interface AnalyticsData {
  averageWpm: number;
  peakWpm: number;
  accuracy: number;
  keystrokePattern: KeystrokeData[];
  problemAreas: ProblemArea[];
  strengths: string[];
  weaknesses: string[];
  progressTrend: ProgressPoint[];
}

export interface KeystrokeData {
  key: string;
  frequency: number;
  averageTime: number;
  errorRate: number;
  finger: string;
}

export interface ProblemArea {
  category: string;
  keys: string[];
  errorRate: number;
  suggestion: string;
}

export interface ProgressPoint {
  date: Date;
  metric: string;
  value: number;
}