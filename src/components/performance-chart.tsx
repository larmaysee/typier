"use client";

import React from 'react';

interface PerformanceChartProps {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  testDuration: number;
}

export function PerformanceChart({ 
  wpm, 
  accuracy, 
  correctWords, 
  incorrectWords, 
  testDuration 
}: PerformanceChartProps) {
  const maxWPM = 100; // Maximum WPM for scale
  const wpmPercentage = Math.min((wpm / maxWPM) * 100, 100);
  const accuracyPercentage = accuracy;
  
  // Calculate typing speed over time (simulated data points)
  const timePoints = Math.min(testDuration, 60); // Max 60 seconds for chart
  const dataPoints = [];
  
  for (let i = 0; i <= timePoints; i += Math.max(1, Math.floor(timePoints / 10))) {
    // Simulate progressive WPM increase
    const progressWPM = (wpm * i) / timePoints;
    dataPoints.push({
      time: i,
      wpm: Math.min(progressWPM, wpm),
      accuracy: Math.max(accuracy - (Math.random() * 10), accuracy - 5) // Slight variation
    });
  }
  
  // Add final point
  if (dataPoints[dataPoints.length - 1]?.time !== testDuration) {
    dataPoints.push({ time: testDuration, wpm, accuracy });
  }

  const chartWidth = 300;
  const chartHeight = 150;
  const padding = 20;
  
  // Create SVG path for WPM line
  const wpmPath = dataPoints.map((point, index) => {
    const x = padding + (point.time / testDuration) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (point.wpm / maxWPM) * (chartHeight - 2 * padding);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create SVG path for accuracy line
  const accuracyPath = dataPoints.map((point, index) => {
    const x = padding + (point.time / testDuration) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (point.accuracy / 100) * (chartHeight - 2 * padding);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Performance Overview</h3>
      
      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Words Per Minute</span>
            <span>{wpm} WPM</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${wpmPercentage}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Accuracy</span>
            <span>{accuracy}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${accuracyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mini Line Chart */}
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Axes */}
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding} 
            stroke="currentColor" 
            strokeWidth="1" 
            opacity="0.3"
          />
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={chartHeight - padding} 
            stroke="currentColor" 
            strokeWidth="1" 
            opacity="0.3"
          />
          
          {/* WPM Line */}
          <path 
            d={wpmPath} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Accuracy Line */}
          <path 
            d={accuracyPath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2"
            strokeDasharray="3,3"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = padding + (point.time / testDuration) * (chartWidth - 2 * padding);
            const wpmY = chartHeight - padding - (point.wpm / maxWPM) * (chartHeight - 2 * padding);
            const accuracyY = chartHeight - padding - (point.accuracy / 100) * (chartHeight - 2 * padding);
            
            return (
              <g key={index}>
                <circle cx={x} cy={wpmY} r="2" fill="#3b82f6" />
                <circle cx={x} cy={accuracyY} r="2" fill="#10b981" />
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-muted-foreground">WPM</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500 border-dashed border-t"></div>
            <span className="text-muted-foreground">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
          <div className="font-medium text-blue-600 dark:text-blue-400">{correctWords}</div>
          <div className="text-muted-foreground">Correct</div>
        </div>
        <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
          <div className="font-medium text-red-600 dark:text-red-400">{incorrectWords}</div>
          <div className="text-muted-foreground">Errors</div>
        </div>
      </div>
    </div>
  );
}