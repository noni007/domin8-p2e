
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;
type Match = Tables<'matches'>;

export const shuffleParticipants = (participants: TournamentParticipant[]): TournamentParticipant[] => {
  return [...participants].sort(() => Math.random() - 0.5);
};

export const generateFirstRoundMatches = (
  tournamentId: string, 
  shuffledParticipants: TournamentParticipant[], 
  firstRoundMatches: number
): Omit<Match, 'id' | 'created_at'>[] => {
  const matches: Omit<Match, 'id' | 'created_at'>[] = [];
  let matchNumber = 1;
  
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
  
  return matches;
};

export const generateSubsequentRounds = (
  tournamentId: string, 
  rounds: number, 
  startingMatchNumber: number
): Omit<Match, 'id' | 'created_at'>[] => {
  const matches: Omit<Match, 'id' | 'created_at'>[] = [];
  let matchNumber = startingMatchNumber;
  
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
  
  return matches;
};
