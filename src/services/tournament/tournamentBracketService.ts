
import { supabase } from '@/integrations/supabase/client';
import { generateTournamentBracket, resetTournamentBracket } from '@/utils/bracketGenerator';

export class TournamentBracketService {
  static async generateBracket(tournamentId: string): Promise<void> {
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'registered');

    if (participantsError) throw participantsError;

    if (!participants || participants.length < 2) {
      throw new Error('Need at least 2 participants to generate bracket');
    }

    await generateTournamentBracket(tournamentId, participants);
  }

  static async getNextMatches(tournamentId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'scheduled')
      .not('player1_id', 'is', null)
      .not('player2_id', 'is', null)
      .order('round')
      .order('bracket_position');

    if (error) throw error;
    return data;
  }

  static async resetBracket(tournamentId: string): Promise<void> {
    await resetTournamentBracket(tournamentId);
  }
}
