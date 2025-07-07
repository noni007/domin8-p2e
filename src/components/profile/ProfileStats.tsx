
import { Card, CardContent } from "@/components/ui/card";

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
}

interface ProfileStatsProps {
  stats: UserStats;
}

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.tournamentsPlayed}</div>
          <div className="text-xs sm:text-sm text-gray-400">Tournaments</div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-yellow-400">{stats.tournamentsWon}</div>
          <div className="text-xs sm:text-sm text-gray-400">Wins</div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-400">{stats.matchesPlayed}</div>
          <div className="text-xs sm:text-sm text-gray-400">Matches</div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-purple-400">{stats.winRate.toFixed(1)}%</div>
          <div className="text-xs sm:text-sm text-gray-400">Win Rate</div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm col-span-2 sm:col-span-1">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-orange-400">#{stats.rank}</div>
          <div className="text-xs sm:text-sm text-gray-400">Global Rank</div>
        </CardContent>
      </Card>
    </div>
  );
};
