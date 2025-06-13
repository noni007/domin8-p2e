
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Clock, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { advanceWinner } from '@/utils/bracketGenerator';
import type { Tables } from '@/integrations/supabase/types';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scorePlayer1, setScorePlayer1] = useState(match.score_player1?.toString() || '');
  const [scorePlayer2, setScorePlayer2] = useState(match.score_player2?.toString() || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleSubmitResult = async (winnerId: string) => {
    if (!scorePlayer1 || !scorePlayer2) {
      toast({
        title: "Missing Scores",
        description: "Please enter scores for both players.",
        variant: "destructive"
      });
      return;
    }

    const score1 = parseInt(scorePlayer1);
    const score2 = parseInt(scorePlayer2);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      toast({
        title: "Invalid Scores",
        description: "Please enter valid positive numbers for scores.",
        variant: "destructive"
      });
      return;
    }

    if (score1 === score2) {
      toast({
        title: "Tie Not Allowed",
        description: "Tournament matches cannot end in a tie. Please enter different scores.",
        variant: "destructive"
      });
      return;
    }

    // Validate winner based on scores
    const actualWinner = score1 > score2 ? match.player1_id : match.player2_id;
    if (winnerId !== actualWinner) {
      toast({
        title: "Score Mismatch",
        description: "The selected winner doesn't match the scores entered.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await advanceWinner(match.id, winnerId, score1, score2);
      
      toast({
        title: "Result Submitted",
        description: "Match result has been recorded successfully.",
      });

      setIsDialogOpen(false);
      onMatchUpdate();
    } catch (error) {
      console.error('Error submitting result:', error);
      toast({
        title: "Error",
        description: "Failed to submit match result.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMatchTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

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
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-sm">
            Match #{match.match_number} - Round {match.round}
          </CardTitle>
          <Badge className={`${getStatusColor(match.status)} text-white text-xs`}>
            {match.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Players */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-black/20">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-white font-medium">{player1.team_name || `Player ${match.player1_id.slice(0, 8)}`}</span>
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

        {/* Match Info */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Calendar className="h-3 w-3" />
          <span>Scheduled: {formatMatchTime(match.scheduled_time)}</span>
        </div>

        {/* Actions */}
        {canEditResult && match.status !== 'completed' && player2 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                Submit Result
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-blue-800/30">
              <DialogHeader>
                <DialogTitle className="text-white">Submit Match Result</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">
                      {player1.team_name || 'Player 1'} Score
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={scorePlayer1}
                      onChange={(e) => setScorePlayer1(e.target.value)}
                      className="bg-black/40 border-blue-800/30 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1">
                      {player2.team_name || 'Player 2'} Score
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={scorePlayer2}
                      onChange={(e) => setScorePlayer2(e.target.value)}
                      className="bg-black/40 border-blue-800/30 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {scorePlayer1 && scorePlayer2 && scorePlayer1 !== scorePlayer2 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">Select Winner:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleSubmitResult(match.player1_id)}
                        disabled={loading}
                        variant={parseInt(scorePlayer1) > parseInt(scorePlayer2) ? "default" : "outline"}
                        className="w-full"
                      >
                        {player1.team_name || 'Player 1'}
                      </Button>
                      <Button
                        onClick={() => handleSubmitResult(match.player2_id!)}
                        disabled={loading}
                        variant={parseInt(scorePlayer2) > parseInt(scorePlayer1) ? "default" : "outline"}
                        className="w-full"
                      >
                        {player2.team_name || 'Player 2'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
