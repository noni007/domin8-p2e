
import { supabase } from '@/integrations/supabase/client';
import { notificationTriggers } from '@/utils/notificationTriggers';

export class TournamentStatusService {
  static async startTournament(tournamentId: string): Promise<void> {
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (error) throw error;

    // Notify participants that tournament has started
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'registered');

    if (participants) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('title, organizer_id')
        .eq('id', tournamentId)
        .single();

      if (tournament) {
        await notificationTriggers.onTournamentStatusChange({
          tournamentId,
          tournamentTitle: tournament.title,
          organizerId: tournament.organizer_id,
          participantIds: participants.map(p => p.user_id)
        }, 'active');
      }
    }
  }

  static async completeTournament(tournamentId: string, winnerId: string): Promise<void> {
    // Update tournament status
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (tournamentError) throw tournamentError;

    // Update winner status
    const { error: winnerError } = await supabase
      .from('tournament_participants')
      .update({ status: 'winner' })
      .eq('tournament_id', tournamentId)
      .eq('user_id', winnerId);

    if (winnerError) throw winnerError;

    // Notify participants of completion
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('user_id')
      .eq('tournament_id', tournamentId);

    if (participants) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('title, organizer_id')
        .eq('id', tournamentId)
        .single();

      if (tournament) {
        await notificationTriggers.onTournamentStatusChange({
          tournamentId,
          tournamentTitle: tournament.title,
          organizerId: tournament.organizer_id,
          participantIds: participants.map(p => p.user_id)
        }, 'completed');
      }
    }
  }

  static async checkTournamentCompletion(tournamentId: string): Promise<boolean> {
    const { data: finalMatch, error } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: false })
      .limit(1)
      .single();

    if (error || !finalMatch) return false;

    return finalMatch.status === 'completed' && finalMatch.winner_id !== null;
  }
}
