
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Clock, Calendar, Gamepad2 } from "lucide-react";

interface EnhancedUserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
  recentPerformance: number;
  rank: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  averageMatchesPerDay: number;
  totalPlayTime: number;
  lastActiveDate: string;
}

interface DetailedStatsCardProps {
  stats: EnhancedUserStats;
}

export const DetailedStatsCard = ({ stats }: DetailedStatsCardProps) => {
  const getTierColor = (tier: string) => {
    const colors = {
      'Bronze': 'bg-orange-600',
      'Silver': 'bg-gray-500',
      'Gold': 'bg-yellow-600',
      'Platinum': 'bg-green-600',
      'Diamond': 'bg-blue-600',
      'Master': 'bg-purple-600'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-600';
  };

  const formatPlayTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.round(hours * 10) / 10}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Overview */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${getTierColor(stats.tier)} text-white`}>
              {stats.tier}
            </Badge>
            <span className="text-gray-300">Rank #{stats.rank}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-white">{stats.winRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.winRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Recent Form</span>
              <span className="text-white">{stats.recentPerformance.toFixed(1)}%</span>
            </div>
            <Progress value={stats.recentPerformance} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Match Statistics */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Match Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.matchesPlayed}</div>
              <div className="text-xs text-gray-400">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.matchesWon}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Current Streak</span>
              <span className="text-yellow-400 font-semibold">{stats.currentStreak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Best Streak</span>
              <span className="text-orange-400 font-semibold">{stats.longestStreak}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Performance */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.tournamentsPlayed}</div>
              <div className="text-xs text-gray-400">Entered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.tournamentsWon}</div>
              <div className="text-xs text-gray-400">Won</div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avg. Rounds</span>
              <span className="text-blue-400 font-semibold">{stats.averageRoundsReached.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Play Time</span>
            <span className="text-orange-400 font-semibold">{formatPlayTime(stats.totalPlayTime)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Matches/Day</span>
            <span className="text-green-400 font-semibold">{stats.averageMatchesPerDay.toFixed(1)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Last Active</span>
            <span className="text-blue-400 font-semibold">
              {new Date(stats.lastActiveDate).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Game Preferences */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-purple-500" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Favorite Game</span>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              {stats.favoriteGame}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
