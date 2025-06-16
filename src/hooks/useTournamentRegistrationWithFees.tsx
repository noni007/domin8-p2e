
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useWalletActivity } from '@/hooks/useWalletActivity';
import { useToast } from '@/hooks/use-toast';

export const useTournamentRegistrationWithFees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { wallet, createTransactionWithActivity } = useWalletActivity();
  const [loading, setLoading] = useState(false);

  const registerForTournament = async (
    tournamentId: string, 
    tournamentTitle: string, 
    entryFee: number = 0,
    prizePool?: number
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for tournaments",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You're already registered for this tournament",
          variant: "destructive"
        });
        return false;
      }

      // Check wallet balance if entry fee is required
      if (entryFee > 0) {
        if (!wallet || wallet.balance < entryFee) {
          toast({
            title: "Insufficient Funds",
            description: `You need $${(entryFee / 100).toFixed(2)} in your wallet to join this tournament`,
            variant: "destructive"
          });
          return false;
        }

        // Deduct entry fee from wallet
        await createTransactionWithActivity(
          'tournament_fee',
          -entryFee, // Negative amount for deduction
          `Tournament Entry Fee - ${tournamentTitle}`,
          { 
            tournament_id: tournamentId,
            tournament_title: tournamentTitle 
          }
        );

        // Add entry fee to tournament prize pool
        const { error: prizeUpdateError } = await supabase
          .from('tournaments')
          .update({ 
            prize_pool: (prizePool || 0) + entryFee 
          })
          .eq('id', tournamentId);

        if (prizeUpdateError) {
          console.error('Error updating prize pool:', prizeUpdateError);
          // Don't fail registration for this, but log it
        }
      }

      // Register for tournament
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id
        });

      if (registrationError) throw registrationError;

      toast({
        title: "Registration Successful",
        description: entryFee > 0 
          ? `You've registered for ${tournamentTitle}! Entry fee of $${(entryFee / 100).toFixed(2)} has been deducted.`
          : `You've registered for ${tournamentTitle}!`
      });

      return true;
    } catch (error) {
      console.error('Tournament registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unregisterFromTournament = async (
    tournamentId: string, 
    entryFee: number = 0,
    tournamentTitle: string = "tournament"
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refund entry fee if applicable
      if (entryFee > 0) {
        await createTransactionWithActivity(
          'refund',
          entryFee, // Positive amount for refund
          `Tournament Entry Fee Refund - ${tournamentTitle}`,
          { 
            tournament_id: tournamentId,
            tournament_title: tournamentTitle 
          }
        );

        toast({
          title: "Unregistered",
          description: `You've been removed from the tournament. Entry fee of $${(entryFee / 100).toFixed(2)} has been refunded.`
        });
      } else {
        toast({
          title: "Unregistered",
          description: "You've been removed from the tournament"
        });
      }

      return true;
    } catch (error) {
      console.error('Tournament unregistration error:', error);
      toast({
        title: "Error",
        description: "Failed to unregister from tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerForTournament,
    unregisterFromTournament,
    loading
  };
};
