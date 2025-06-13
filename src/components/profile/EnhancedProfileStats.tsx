
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Award, Calendar, Zap } from "lucide-react";

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
}

interface EnhancedProfileStatsProps {
  stats: UserStats;
}

export const EnhancedProfileStats = ({ stats }: EnhancedProfileStatsProps) => {
  const getTierInfo = (winRate: number) => {
    if (winRate >= 80) return { name: 'Master', color: 'bg-purple-600', progress: 100 };
    if (winRate >= 70) return { name: 'Diamond', color: 'bg-blue-600', progress: 85 };
    if (winRate >= 60) return { name: 'Platinum', color: 'bg-green-600', progress: 70 };
    if (winRate >= 50) return { name: 'Gold', color: 'bg-yellow-600', progress: 55 };
    if (winRate >= 40) return { name: 'Silver', color: 'bg-gray-500', progress: 40 };
    return { name: 'Bronze', color: 'bg-orange-600', progress: 25 };
  };

  const tier = getTierInfo(stats.winRate);
  const nextTierProgress = ((stats.winRate % 10) / 10) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Performance Overview */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm md:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <Badge className={`${tier.color} text-white`}>
              {tier.name}
            </Badge>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Progress to next tier</span>
              <span className="text-gray-400">{nextTierProgress.toFixed(0)}%</span>
            </div>
            <Progress value={nextTierProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-lg font-semibold text-green-400">{stats.tournamentsWon}</div>
              <div className="text-xs text-gray-400">Tournaments Won</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">#{stats.rank}</div>
              <div className="text-xs text-gray-400">Global Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Stats */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-400">{stats.tournamentsPlayed}</div>
          <div className="text-sm text-gray-400">Tournaments</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.averageRoundsReached.toFixed(1)} avg rounds
          </div>
        </CardContent>
      </Card>

      {/* Match Stats */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">{stats.matchesWon}</div>
          <div className="text-sm text-gray-400">Matches Won</div>
          <div className="text-xs text-gray-500 mt-1">
            of {stats.matchesPlayed} played
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{stats.currentStreak}</div>
          <div className="text-sm text-gray-400">Current Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            Best: {stats.longestStreak}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Game */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-orange-400">{stats.favoriteGame}</div>
          <div className="text-sm text-gray-400">Favorite Game</div>
          <div className="text-xs text-gray-500 mt-1">
            Most played
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
