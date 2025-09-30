"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Clock, Users, Target, Medal, Award, Play, CheckCircle2, Lock } from "lucide-react";
import { Competition } from "@/domain/entities/competition";
import { CompetitionType, CompetitionStatus, CompetitionCategory } from "@/domain/enums/competition-types";
import { cn } from "@/lib/utils";

interface CompetitionCardProps {
  competition: Competition;
  onJoin?: (competitionId: string) => void;
  onView?: (competitionId: string) => void;
}

function CompetitionCard({ competition, onJoin, onView }: CompetitionCardProps) {
  const getStatusColor = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.ACTIVE:
        return "bg-green-500";
      case CompetitionStatus.UPCOMING:
        return "bg-blue-500";
      case CompetitionStatus.COMPLETED:
        return "bg-gray-500";
      case CompetitionStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.ACTIVE:
        return Play;
      case CompetitionStatus.UPCOMING:
        return Clock;
      case CompetitionStatus.COMPLETED:
        return CheckCircle2;
      case CompetitionStatus.CANCELLED:
        return Lock;
      default:
        return Clock;
    }
  };

  const StatusIcon = getStatusIcon(competition.status);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const target = competition.status === CompetitionStatus.UPCOMING
      ? competition.startDate
      : competition.endDate;

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("capitalize", getStatusColor(competition.status), "text-white")}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {competition.status}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {competition.type}
              </Badge>
              <Badge variant="outline">{competition.language.toUpperCase()}</Badge>
            </div>
            <CardTitle className="text-xl mb-1">{competition.name}</CardTitle>
            <CardDescription>{competition.metadata.description}</CardDescription>
          </div>
          <div className="text-right">
            {competition.category === CompetitionCategory.SPEED && (
              <Target className="w-6 h-6 text-blue-500" />
            )}
            {competition.category === CompetitionCategory.ACCURACY && (
              <Medal className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Competition Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Start</p>
                <p className="font-medium">{formatDate(competition.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{competition.metadata.rules.timeLimit}s</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Participants</p>
                <p className="font-medium">{competition.participantCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{competition.category}</p>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          {(competition.status === CompetitionStatus.ACTIVE || competition.status === CompetitionStatus.UPCOMING) && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {competition.status === CompetitionStatus.UPCOMING ? 'Starts in' : 'Ends in'}
                </span>
                <span className="font-mono font-semibold">{getTimeRemaining()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {competition.status === CompetitionStatus.ACTIVE && (
              <Button onClick={() => onJoin?.(competition.id)} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Join Now
              </Button>
            )}
            {competition.status === CompetitionStatus.UPCOMING && (
              <Button variant="outline" onClick={() => onJoin?.(competition.id)} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Register
              </Button>
            )}
            <Button variant="outline" onClick={() => onView?.(competition.id)}>
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </div>

          {/* Competition Rules */}
          {competition.metadata.rules && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>• Min Accuracy: {competition.metadata.rules.minAccuracy}%</p>
              <p>• Min WPM: {competition.metadata.rules.minWPM}</p>
              <p>• Attempts: {competition.metadata.rules.attemptsAllowed}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitionHub() {
  const [activeTab, setActiveTab] = useState<CompetitionType>(CompetitionType.DAILY);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, [activeTab]);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      // TODO: Use GetActiveCompetitionsUseCase from DI container
      // const competitions = await getActiveCompetitionsUseCase.execute({ type: activeTab });
      // For now, show mock data
      setCompetitions([]);
    } catch (error) {
      console.error('Failed to load competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompetition = (competitionId: string) => {
    console.log('Joining competition:', competitionId);
    // TODO: Implement join competition logic
  };

  const handleViewLeaderboard = (competitionId: string) => {
    console.log('Viewing leaderboard:', competitionId);
    // TODO: Navigate to competition leaderboard
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Competitions</h1>
        <p className="text-muted-foreground">
          Join daily, weekly, and monthly typing challenges to compete with typists worldwide
        </p>
      </div>

      {/* Competition Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as CompetitionType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value={CompetitionType.DAILY}>
            <Calendar className="w-4 h-4 mr-2" />
            Daily
          </TabsTrigger>
          <TabsTrigger value={CompetitionType.WEEKLY}>
            <Calendar className="w-4 h-4 mr-2" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value={CompetitionType.MONTHLY}>
            <Trophy className="w-4 h-4 mr-2" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value={CompetitionType.SPECIAL}>
            <Award className="w-4 h-4 mr-2" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading competitions...</p>
            </div>
          ) : competitions.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Competitions</h3>
                <p className="text-muted-foreground mb-6">
                  Check back soon for new {activeTab} competitions!
                </p>
                <Button variant="outline" onClick={loadCompetitions}>
                  Refresh
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onJoin={handleJoinCompetition}
                  onView={handleViewLeaderboard}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
