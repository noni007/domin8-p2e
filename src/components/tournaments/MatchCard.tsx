
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, User } from "lucide-react";
import { Match, TournamentParticipant } from "@/lib/supabase";
import { advanceWinner } from "@/utils/bracketGenerator";
import { toast } from "@/hooks/use-toast";

interface MatchCardProps {
  match: Match;
  participants: TournamentParticipant[];
  onMatchUpdate: () => void;
}

export const MatchCard = ({ match, participants, onMatchUpdate }: MatchCardProps) => {
  const [updating, setUpdating] = useState(false);
  const [scorePlayer1, setScorePlayer1] = useState(match.score_player1?.toString() || '');
  const [scorePlayer2, setScorePlayer2] = useState(match.score_player2?.toString() || '');

  const player1 = participants.find(p => p.user_id === match.player1_id);
  const player2 = participants.find(p => p.user_id === match.player2_id);
  const winner = participants.find(p => p.user_id === match.winner_id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const handleSubmitResult = async () => {
    if (!player1 || !player2) {
      toast({
        title: "Invalid Match",
        description: "Both players must be assigned to submit results.",
        variant: "destructive"
      });
      return;
    }

    const score1 = parseInt(scorePlayer1);
    const score2 = parseInt(scorePlayer2);

    if (isNaN(score1) || isNaN(score2)) {
      toast({
        title: "Invalid Scores",
        description: "Please enter valid numeric scores.",
        variant: "destructive"
      });
      return;
    }

    if (score1 === score2) {
      toast({
        title: "Tie Not Allowed",
        description: "Tournament matches cannot end in a tie.",
        variant: "destructive"
      });
      return;
    }

    const winnerId = score1 > score2 ? match.player1_id : match.player2_id;

    setUpdating(true);
    try {
      await advanceWinner(match.id, winnerId, score1, score2);
      onMatchUpdate();
      
      toast({
        title: "Match Result Submitted",
        description: "Winner has been advanced to the next round.",
      });
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        title: "Error",
        description: "Failed to submit match result.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Match Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(match.status)} text-white capitalize text-xs`}>
                {match.status.replace('_', ' ')}
              </Badge>
              <span className="text-gray-400 text-sm">Match #{match.match_number}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="h-3 w-3" />
              {formatDate(match.scheduled_time)}
            </div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            {/* Player 1 */}
            <div className={`flex items-center justify-between p-2 rounded ${
              match.winner_id === match.player1_id ? 'bg-green-600/20 border border-green-600/30' : 'bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-white">
                  {player1 ? `Player ${participants.indexOf(player1) + 1}` : 'TBD'}
                </span>
                {match.winner_id === match.player1_id && (
                  <Trophy className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              {match.status === 'completed' && (
                <span className="text-white font-mono">{match.score_player1}</span>
              )}
            </div>

            {/* VS */}
            <div className="text-center text-gray-400 text-sm">VS</div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-2 rounded ${
              match.winner_id === match.player2_id ? 'bg-green-600/20 border border-green-600/30' : 'bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-white">
                  {player2 ? `Player ${participants.indexOf(player2) + 1}` : 'TBD'}
                </span>
                {match.winner_id === match.player2_id && (
                  <Trophy className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              {match.status === 'completed' && (
                <span className="text-white font-mono">{match.score_player2}</span>
              )}
            </div>
          </div>

          {/* Score Input for Active Matches */}
          {match.status === 'scheduled' && player1 && player2 && (
            <div className="space-y-3 pt-2 border-t border-gray-600">
              <div className="text-sm text-gray-300">Submit Result:</div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <Input
                  type="number"
                  placeholder="0"
                  value={scorePlayer1}
                  onChange={(e) => setScorePlayer1(e.target.value)}
                  className="bg-black/20 border-blue-800/50 text-white text-center"
                />
                <span className="text-center text-gray-400 text-sm">:</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={scorePlayer2}
                  onChange={(e) => setScorePlayer2(e.target.value)}
                  className="bg-black/20 border-blue-800/50 text-white text-center"
                />
              </div>
              <Button
                onClick={handleSubmitResult}
                disabled={updating || !scorePlayer1 || !scorePlayer2}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                size="sm"
              >
                {updating ? "Submitting..." : "Submit Result"}
              </Button>
            </div>
          )}

          {/* Winner Display */}
          {match.status === 'completed' && winner && (
            <div className="text-center py-2 bg-green-600/20 rounded border border-green-600/30">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">
                  Winner: Player {participants.indexOf(winner) + 1}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
