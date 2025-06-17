
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { advanceWinner } from '@/utils/bracketGenerator';
import type { Tables } from '@/integrations/supabase/types';

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface MatchResultDialogProps {
  match: Match;
  participants: TournamentParticipant[];
  onMatchUpdate: () => void;
}

export const MatchResultDialog = ({ match, participants, onMatchUpdate }: MatchResultDialogProps) => {
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

  if (!player1 || !player2) return null;

  return (
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
  );
};
