
import type { Tables } from "@/integrations/supabase/types";
import { 
  generateBracketStructure, 
  insertMatchesToDatabase, 
  updateTournamentStatus,
  processWinnerAdvancement,
  deleteTournamentMatches,
  resetTournamentStatus
} from "./bracket/bracketManagement";

type TournamentParticipant = Tables<'tournament_participants'>;

export const generateTournamentBracket = async (tournamentId: string, participants: TournamentParticipant[]) => {
  const matches = await generateBracketStructure(tournamentId, participants);
  
  // Insert matches into database
  await insertMatchesToDatabase(matches);
  
  // Update tournament to mark bracket as generated
  await updateTournamentStatus(tournamentId);
    
  console.log('Bracket generated successfully');
  return matches;
};

export const advanceWinner = async (matchId: string, winnerId: string, scorePlayer1: number, scorePlayer2: number) => {
  await processWinnerAdvancement(matchId, winnerId, scorePlayer1, scorePlayer2);
};

export const resetTournamentBracket = async (tournamentId: string) => {
  // Delete all matches for this tournament
  await deleteTournamentMatches(tournamentId);
  
  // Update tournament status
  await resetTournamentStatus(tournamentId);
  
  console.log('Bracket reset successfully');
};
