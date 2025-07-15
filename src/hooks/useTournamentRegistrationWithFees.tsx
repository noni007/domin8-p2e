
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useAchievements } from '@/hooks/useAchievements';
import { toast } from '@/hooks/use-toast';
import { TournamentRegistrationService } from '@/services/tournamentRegistrationService';
import { WalletTransactionService } from '@/services/walletTransactionService';
import { PayStackService } from '@/services/paystackService';
import type { RegistrationResult } from '@/types/tournamentRegistration';

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

    setIsRegistering(true);

    try {
      // Check if already registered
      const existingRegistration = await TournamentRegistrationService.checkExistingRegistration(
        tournamentId, 
        user.id
      );

      if (existingRegistration) {
        return { success: false, message: "You are already registered for this tournament" };
      }

      // Handle entry fee payment
      if (entryFee > 0) {
        // If user has sufficient wallet balance, use wallet
        if (wallet.balance >= entryFee) {
          // Use wallet balance
          await WalletTransactionService.createWithdrawalTransaction({
            walletId: wallet.id,
            userId: user.id,
            tournamentId,
            entryFee,
            description: 'Tournament Entry Fee'
          });

          await WalletTransactionService.updateWalletBalance(
            wallet.id, 
            wallet.balance - entryFee
          );
        } else {
          // Use PayStack for payment
          const paymentData = {
            email: user.email!,
            amount: entryFee, // amount in kobo
            currency: 'NGN' as const,
            reference: PayStackService.generateReference(),
            metadata: {
              user_id: user.id,
              transaction_type: 'tournament_fee' as const,
              tournament_id: tournamentId
            }
          };

          const paymentResult = await PayStackService.initializePayment(paymentData);
          
          if (paymentResult.status === 'success') {
            // Open PayStack checkout in a new tab
            window.open(paymentResult.data.authorization_url, '_blank');
            
            toast({
              title: "Payment Required",
              description: "Please complete the payment in the new tab to register for the tournament."
            });
            
            return { success: true, message: "Payment initiated. Please complete payment to register." };
          } else {
            return { success: false, message: "Failed to initialize payment. Please try again." };
          }
        }
      }

      // Register for tournament
      await TournamentRegistrationService.registerParticipant(tournamentId, user.id);

      // Add entry fee to tournament prize pool
      if (entryFee > 0) {
        await WalletTransactionService.updateTournamentPrizePool(
          tournamentId,
          entryFee,
          wallet.balance
        );
      }

      // Check for new achievements after registration
      await checkForNewAchievements();

      toast({
        title: "Registration Successful!",
        description: entryFee > 0 
          ? `You've registered for the tournament. Entry fee of ₦${(entryFee / 100).toFixed(2)} has been processed.`
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

  const unregisterFromTournament = async (
    tournamentId: string, 
    entryFee: number = 0
  ): Promise<RegistrationResult> => {
    if (!user) {
      return { success: false, message: "Please log in to unregister" };
    }

    setIsRegistering(true);

    try {
      // Remove registration
      await TournamentRegistrationService.unregisterParticipant(tournamentId, user.id);

      // Refund entry fee if applicable
      if (entryFee > 0 && wallet) {
        // Create refund transaction
        await WalletTransactionService.createRefundTransaction({
          walletId: wallet.id,
          userId: user.id,
          tournamentId,
          entryFee,
          description: 'Tournament Entry Fee Refund'
        });

        // Update wallet balance
        await WalletTransactionService.updateWalletBalance(
          wallet.id, 
          wallet.balance + entryFee
        );

        // Remove entry fee from tournament prize pool
        await WalletTransactionService.updateTournamentPrizePool(
          tournamentId,
          -entryFee,
          wallet.balance
        );
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
