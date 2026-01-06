
import { supabase } from '@/integrations/supabase/client';
import type { WalletTransactionParams } from '@/types/tournamentRegistration';

export class WalletTransactionService {
  static async createWithdrawalTransaction(params: WalletTransactionParams) {
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        transaction_type: 'tournament_fee',
        amount: -params.entryFee,
        description: params.description,
        status: 'completed',
        metadata: { tournament_id: params.tournamentId }
      });

    if (error) throw error;
  }

  static async createRefundTransaction(params: WalletTransactionParams) {
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        transaction_type: 'refund',
        amount: params.entryFee,
        description: params.description,
        status: 'completed',
        metadata: { tournament_id: params.tournamentId }
      });

    if (error) throw error;
  }

  static async updateWalletBalance(walletId: string, amount: number) {
    // Use atomic RPC function to prevent race conditions
    const { error } = await supabase
      .rpc('update_wallet_balance_atomic', { 
        p_wallet_id: walletId,
        p_amount: amount
      });

    if (error) throw error;
  }

  static async updateTournamentPrizePool(tournamentId: string, amount: number, fallbackBalance: number) {
    // Try using RPC first
    const { error: prizePoolError } = await supabase
      .rpc('update_tournament_prize_pool', {
        tournament_id: tournamentId,
        amount: amount
      });

    if (prizePoolError) {
      // Fallback to direct update
      const { error: fallbackError } = await supabase
        .from('tournaments')
        .update({
          prize_pool: fallbackBalance + amount
        })
        .eq('id', tournamentId);
      
      if (fallbackError) throw fallbackError;
    }
  }
}
