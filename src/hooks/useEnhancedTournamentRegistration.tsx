import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { useWalletActivity } from '@/hooks/useWalletActivity';
import { useAchievements } from '@/hooks/useAchievements';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from '@/hooks/use-toast';
import { TournamentRegistrationService } from '@/services/tournamentRegistrationService';
import { WalletTransactionService } from '@/services/walletTransactionService';
import { PayStackService } from '@/services/paystackService';
import type { RegistrationResult } from '@/types/tournamentRegistration';

export type PaymentMethod = 'wallet' | 'paystack' | 'crypto';

interface PaymentOption {
  method: PaymentMethod;
  available: boolean;
  fee: number; // Additional processing fee
  description: string;
}

export const useEnhancedTournamentRegistration = () => {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { isConnected, address } = useWeb3Wallet();
  const { sendPayment } = useCryptoTransactions();
  const { createTransactionWithActivity } = useWalletActivity();
  const { checkForNewAchievements } = useAchievements();
  const { isFeatureEnabled } = useFeatureFlags();
  
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<PaymentMethod>('wallet');

  const getPaymentOptions = (entryFee: number): PaymentOption[] => {
    const options: PaymentOption[] = [
      {
        method: 'wallet',
        available: wallet ? wallet.balance >= entryFee : false,
        fee: 0,
        description: `Platform wallet (₦${wallet ? (wallet.balance / 100).toFixed(2) : '0.00'} available)`
      },
      {
        method: 'paystack',
        available: true,
        fee: Math.round(entryFee * 0.015), // 1.5% processing fee
        description: 'Credit/Debit card via PayStack'
      }
    ];

    // Add crypto option if Web3 is enabled
    if (isFeatureEnabled('feature_crypto_payments')) {
      options.push({
        method: 'crypto',
        available: isConnected && !!address,
        fee: 0, // Gas fees are separate
        description: isConnected 
          ? `Crypto wallet (${address?.slice(0, 6)}...${address?.slice(-4)})`
          : 'Connect Web3 wallet to use crypto'
      });
    }

    return options;
  };

  const registerWithWallet = async (
    tournamentId: string,
    entryFee: number
  ): Promise<RegistrationResult> => {
    if (!wallet || wallet.balance < entryFee) {
      return { success: false, message: "Insufficient wallet balance" };
    }

    try {
      // Create withdrawal transaction with activity logging
      await createTransactionWithActivity(
        'tournament_fee',
        entryFee,
        `Tournament Entry Fee - ${tournamentId}`,
        { tournament_id: tournamentId }
      );

      // Update wallet balance
      await WalletTransactionService.updateWalletBalance(
        wallet.id, 
        wallet.balance - entryFee
      );

      return { success: true, message: "Payment processed via wallet" };
    } catch (error) {
      console.error('Wallet payment error:', error);
      return { success: false, message: "Wallet payment failed" };
    }
  };

  const registerWithPayStack = async (
    tournamentId: string,
    entryFee: number,
    processingFee: number
  ): Promise<RegistrationResult> => {
    if (!user?.email) {
      return { success: false, message: "User email required for payment" };
    }

    try {
      const totalAmount = entryFee + processingFee;
      
      const paymentData = {
        email: user.email,
        amount: totalAmount,
        currency: 'NGN' as const,
        reference: PayStackService.generateReference(),
        metadata: {
          user_id: user.id,
          transaction_type: 'tournament_fee' as const,
          tournament_id: tournamentId,
          entry_fee: entryFee,
          processing_fee: processingFee
        }
      };

      const paymentResult = await PayStackService.initializePayment(paymentData);
      
      if (paymentResult.status === 'success') {
        window.open(paymentResult.data.authorization_url, '_blank');
        
        toast({
          title: "Payment Required",
          description: "Please complete the payment in the new tab to register for the tournament."
        });
        
        return { 
          success: true, 
          message: "Payment initiated. Complete payment to register.",
          requiresExternalAction: true
        };
      } else {
        return { success: false, message: "Failed to initialize payment" };
      }
    } catch (error) {
      console.error('PayStack payment error:', error);
      return { success: false, message: "Payment initialization failed" };
    }
  };

  const registerWithCrypto = async (
    tournamentId: string,
    entryFee: number
  ): Promise<RegistrationResult> => {
    if (!isConnected || !address) {
      return { success: false, message: "Web3 wallet not connected" };
    }

    try {
      // Convert entry fee to crypto amount (simplified conversion)
      const usdAmount = entryFee / 100;
      const cryptoAmount = (usdAmount * 0.5).toFixed(6); // Mock: 1 USD = 0.5 MATIC

      const result = await sendPayment({
        amount: cryptoAmount,
        token: 'MATIC',
        purpose: `Tournament Entry Fee - ${tournamentId}`,
        tournamentId,
        metadata: {
          usdAmount,
          originalEntryFee: entryFee
        }
      });

      if (result.success) {
        return { 
          success: true, 
          message: "Crypto payment successful",
          transactionHash: result.transactionHash
        };
      } else {
        return { success: false, message: result.error || "Crypto payment failed" };
      }
    } catch (error) {
      console.error('Crypto payment error:', error);
      return { success: false, message: "Crypto payment failed" };
    }
  };

  const registerForTournament = async (
    tournamentId: string,
    tournamentTitle: string,
    entryFee: number = 0,
    paymentMethod: PaymentMethod = selectedPaymentMethod
  ): Promise<RegistrationResult> => {
    if (!user) {
      return { success: false, message: "Please log in to register for tournaments" };
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

      let paymentResult: RegistrationResult = { success: true, message: "Free registration" };

      // Handle entry fee payment based on selected method
      if (entryFee > 0) {
        const paymentOptions = getPaymentOptions(entryFee);
        const selectedOption = paymentOptions.find(opt => opt.method === paymentMethod);

        if (!selectedOption?.available) {
          return { success: false, message: "Selected payment method not available" };
        }

        switch (paymentMethod) {
          case 'wallet':
            paymentResult = await registerWithWallet(tournamentId, entryFee);
            break;
          case 'paystack':
            paymentResult = await registerWithPayStack(tournamentId, entryFee, selectedOption.fee);
            break;
          case 'crypto':
            paymentResult = await registerWithCrypto(tournamentId, entryFee);
            break;
        }

        if (!paymentResult.success) {
          return paymentResult;
        }

        // If payment requires external action (like PayStack), return early
        if (paymentResult.requiresExternalAction) {
          return paymentResult;
        }
      }

      // Register for tournament
      await TournamentRegistrationService.registerParticipant(tournamentId, user.id);

      // Add entry fee to tournament prize pool
      if (entryFee > 0 && wallet) {
        await WalletTransactionService.updateTournamentPrizePool(
          tournamentId,
          entryFee,
          wallet.balance
        );
      }

      // Check for new achievements
      await checkForNewAchievements();

      toast({
        title: "Registration Successful!",
        description: entryFee > 0 
          ? `You've registered for ${tournamentTitle}. Entry fee processed via ${paymentMethod}.`
          : `You've successfully registered for ${tournamentTitle}!`
      });

      return { 
        success: true, 
        message: "Registration successful!",
        transactionHash: paymentResult.transactionHash
      };

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
        await createTransactionWithActivity(
          'refund',
          entryFee,
          `Tournament Entry Fee Refund - ${tournamentId}`,
          { tournament_id: tournamentId }
        );

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
          ? `You've been unregistered and your entry fee of ₦${(entryFee / 100).toFixed(2)} has been refunded.`
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
    isRegistering,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    getPaymentOptions
  };
};