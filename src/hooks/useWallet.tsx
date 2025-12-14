
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Wallet = Tables<'user_wallets'>;
type Transaction = Tables<'wallet_transactions'>;

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching wallet:', error);
        return;
      }

      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      // Use secure RPC function that filters sensitive metadata
      const { data, error } = await supabase
        .rpc('get_safe_transactions', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      // Map safe_metadata back to metadata for compatibility
      const mappedTransactions = (data || []).map((t: any) => ({
        ...t,
        metadata: t.safe_metadata
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const createTransaction = async (
    type: 'deposit' | 'withdrawal' | 'tournament_fee' | 'prize_payout' | 'refund',
    amount: number,
    description: string,
    metadata?: any
  ) => {
    if (!user || !wallet) {
      toast({
        title: "Error",
        description: "Wallet not found",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: user.id,
          transaction_type: type,
          amount,
          description,
          metadata,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchWallet();
      await fetchTransactions();

      toast({
        title: "Transaction Created",
        description: description,
      });

      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
      return null;
    }
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return {
    wallet,
    transactions,
    loading,
    createTransaction,
    formatAmount,
    refetch: () => {
      fetchWallet();
      fetchTransactions();
    }
  };
};
