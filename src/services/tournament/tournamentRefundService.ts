
import { supabase } from '@/integrations/supabase/client';
import { notificationTriggers } from '@/utils/notificationTriggers';

export class TournamentRefundService {
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
    const { resetTournamentBracket } = await import('@/utils/bracketGenerator');
    await resetTournamentBracket(tournamentId);

    // Process refunds if applicable
    await this.processRefunds(tournamentId);
  }

  private static async processRefunds(tournamentId: string): Promise<void> {
    // Get tournament details
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('entry_fee, title, organizer_id')
      .eq('id', tournamentId)
      .single();

    if (!tournament || tournament.entry_fee <= 0) return;

    // Get participants to refund
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'registered');

    if (!participants) return;

    // Process refunds for each participant
    for (const participant of participants) {
      await this.refundParticipant(participant.user_id, tournament.entry_fee, tournament.title, tournamentId);
    }

    // Notify participants of cancellation
    await notificationTriggers.onTournamentStatusChange({
      tournamentId,
      tournamentTitle: tournament.title,
      organizerId: tournament.organizer_id,
      participantIds: participants.map(p => p.user_id)
    }, 'cancelled');
  }

  private static async refundParticipant(
    userId: string, 
    amount: number, 
    tournamentTitle: string, 
    tournamentId: string
  ): Promise<void> {
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();

    if (!wallet) return;

    // Create refund transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        transaction_type: 'refund',
        amount: amount,
        description: `Tournament Cancellation Refund - ${tournamentTitle}`,
        status: 'completed',
        metadata: { tournament_id: tournamentId }
      });

    // Update wallet balance
    await supabase
      .from('user_wallets')
      .update({ 
        balance: wallet.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);
  }
}
