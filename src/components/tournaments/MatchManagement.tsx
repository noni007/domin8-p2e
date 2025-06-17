
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { MatchInfo } from "./match/MatchInfo";
import { MatchResultDialog } from "./match/MatchResultDialog";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface MatchManagementProps {
  match: Match;
  participants: TournamentParticipant[];
  canEditResult: boolean;
  onMatchUpdate: () => void;
}

export const MatchManagement = ({ 
  match, 
  participants, 
  canEditResult, 
  onMatchUpdate 
}: MatchManagementProps) => {
  const getParticipant = (userId: string | null) => {
    if (!userId) return null;
    return participants.find(p => p.user_id === userId);
  };

  const player1 = getParticipant(match.player1_id);
  const player2 = getParticipant(match.player2_id);

  if (!player1) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="text-center text-gray-400">
            <p>Match #{match.match_number} - Round {match.round}</p>
            <p>Waiting for participants...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all">
      <CardHeader className="pb-2">
        <MatchInfo match={match} participants={participants} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        {canEditResult && match.status !== 'completed' && player2 && (
          <MatchResultDialog
            match={match}
            participants={participants}
            onMatchUpdate={onMatchUpdate}
          />
        )}

        {match.status === 'completed' && (
          <div className="text-center">
            <Badge className="bg-green-600 text-white">
              <Trophy className="h-3 w-3 mr-1" />
              Winner: {match.winner_id === match.player1_id ? 
                (player1.team_name || 'Player 1') : 
                (player2?.team_name || 'Player 2')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
