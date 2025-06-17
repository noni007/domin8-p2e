
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { calculateBracketStructure } from "./bracketCalculations";
import { shuffleParticipants, generateFirstRoundMatches, generateSubsequentRounds } from "./matchGeneration";
import { 
  updateMatchResult, 
  findNextMatch, 
  advanceWinnerToNextMatch, 
  handleTournamentCompletion 
} from "./bracketAdvancement";

type TournamentParticipant = Tables<'tournament_participants'>;

export const insertMatchesToDatabase = async (
  matches: Omit<Tables<'matches'>, 'id' | 'created_at'>[]
) => {
  console.log('Generated matches:', matches.length);
  
  const { error } = await supabase
    .from('matches')
    .insert(matches);
    
  if (error) {
    console.error('Error inserting matches:', error);
    throw error;
  }
};

export const updateTournamentStatus = async (tournamentId: string) => {
  const { error: updateError } = await supabase
    .from('tournaments')
    .update({ bracket_generated: true, status: 'in_progress' })
    .eq('id', tournamentId);
    
  if (updateError) {
    console.error('Error updating tournament:', updateError);
    throw updateError;
  }
};

export const deleteTournamentMatches = async (tournamentId: string) => {
  console.log('Resetting bracket for tournament:', tournamentId);
  
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId);
    
  if (deleteError) {
    console.error('Error deleting matches:', deleteError);
    throw deleteError;
  }
};

export const resetTournamentStatus = async (tournamentId: string) => {
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
};

export const generateBracketStructure = async (
  tournamentId: string, 
  participants: TournamentParticipant[]
) => {
  console.log('Generating bracket for tournament:', tournamentId, 'with participants:', participants.length);
  
  const shuffledParticipants = shuffleParticipants(participants);
  const { rounds, firstRoundMatches } = calculateBracketStructure(participants.length);
  
  console.log(`Creating ${rounds} rounds for ${participants.length} participants`);
  
  // Generate first round matches
  const firstRoundMatchesData = generateFirstRoundMatches(
    tournamentId, 
    shuffledParticipants, 
    firstRoundMatches
  );
  
  // Generate subsequent rounds
  const subsequentRoundsData = generateSubsequentRounds(
    tournamentId, 
    rounds, 
    firstRoundMatches + 1
  );
  
  const allMatches = [...firstRoundMatchesData, ...subsequentRoundsData];
  
  return allMatches;
};

export const processWinnerAdvancement = async (
  matchId: string, 
  winnerId: string, 
  scorePlayer1: number, 
  scorePlayer2: number
) => {
  // Update current match
  const match = await updateMatchResult(matchId, winnerId, scorePlayer1, scorePlayer2);
  
  // Find next round match to advance winner to
  const nextMatch = await findNextMatch(match.tournament_id, match.round, match.bracket_position);
  
  if (!nextMatch) {
    // This was the final match - complete the tournament
    await handleTournamentCompletion(match.tournament_id, winnerId);
    return;
  }
  
  // Advance winner to next match
  await advanceWinnerToNextMatch(nextMatch.id, winnerId, match.bracket_position);
};
