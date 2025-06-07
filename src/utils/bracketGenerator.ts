
import { supabase, TournamentParticipant, Match } from "@/lib/supabase";

export const generateTournamentBracket = async (tournamentId: string, participants: TournamentParticipant[]) => {
  // Shuffle participants for random seeding
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  // Calculate number of rounds needed
  const participantCount = shuffledParticipants.length;
  const rounds = Math.ceil(Math.log2(participantCount));
  
  // Calculate total matches needed
  let totalMatches = 0;
  for (let round = 1; round <= rounds; round++) {
    totalMatches += Math.pow(2, rounds - round);
  }
  
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
      winner_id: player2 ? null : player1.user_id, // Auto-advance if no opponent
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
  
  // Insert matches into database
  const { error } = await supabase
    .from('matches')
    .insert(matches);
    
  if (error) throw error;
  
  // Update tournament to mark bracket as generated
  await supabase
    .from('tournaments')
    .update({ bracket_generated: true, status: 'in_progress' })
    .eq('id', tournamentId);
    
  return matches;
};

export const advanceWinner = async (matchId: string, winnerId: string, scorePlayer1: number, scorePlayer2: number) => {
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
    
  if (updateError) throw updateError;
  
  // Find next round match to advance winner to
  const nextRound = match.round + 1;
  const nextPosition = Math.floor(match.bracket_position / 2);
  
  const { data: nextMatch, error: nextMatchError } = await supabase
    .from('matches')
    .select()
    .eq('tournament_id', match.tournament_id)
    .eq('round', nextRound)
    .eq('bracket_position', nextPosition)
    .single();
    
  if (nextMatchError || !nextMatch) return; // Final match or error
  
  // Determine if winner goes to player1 or player2 slot
  const isPlayer1Slot = match.bracket_position % 2 === 0;
  
  const updateData = isPlayer1Slot 
    ? { player1_id: winnerId }
    : { player2_id: winnerId };
    
  await supabase
    .from('matches')
    .update(updateData)
    .eq('id', nextMatch.id);
};
