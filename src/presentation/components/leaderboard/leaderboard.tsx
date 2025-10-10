"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Medal, Trophy } from "lucide-react";

export function Leaderboard() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Global Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against typists worldwide</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Speed (WPM)
            </CardTitle>
            <CardDescription>Fastest typists this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="font-medium">Anonymous User 1</span>
                <span className="font-bold">145 WPM</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Anonymous User 2</span>
                <span className="font-bold">132 WPM</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="font-medium">Anonymous User 3</span>
                <span className="font-bold">128 WPM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-blue-500" />
              Best Accuracy
            </CardTitle>
            <CardDescription>Most accurate typists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="font-medium">Precision Pro</span>
                <span className="font-bold">99.8%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Accurate Andy</span>
                <span className="font-bold">99.5%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="font-medium">Perfect Pete</span>
                <span className="font-bold">99.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Multi-Language Masters
            </CardTitle>
            <CardDescription>Top performers across languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <span className="font-medium">Polyglot Pro</span>
                <span className="text-sm text-muted-foreground">EN/LI/MY</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Language Master</span>
                <span className="text-sm text-muted-foreground">EN/MY</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                <span className="font-medium">Global Typist</span>
                <span className="text-sm text-muted-foreground">EN/LI</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
          <CardDescription>Complete more tests to appear on the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Start typing to see your ranking!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
