
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logMatchWin, logTournamentWin } from '@/utils/activityHelpers';
import { useToast } from '@/hooks/use-toast';

interface MatchResult {
  matchId: string;
  player1Score: number;
  player2Score: number;
  winnerId: string;
  player1Id: string;
  player2Id: string;
  tournamentId: string;
}

export const useMatchResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitMatchResult = async (result: MatchResult) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Update match with results
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          score_player1: result.player1Score,
          score_player2: result.player2Score,
          winner_id: result.winnerId,
          status: 'completed'
        })
        .eq('id', result.matchId);

      if (updateError) throw updateError;

      // Get opponent info for activity logging
      const isPlayer1Winner = result.winnerId === result.player1Id;
      const winnerId = result.winnerId;
      const loserId = isPlayer1Winner ? result.player2Id : result.player1Id;

      // Get loser's profile for activity logging
      const { data: loserProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', loserId)
        .single();

      const opponentName = loserProfile?.username || 'Opponent';
      const score = `${result.player1Score}-${result.player2Score}`;

      // Log match win activity for the winner
      if (winnerId === user.id) {
        await logMatchWin(user.id, opponentName, score, result.matchId);
      }

      // Check if this was a tournament final and log tournament win
      const { data: matchData } = await supabase
        .from('matches')
        .select('round, tournament_id, tournaments(title, max_participants)')
        .eq('id', result.matchId)
        .single();

      if (matchData && winnerId === user.id) {
        // Calculate if this is the final round (assuming single elimination)
        const maxParticipants = matchData.tournaments?.max_participants || 0;
        const finalRound = Math.ceil(Math.log2(maxParticipants));
        
        if (matchData.round === finalRound) {
          const tournamentTitle = matchData.tournaments?.title || 'Tournament';
          await logTournamentWin(user.id, tournamentTitle, matchData.tournament_id);
        }
      }

      toast({
        title: "Match Result Submitted",
        description: "The match result has been recorded successfully"
      });

      return true;
    } catch (error) {
      console.error('Match result submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the match result",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitMatchResult,
    loading
  };
};
