
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RegistrationResult {
  success: boolean;
  message: string;
}

export const useTournamentRegistrationWithFees = () => {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { checkForNewAchievements } = useAchievements();
  const [isRegistering, setIsRegistering] = useState(false);

  const registerForTournament = async (
    tournamentId: string,
    entryFee: number = 0
  ): Promise<RegistrationResult> => {
    if (!user) {
      return { success: false, message: "Please log in to register for tournaments" };
    }

    if (!wallet) {
      return { success: false, message: "Wallet not found" };
    }

    if (entryFee > 0 && wallet.balance < entryFee) {
      return { 
        success: false, 
        message: `Insufficient funds. You need $${(entryFee / 100).toFixed(2)} but only have $${(wallet.balance / 100).toFixed(2)}` 
      };
    }

    setIsRegistering(true);

    try {
      // Check if already registered
      const { data: existingRegistration } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        return { success: false, message: "You are already registered for this tournament" };
      }

      // Register for tournament
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered'
        });

      if (registrationError) throw registrationError;

      // Handle entry fee if applicable
      if (entryFee > 0) {
        // Create withdrawal transaction
        const { error: withdrawalError } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            user_id: user.id,
            transaction_type: 'tournament_fee',
            amount: -entryFee,
            description: 'Tournament Entry Fee',
            status: 'completed',
            metadata: { tournament_id: tournamentId }
          });

        if (withdrawalError) throw withdrawalError;

        // Update wallet balance
        const { error: walletError } = await supabase
          .from('user_wallets')
          .update({ 
            balance: wallet.balance - entryFee,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id);

        if (walletError) throw walletError;

        // Add entry fee to tournament prize pool
        const { error: prizePoolError } = await supabase
          .from('tournaments')
          .update({
            prize_pool: supabase.raw(`prize_pool + ${entryFee}`)
          })
          .eq('id', tournamentId);

        if (prizePoolError) throw prizePoolError;
      }

      // Check for new achievements after registration
      await checkForNewAchievements();

      toast({
        title: "Registration Successful!",
        description: entryFee > 0 
          ? `You've registered for the tournament. Entry fee of $${(entryFee / 100).toFixed(2)} has been deducted from your wallet.`
          : "You've successfully registered for the tournament!"
      });

      return { success: true, message: "Registration successful!" };

    } catch (error) {
      console.error('Tournament registration error:', error);
      return { success: false, message: "Failed to register for tournament. Please try again." };
    } finally {
      setIsRegistering(false);
    }
  };

  const unregisterFromTournament = async (tournamentId: string, entryFee: number = 0): Promise<RegistrationResult> => {
    if (!user) {
      return { success: false, message: "Please log in to unregister" };
    }

    setIsRegistering(true);

    try {
      // Remove registration
      const { error: unregisterError } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (unregisterError) throw unregisterError;

      // Refund entry fee if applicable
      if (entryFee > 0 && wallet) {
        // Create refund transaction
        const { error: refundError } = await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            user_id: user.id,
            transaction_type: 'refund',
            amount: entryFee,
            description: 'Tournament Entry Fee Refund',
            status: 'completed',
            metadata: { tournament_id: tournamentId }
          });

        if (refundError) throw refundError;

        // Update wallet balance
        const { error: walletError } = await supabase
          .from('user_wallets')
          .update({ 
            balance: wallet.balance + entryFee,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id);

        if (walletError) throw walletError;

        // Remove entry fee from tournament prize pool
        const { error: prizePoolError } = await supabase
          .from('tournaments')
          .update({
            prize_pool: supabase.raw(`prize_pool - ${entryFee}`)
          })
          .eq('id', tournamentId);

        if (prizePoolError) throw prizePoolError;
      }

      toast({
        title: "Unregistered Successfully",
        description: entryFee > 0 
          ? `You've been unregistered and your entry fee of $${(entryFee / 100).toFixed(2)} has been refunded.`
          : "You've been successfully unregistered from the tournament."
      });

      return { success: true, message: "Unregistered successfully!" };

    } catch (error) {
      console.error('Tournament unregistration error:', error);
      return { success: false, message: "Failed to unregister from tournament. Please try again." };
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerForTournament,
    unregisterFromTournament,
    isRegistering
  };
};
