"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, User, Trophy, Target, Clock, TrendingUp, Calendar, Zap } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { TypingDatabaseService, TypingTestDocument } from "@/lib/appwrite";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  initialStats?: {
    bestWpm: number;
    averageWpm?: number;
    bestAccuracy?: number;
    averageAccuracy?: number;
    totalTests?: number;
  };
}

interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTimeTyped: number;
  totalCharactersTyped: number;
  totalErrors: number;
  improvementTrend: number;
  recentTests: TypingTestDocument[];
}

export function UserDetailModal({ isOpen, onClose, userId, username, initialStats }: UserDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const fetchUserDetails = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const [stats, recentTests] = await Promise.all([
          TypingDatabaseService.getUserStatistics(userId),
          TypingDatabaseService.getUserTypingTests(userId, 10)
        ]);

        setUserStats({
          ...stats,
          recentTests
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      fetchUserDetails();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [stats, recentTests] = await Promise.all([
        TypingDatabaseService.getUserStatistics(userId),
        TypingDatabaseService.getUserTypingTests(userId, 10)
      ]);

      setUserStats({
        ...stats,
        recentTests
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
      // Fallback to initial stats if available
      if (initialStats) {
        setUserStats({
          totalTests: initialStats.totalTests || 0,
          averageWpm: initialStats.averageWpm || 0,
          bestWpm: initialStats.bestWpm,
          averageAccuracy: initialStats.averageAccuracy || 0,
          bestAccuracy: initialStats.bestAccuracy || 0,
          totalTimeTyped: 0,
          totalCharactersTyped: 0,
          totalErrors: 0,
          improvementTrend: 0,
          recentTests: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const formatLanguage = (lang: string) => {
    switch (lang) {
      case 'english': return 'English';
      case 'lisu': return 'Lisu';
      case 'myanmar': return 'Myanmar';
      default: return lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className="relative bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        {/* Close button */}
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/80 transition-all duration-200 z-10 group"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 id="user-modal-title" className="text-2xl font-bold">{username}</h2>
              <p className="text-sm text-muted-foreground">User ID: {userId}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading user details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">⚠️ {error}</div>
              <Button onClick={fetchUserDetails} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : userStats ? (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Best WPM</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{userStats.bestWpm}</div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Best Accuracy</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{userStats.bestAccuracy}%</div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Tests</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalTests}</div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Time Typed</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{Math.round(userStats.totalTimeTyped / 60)}m</div>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Performance Averages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average WPM:</span>
                      <span className="font-semibold">{userStats.averageWpm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Accuracy:</span>
                      <span className="font-semibold">{userStats.averageAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Characters:</span>
                      <span className="font-semibold">{userStats.totalCharactersTyped.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Errors:</span>
                      <span className="font-semibold text-red-500">{userStats.totalErrors}</span>
                    </div>
                    {userStats.improvementTrend !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Improvement Trend:</span>
                        <span className={`font-semibold ${userStats.improvementTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {userStats.improvementTrend > 0 ? '+' : ''}{userStats.improvementTrend}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Recent Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userStats.recentTests.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent tests available</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {userStats.recentTests.slice(0, 5).map((test) => (
                          <div key={test.$id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {formatLanguage(test.language)}
                              </Badge>
                              <span className="text-sm font-medium">{test.wpm} WPM</span>
                              <span className="text-sm text-green-600">{test.accuracy}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(test.test_date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No user data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border">
          <div className="flex justify-center">
            <Button
              onClick={handleCloseClick}
              variant="outline"
              className="min-w-[120px] hover:bg-muted/80 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}