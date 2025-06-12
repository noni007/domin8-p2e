
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Target, Zap, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;
type Match = Tables<'matches'>;

interface TournamentStatsProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  matches: Match[];
}

export const TournamentStats = ({ tournament, participants, matches }: TournamentStatsProps) => {
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const totalMatches = matches.length;
  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
  
  const currentRound = Math.max(...matches.filter(m => m.status === 'completed').map(m => m.round), 0) + 1;
  const totalRounds = Math.max(...matches.map(m => m.round), 1);
  
  const upcomingMatches = matches.filter(m => 
    m.status === 'scheduled' && 
    m.player1_id && 
    m.player2_id &&
    new Date(m.scheduled_time) > new Date()
  ).length;

  const formatTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const stats = [
    {
      title: "Tournament Progress",
      value: `${Math.round(progressPercentage)}%`,
      subtitle: `${completedMatches}/${totalMatches} matches`,
      icon: Target,
      color: "text-blue-400"
    },
    {
      title: "Current Round",
      value: `${currentRound}/${totalRounds}`,
      subtitle: "Round progression",
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      title: "Active Players",
      value: participants.length.toString(),
      subtitle: `of ${tournament.max_participants} max`,
      icon: Users,
      color: "text-green-400"
    },
    {
      title: "Upcoming Matches",
      value: upcomingMatches.toString(),
      subtitle: "Ready to play",
      icon: Clock,
      color: "text-purple-400"
    },
    {
      title: "Prize Pool",
      value: `$${tournament.prize_pool.toLocaleString()}`,
      subtitle: "Total rewards",
      icon: Trophy,
      color: "text-yellow-400"
    },
    {
      title: "Time Until Start",
      value: formatTimeUntil(tournament.start_date),
      subtitle: new Date(tournament.start_date).toLocaleDateString(),
      icon: Calendar,
      color: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-white text-sm font-medium">
                  {stat.title}
                </div>
                <div className="text-gray-400 text-xs">
                  {stat.subtitle}
                </div>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
