"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Brain,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingPattern {
  type: "rhythm" | "error" | "speed" | "finger" | "fatigue";
  name: string;
  description: string;
  strength: "weak" | "moderate" | "strong";
  frequency: number;
  impact: "positive" | "negative" | "neutral";
}

interface Insight {
  category: "performance" | "behavior" | "potential" | "warning";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface Recommendation {
  pattern: string;
  type: "practice" | "technique" | "mindset" | "hardware";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  expectedImpact: string;
  timeToSeeResults: string;
  actionSteps: string[];
}

interface PatternComparison {
  metric: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  interpretation: string;
}

function PatternCard({ pattern }: { pattern: TypingPattern }) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive": return "text-green-600 dark:text-green-400";
      case "negative": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive": return CheckCircle2;
      case "negative": return AlertCircle;
      default: return Activity;
    }
  };

  const ImpactIcon = getImpactIcon(pattern.impact);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <ImpactIcon className={cn("w-4 h-4", getImpactColor(pattern.impact))} />
              {pattern.name}
            </CardTitle>
            <CardDescription className="mt-1">{pattern.description}</CardDescription>
          </div>
          <Badge variant={pattern.impact === "positive" ? "default" : pattern.impact === "negative" ? "destructive" : "outline"}>
            {pattern.strength}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frequency</span>
            <span className="font-medium">{Math.round(pattern.frequency * 100)}%</span>
          </div>
          <Progress value={pattern.frequency * 100} className="h-2" />
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs capitalize">{pattern.type}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance": return TrendingUp;
      case "behavior": return Activity;
      case "potential": return Lightbulb;
      case "warning": return AlertCircle;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "performance": return "text-blue-600 dark:text-blue-400";
      case "behavior": return "text-purple-600 dark:text-purple-400";
      case "potential": return "text-yellow-600 dark:text-yellow-400";
      case "warning": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const CategoryIcon = getCategoryIcon(insight.category);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <CategoryIcon className={cn("w-5 h-5", getCategoryColor(insight.category))} />
          <Badge variant="outline" className="capitalize">{insight.category}</Badge>
          <Badge variant="secondary" className="ml-auto">
            {Math.round(insight.confidence * 100)}% confidence
          </Badge>
        </div>
        <CardTitle className="text-base">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {insight.actionable && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Target className="w-3 h-3" />
            <span>Actionable insight</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getPriorityColor(recommendation.priority) as any}>
                {recommendation.priority} priority
              </Badge>
              <Badge variant="outline" className="capitalize">{recommendation.type}</Badge>
            </div>
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
            <CardDescription className="mt-1">{recommendation.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Expected Impact</p>
              <p className="font-medium">{recommendation.expectedImpact}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Time to Results</p>
              <p className="font-medium">{recommendation.timeToSeeResults}</p>
            </div>
          </div>

          {recommendation.actionSteps.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Action Steps:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {recommendation.actionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonCard({ comparison }: { comparison: PatternComparison }) {
  const isAboveAverage = comparison.userValue > comparison.averageValue;
  const TrendIcon = isAboveAverage ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {comparison.metric}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Your Value</p>
              <p className="text-2xl font-bold">{comparison.userValue.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-semibold text-muted-foreground">{comparison.averageValue.toFixed(1)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <TrendIcon className={cn("w-4 h-4", isAboveAverage ? "text-green-600" : "text-red-600")} />
              <span className={cn("text-sm font-medium", isAboveAverage ? "text-green-600" : "text-red-600")}>
                {comparison.interpretation}
              </span>
            </div>
            <Badge variant="outline">
              {comparison.percentile}th percentile
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<TypingPattern[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [comparisons, setComparisons] = useState<PatternComparison[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Use AnalyzeTypingPatternsUseCase from DI container
      // For now, show empty state
      setPatterns([]);
      setInsights([]);
      setRecommendations([]);
      setComparisons([]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Analyzing your typing patterns...</p>
      </div>
    );
  }

  if (patterns.length === 0 && insights.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete more typing sessions to unlock detailed analytics and personalized insights
          </p>
          <Button onClick={loadAnalytics}>Refresh Analytics</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Typing Analytics</h1>
        <p className="text-muted-foreground">
          Deep analysis of your typing patterns, insights, and personalized recommendations
        </p>
      </div>

      {/* Performance Comparisons */}
      {comparisons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Comparison
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison, idx) => (
              <ComparisonCard key={idx} comparison={comparison} />
            ))}
          </div>
        </div>
      )}

      {/* Typing Patterns */}
      {patterns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detected Patterns
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern, idx) => (
              <PatternCard key={idx} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Insights
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recommendations
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {recommendations.map((recommendation, idx) => (
              <RecommendationCard key={idx} recommendation={recommendation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
