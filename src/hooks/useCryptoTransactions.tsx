
import React from 'react'
import { parseEther } from 'viem'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useWeb3Wallet } from './useWeb3Wallet'
import { toast } from 'sonner'

interface SendPaymentParams {
  amount: string
  token: string
  purpose: string
  tournamentId?: string
  matchId?: string
  metadata?: any
}

interface PaymentResult {
  success: boolean
  transactionHash: string
  error?: string
}

export const useCryptoTransactions = () => {
  const { user } = useAuth()
  const { address, chainId, isWeb3Enabled } = useWeb3Wallet()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const estimateGas = async (_params: { to: string; amount: string }) => {
    try {
      return '0.001'
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return '0.002'
    }
  }

  const sendPayment = async (params: SendPaymentParams): Promise<PaymentResult> => {
    if (!isWeb3Enabled) {
      return { success: false, transactionHash: '', error: 'Web3 is disabled' }
    }

    if (!user || !address) {
      return { success: false, transactionHash: '', error: 'Wallet not connected' }
    }

    setIsProcessing(true)
    try {
      // For demo purposes, simulate a transaction hash and store it.
      const mockTransactionHash = `0x${Math.random().toString(16).substring(2, 66)}`

      const { error } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address,
          transaction_hash: mockTransactionHash,
          network_id: chainId || 80001,
          transaction_type: params.purpose,
          amount_wei: parseEther(params.amount).toString(),
          amount_formatted: parseFloat(params.amount),
          token_symbol: params.token,
          status: 'confirmed',
          related_tournament_id: params.tournamentId,
          related_match_id: params.matchId,
          metadata: params.metadata || {},
        })

      if (error) throw error

      toast.success('Payment processed successfully!')
      return { success: true, transactionHash: mockTransactionHash }
    } catch (error) {
      console.error('Payment failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      return { success: false, transactionHash: '', error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }

  const getUserTransactions = async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch crypto transactions:', error)
      return []
    }
  }

  return {
    sendPayment,
    getUserTransactions,
    estimateGas,
    isProcessing,
  }
}

