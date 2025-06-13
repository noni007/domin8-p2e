
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Star, Trophy, Target, Users, Zap } from "lucide-react";

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
}

interface AchievementsProps {
  stats: UserStats;
}

export const Achievements = ({ stats }: AchievementsProps) => {
  const achievements = [
    {
      id: 'first_tournament',
      title: 'Tournament Debut',
      description: 'Participated in your first tournament',
      icon: Users,
      earned: stats.tournamentsPlayed > 0,
      color: 'blue'
    },
    {
      id: 'first_win',
      title: 'First Victory',
      description: 'Won your first tournament match',
      icon: Trophy,
      earned: stats.matchesWon > 0,
      color: 'green'
    },
    {
      id: 'tournament_winner',
      title: 'Tournament Champion',
      description: `Won ${stats.tournamentsWon} tournament${stats.tournamentsWon !== 1 ? 's' : ''}`,
      icon: Medal,
      earned: stats.tournamentsWon > 0,
      color: 'yellow'
    },
    {
      id: 'elite_player',
      title: 'Elite Player',
      description: `Maintained ${stats.winRate.toFixed(1)}% win rate`,
      icon: Star,
      earned: stats.winRate >= 70,
      color: 'purple'
    },
    {
      id: 'veteran',
      title: 'Veteran Competitor',
      description: `Played ${stats.matchesPlayed} matches`,
      icon: Target,
      earned: stats.matchesPlayed >= 10,
      color: 'orange'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Won 5 matches in a row',
      icon: Zap,
      earned: stats.matchesWon >= 5 && stats.winRate >= 80,
      color: 'red'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-600/30 bg-blue-600/10 text-blue-400',
      green: 'border-green-600/30 bg-green-600/10 text-green-400',
      yellow: 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400',
      purple: 'border-purple-600/30 bg-purple-600/10 text-purple-400',
      orange: 'border-orange-600/30 bg-orange-600/10 text-orange-400',
      red: 'border-red-600/30 bg-red-600/10 text-red-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {earnedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg ${getColorClasses(achievement.color)}`}
                >
                  <Icon className="h-8 w-8" />
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm opacity-80">{achievement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No achievements unlocked yet</p>
            <p className="text-gray-500 text-sm">
              Participate in tournaments to earn achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
