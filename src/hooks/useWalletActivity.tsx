
import { useWallet } from '@/hooks/useWallet';
import { createActivity } from '@/utils/activityHelpers';
import { useAuth } from '@/hooks/useAuth';

export const useWalletActivity = () => {
  const { user } = useAuth();
  const wallet = useWallet();

  const logWalletTransaction = async (
    type: 'deposit' | 'withdrawal' | 'tournament_fee' | 'prize_payout' | 'refund',
    amount: number,
    description: string,
    metadata?: any
  ) => {
    if (!user) return;

    const activityTitles = {
      deposit: '💰 Wallet Deposit',
      withdrawal: '💸 Wallet Withdrawal',
      tournament_fee: '🎮 Tournament Entry Fee',
      prize_payout: '🏆 Prize Payout Received',
      refund: '💰 Refund Processed'
    };

    await createActivity({
      userId: user.id,
      activityType: 'wallet_transaction' as any,
      title: activityTitles[type],
      description: `${description} - $${(amount / 100).toFixed(2)}`,
      metadata: { 
        transactionType: type, 
        amount, 
        ...metadata 
      }
    });
  };

  const createTransactionWithActivity = async (
    type: 'deposit' | 'withdrawal' | 'tournament_fee' | 'prize_payout' | 'refund',
    amount: number,
    description: string,
    metadata?: any
  ) => {
    // Create the transaction
    const transaction = await wallet.createTransaction(type, amount, description, metadata);
    
    // Log the activity
    if (transaction) {
      await logWalletTransaction(type, amount, description, metadata);
    }
    
    return transaction;
  };

  return {
    ...wallet,
    logWalletTransaction,
    createTransactionWithActivity
  };
};
