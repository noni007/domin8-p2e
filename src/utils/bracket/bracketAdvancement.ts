
import { supabase } from "@/integrations/supabase/client";
import { TournamentLifecycleService } from "@/services/tournamentLifecycleService";
import { calculateNextMatchPosition, isPlayer1Slot } from "./bracketCalculations";

export const updateMatchResult = async (
  matchId: string, 
  winnerId: string, 
  scorePlayer1: number, 
  scorePlayer2: number
) => {
  console.log('Advancing winner:', winnerId, 'from match:', matchId);
  
  const { data: match, error: updateError } = await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      score_player1: scorePlayer1,
      score_player2: scorePlayer2,
      status: 'completed'
    })
    .eq('id', matchId)
    .select()
    .single();
    
  if (updateError) {
    console.error('Error updating match:', updateError);
    throw updateError;
  }
  
  console.log('Match updated:', match);
  return match;
};

export const findNextMatch = async (tournamentId: string, currentRound: number, bracketPosition: number) => {
  const { nextRound, nextPosition } = calculateNextMatchPosition(currentRound, bracketPosition);
  
  const { data: nextMatch, error: nextMatchError } = await supabase
    .from('matches')
    .select()
    .eq('tournament_id', tournamentId)
    .eq('round', nextRound)
    .eq('bracket_position', nextPosition)
    .maybeSingle();
    
  if (nextMatchError) {
    console.error('Error finding next match:', nextMatchError);
    throw nextMatchError;
  }
  
  return nextMatch;
};

export const advanceWinnerToNextMatch = async (
  nextMatchId: string, 
  winnerId: string, 
  bracketPosition: number
) => {
  const isPlayer1Position = isPlayer1Slot(bracketPosition);
  
  const updateData = isPlayer1Position 
    ? { player1_id: winnerId }
    : { player2_id: winnerId };
    
  console.log('Advancing to next match:', nextMatchId, updateData);
    
  const { error: advanceError } = await supabase
    .from('matches')
    .update(updateData)
    .eq('id', nextMatchId);
    
  if (advanceError) {
    console.error('Error advancing winner:', advanceError);
    throw advanceError;
  }
  
  console.log('Winner advanced successfully');
};

export const handleTournamentCompletion = async (tournamentId: string, winnerId: string) => {
  console.log('No next match found - this was the final match');
  
  try {
    await TournamentLifecycleService.completeTournament(tournamentId, winnerId);
    console.log('Tournament completed automatically');
  } catch (error) {
    console.error('Error completing tournament:', error);
    throw error;
  }
};
