
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logMatchWin, logTournamentWin } from '@/utils/activityHelpers';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Match = Tables<'matches'>;

export const useMatchResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const submitMatchResult = async (
    matchId: string,
    winnerId: string,
    scorePlayer1: number,
    scorePlayer2: number
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Get match details
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          tournament:tournaments!inner(*)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Update match with results
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          winner_id: winnerId,
          score_player1: scorePlayer1,
          score_player2: scorePlayer2,
          status: 'completed'
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Get winner's profile for activity logging
      const { data: winnerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', winnerId)
        .single();

      if (profileError) {
        console.error('Error fetching winner profile:', profileError);
      }

      // Get loser's username
      const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id;
      const { data: loserProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', loserId)
        .single();

      const loserName = loserProfile?.username || 'Opponent';
      const score = `${scorePlayer1}-${scorePlayer2}`;

      // Check if this is a tournament final
      const isFinal = match.round === 1; // Assuming round 1 is the final

      if (isFinal) {
        // Log tournament win
        await logTournamentWin(
          winnerId,
          match.tournament.title,
          match.tournament_id,
          match.tournament.prize_pool
        );
      } else {
        // Log match win
        await logMatchWin(winnerId, loserName, score, matchId);
      }

      toast({
        title: "Match Result Submitted",
        description: `${winnerProfile?.username || 'Winner'} won ${score}!`
      });

      return true;
    } catch (error) {
      console.error('Error submitting match result:', error);
      toast({
        title: "Error",
        description: "Failed to submit match result",
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
