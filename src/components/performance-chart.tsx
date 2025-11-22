"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PerformanceChartProps {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  testDuration: number;
}

export function PerformanceChart({ wpm, accuracy, correctWords, incorrectWords, testDuration }: PerformanceChartProps) {
  // Generate realistic data points for the chart
  const dataPoints = React.useMemo(() => {
    const points = [];
    const intervals = Math.min(testDuration, 20); // Max 20 data points
    const step = testDuration / intervals;

    for (let i = 0; i <= intervals; i++) {
      const time = Math.round(i * step);
      // Simulate progressive improvement with slight variations
      const progressRatio = i / intervals;
      const wpmProgress = wpm * progressRatio * (0.7 + Math.random() * 0.3);
      const accuracyProgress = Math.max(70, accuracy - (1 - progressRatio) * 15 + (Math.random() * 5 - 2.5));

      points.push({
        time: time,
        wpm: Math.round(wpmProgress * 10) / 10,
        accuracy: Math.round(accuracyProgress * 10) / 10,
      });
    }

    // Ensure last point matches actual results
    points[points.length - 1] = {
      time: testDuration,
      wpm: wpm,
      accuracy: accuracy,
    };

    return points;
  }, [wpm, accuracy, testDuration]);

  return (
    <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-dashed bg-muted/50">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="font-bold">{wpm}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase">WPM</div>
        </div>
        <div className="text-center border-x border-dashed">
          <div className="font-bold">{accuracy.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground font-medium uppercase">Accuracy</div>
        </div>
        <div className="text-center border-r border-dashed">
          <div className="font-bold">{correctWords}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase">Correct</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{incorrectWords}</div>
          <div className="text-xs text-muted-foreground font-medium uppercase">Errors</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataPoints} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="time"
              stroke="currentColor"
              opacity={0.5}
              tick={{ fontSize: 12 }}
              label={{ value: "Time (s)", position: "insideBottom", offset: -10, fontSize: 11, opacity: 0.6 }}
            />
            <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [value.toFixed(1), ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="line" />
            <Area
              type="monotone"
              dataKey="wpm"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#wpmGradient)"
              name="WPM"
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#accuracyGradient)"
              name="Accuracy %"
              dot={{ fill: "#10b981", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
