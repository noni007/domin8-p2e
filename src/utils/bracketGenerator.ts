import { supabase } from "@/integrations/supabase/client";
import { TournamentLifecycleService } from "@/services/tournamentLifecycleService";
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;
type Match = Tables<'matches'>;

export const generateTournamentBracket = async (tournamentId: string, participants: TournamentParticipant[]) => {
  console.log('Generating bracket for tournament:', tournamentId, 'with participants:', participants.length);
  
  // Shuffle participants for random seeding
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  // Calculate number of rounds needed (power of 2)
  const participantCount = shuffledParticipants.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const rounds = Math.log2(nextPowerOf2);
  
  console.log(`Creating ${rounds} rounds for ${participantCount} participants`);
  
  const matches: Omit<Match, 'id' | 'created_at'>[] = [];
  let matchNumber = 1;
  
  // Generate first round matches
  const firstRoundMatches = Math.ceil(participantCount / 2);
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const player1 = shuffledParticipants[i * 2];
    const player2 = shuffledParticipants[i * 2 + 1] || null;
    
    matches.push({
      tournament_id: tournamentId,
      round: 1,
      match_number: matchNumber,
      player1_id: player1.user_id,
      player2_id: player2?.user_id || null,
      winner_id: player2 ? null : player1.user_id, // Auto-advance if no opponent (bye)
      score_player1: null,
      score_player2: null,
      scheduled_time: new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString(), // Space matches 1 hour apart
      status: player2 ? 'scheduled' : 'completed',
      bracket_position: i
    });
    
    matchNumber++;
  }
  
  // Generate subsequent rounds (empty matches to be filled as tournament progresses)
  for (let round = 2; round <= rounds; round++) {
    const roundMatches = Math.pow(2, rounds - round);
    
    for (let i = 0; i < roundMatches; i++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNumber,
        player1_id: '', // Will be filled when previous round completes
        player2_id: '',
        winner_id: null,
        score_player1: null,
        score_player2: null,
        scheduled_time: new Date(Date.now() + (round * 24 + i) * 60 * 60 * 1000).toISOString(), // Schedule future rounds
        status: 'scheduled',
        bracket_position: i
      });
      
      matchNumber++;
    }
  }
  
  console.log('Generated matches:', matches.length);
  
  // Insert matches into database
  const { error } = await supabase
    .from('matches')
    .insert(matches);
    
  if (error) {
    console.error('Error inserting matches:', error);
    throw error;
  }
  
  // Update tournament to mark bracket as generated
  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ bracket_generated: true, status: 'in_progress' })
    .eq('id', tournamentId);
    
  if (updateError) {
    console.error('Error updating tournament:', updateError);
    throw updateError;
  }
    
  console.log('Bracket generated successfully');
  return matches;
};

export const advanceWinner = async (matchId: string, winnerId: string, scorePlayer1: number, scorePlayer2: number) => {
  console.log('Advancing winner:', winnerId, 'from match:', matchId);
  
  // Update current match
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
  
  // Find next round match to advance winner to
  const nextRound = match.round + 1;
  const nextPosition = Math.floor(match.bracket_position / 2);
  
  const { data: nextMatch, error: nextMatchError } = await supabase
    .from('matches')
    .select()
    .eq('tournament_id', match.tournament_id)
    .eq('round', nextRound)
    .eq('bracket_position', nextPosition)
    .maybeSingle();
    
  if (nextMatchError) {
    console.error('Error finding next match:', nextMatchError);
    throw nextMatchError;
  }
  
  if (!nextMatch) {
    console.log('No next match found - this was the final match');
    
    // This was the final match - complete the tournament
    try {
      await TournamentLifecycleService.completeTournament(match.tournament_id, winnerId);
      console.log('Tournament completed automatically');
    } catch (error) {
      console.error('Error completing tournament:', error);
    }
    
    return;
  }
  
  // Determine if winner goes to player1 or player2 slot
  const isPlayer1Slot = match.bracket_position % 2 === 0;
  
  const updateData = isPlayer1Slot 
    ? { player1_id: winnerId }
    : { player2_id: winnerId };
    
  console.log('Advancing to next match:', nextMatch.id, updateData);
    
  const { error: advanceError } = await supabase
    .from('matches')
    .update(updateData)
    .eq('id', nextMatch.id);
    
  if (advanceError) {
    console.error('Error advancing winner:', advanceError);
    throw advanceError;
  }
  
  console.log('Winner advanced successfully');
};

export const resetTournamentBracket = async (tournamentId: string) => {
  console.log('Resetting bracket for tournament:', tournamentId);
  
  // Delete all matches for this tournament
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId);
    
  if (deleteError) {
    console.error('Error deleting matches:', deleteError);
    throw deleteError;
  }
  
  // Update tournament status
  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ 
      bracket_generated: false, 
      status: 'registration_open' 
    })
    .eq('id', tournamentId);
    
  if (updateError) {
    console.error('Error updating tournament:', updateError);
    throw updateError;
  }
  
  console.log('Bracket reset successfully');
};
