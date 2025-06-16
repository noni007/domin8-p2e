
import { supabase } from '@/integrations/supabase/client';
import type { RegistrationResult } from '@/types/tournamentRegistration';

export class TournamentRegistrationService {
  static async checkExistingRegistration(tournamentId: string, userId: string) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  static async registerParticipant(tournamentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        status: 'registered'
      });

    if (error) throw error;
  }

  static async unregisterParticipant(tournamentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
