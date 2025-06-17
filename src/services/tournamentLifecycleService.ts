
import { supabase } from '@/integrations/supabase/client';
import { generateTournamentBracket, resetTournamentBracket } from '@/utils/bracketGenerator';
import { notificationTriggers } from '@/utils/notificationTriggers';
import type { Tables } from '@/integrations/supabase/types';

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

export class TournamentLifecycleService {
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

  static async cancelTournament(tournamentId: string): Promise<void> {
    const { error } = await supabase
      .from('tournaments')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (error) throw error;

    // Reset bracket if it was generated
    await resetTournamentBracket(tournamentId);

    // Refund entry fees if applicable
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('entry_fee, title, organizer_id')
      .eq('id', tournamentId)
      .single();

    if (tournament && tournament.entry_fee > 0) {
      const { data: participants } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'registered');

      if (participants) {
        // Process refunds for each participant
        for (const participant of participants) {
          const { data: wallet } = await supabase
            .from('user_wallets')
            .select('id, balance')
            .eq('user_id', participant.user_id)
            .single();

          if (wallet) {
            // Create refund transaction
            await supabase
              .from('wallet_transactions')
              .insert({
                wallet_id: wallet.id,
                user_id: participant.user_id,
                transaction_type: 'refund',
                amount: tournament.entry_fee,
                description: `Tournament Cancellation Refund - ${tournament.title}`,
                status: 'completed',
                metadata: { tournament_id: tournamentId }
              });

            // Update wallet balance
            await supabase
              .from('user_wallets')
              .update({ 
                balance: wallet.balance + tournament.entry_fee,
                updated_at: new Date().toISOString()
              })
              .eq('id', wallet.id);
          }
        }

        // Notify participants of cancellation
        await notificationTriggers.onTournamentStatusChange({
          tournamentId,
          tournamentTitle: tournament.title,
          organizerId: tournament.organizer_id,
          participantIds: participants.map(p => p.user_id)
        }, 'cancelled');
      }
    }
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
