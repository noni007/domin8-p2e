
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Trophy } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface MatchInfoProps {
  match: Match;
  participants: TournamentParticipant[];
}

export const MatchInfo = ({ match, participants }: MatchInfoProps) => {
  const getParticipant = (userId: string | null) => {
    if (!userId) return null;
    return participants.find(p => p.user_id === userId);
  };

  const player1 = getParticipant(match.player1_id);
  const player2 = getParticipant(match.player2_id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const formatMatchTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm font-medium">
          Match #{match.match_number} - Round {match.round}
        </h3>
        <Badge className={`${getStatusColor(match.status)} text-white text-xs`}>
          {match.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Players */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-black/20">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">{player1?.team_name || `Player ${match.player1_id.slice(0, 8)}`}</span>
            {match.winner_id === match.player1_id && (
              <Trophy className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          {match.status === 'completed' && (
            <span className="text-lg font-bold text-white">{match.score_player1}</span>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">vs</div>

        <div className="flex items-center justify-between p-2 rounded bg-black/20">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-red-400" />
            <span className="text-white font-medium">
              {player2 ? (player2.team_name || `Player ${match.player2_id?.slice(0, 8)}`) : 'TBD'}
            </span>
            {match.winner_id === match.player2_id && (
              <Trophy className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          {match.status === 'completed' && (
            <span className="text-lg font-bold text-white">{match.score_player2}</span>
          )}
        </div>
      </div>

      {/* Match Schedule */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Calendar className="h-3 w-3" />
        <span>Scheduled: {formatMatchTime(match.scheduled_time)}</span>
      </div>
    </div>
  );
};
