import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useSendTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useWeb3Context } from '@/contexts/Web3Context'
import { toast } from 'sonner'

interface TransactionParams {
  to: string
  amount: string
  tokenAddress?: string
  tournamentId?: string
  matchId?: string
}

interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

export const useCryptoTransactions = () => {
  const { user } = useAuth()
  const { isCryptoPaymentsEnabled, isPolygonEnabled } = useWeb3Context()
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { sendTransaction, isPending } = useSendTransaction()
  
  const [isLoading, setIsLoading] = useState(false)

  // Save transaction to database
  const saveTransaction = useCallback(async (
    hash: string,
    params: TransactionParams,
    type: string,
    status: 'pending' | 'confirmed' | 'failed' = 'pending'
  ) => {
    if (!user || !address) return

    try {
      const { error } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address.toLowerCase(),
          transaction_hash: hash,
          network_id: chainId || 137,
          transaction_type: type,
          amount_wei: parseEther(params.amount).toString(),
          amount_formatted: parseFloat(params.amount),
          token_address: params.tokenAddress || null,
          token_symbol: params.tokenAddress ? 'TOKEN' : 'MATIC',
          status,
          related_tournament_id: params.tournamentId || null,
          related_match_id: params.matchId || null,
          metadata: {
            to: params.to,
            chainId,
          }
        })

      if (error) {
        console.error('Error saving transaction:', error)
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }, [user, address, chainId])

  // Update transaction status
  const updateTransactionStatus = useCallback(async (
    hash: string,
    status: 'confirmed' | 'failed',
    blockNumber?: bigint,
    gasUsed?: bigint
  ) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
        if (blockNumber) updateData.block_number = Number(blockNumber)
        if (gasUsed) updateData.gas_used = Number(gasUsed)
      }

      const { error } = await supabase
        .from('crypto_transactions')
        .update(updateData)
        .eq('transaction_hash', hash)

      if (error) {
        console.error('Error updating transaction status:', error)
      }
    } catch (error) {
      console.error('Error updating transaction status:', error)
    }
  }, [])

  // Send native token (MATIC)
  const sendNativeToken = useCallback(async (params: TransactionParams): Promise<TransactionResult> => {
    if (!isCryptoPaymentsEnabled || !isPolygonEnabled) {
      return { hash: '', success: false, error: 'Crypto payments are disabled' }
    }

    if (!address) {
      return { hash: '', success: false, error: 'Wallet not connected' }
    }

    try {
      setIsLoading(true)

      const hash = await new Promise<string>((resolve, reject) => {
        sendTransaction(
          {
            to: params.to as `0x${string}`,
            value: parseEther(params.amount),
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        )
      })

      await saveTransaction(hash, params, 'tournament_entry')

      // Wait for confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
        
        await updateTransactionStatus(
          hash,
          receipt.status === 'success' ? 'confirmed' : 'failed',
          receipt.blockNumber,
          receipt.gasUsed
        )

        if (receipt.status === 'success') {
          toast.success('Transaction confirmed!')
          return { hash, success: true }
        } else {
          toast.error('Transaction failed')
          return { hash, success: false, error: 'Transaction failed' }
        }
      }

      return { hash, success: true }
    } catch (error: any) {
      console.error('Error sending transaction:', error)
      toast.error(`Transaction failed: ${error.message}`)
      return { hash: '', success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [isCryptoPaymentsEnabled, isPolygonEnabled, sendTransaction, address, publicClient, saveTransaction, updateTransactionStatus])

  // Get transaction history for user
  const getTransactionHistory = useCallback(async (limit = 50) => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching transactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }, [user])

  // Get transaction by hash
  const getTransactionByHash = useCallback(async (hash: string) => {
    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('transaction_hash', hash)
        .single()

      if (error) {
        console.error('Error fetching transaction:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return null
    }
  }, [])

  // Estimate gas for transaction
  const estimateGas = useCallback(async (params: TransactionParams): Promise<string | null> => {
    if (!publicClient || !address) return null

    try {
      const gas = await publicClient.estimateGas({
        account: address,
        to: params.to as `0x${string}`,
        value: parseEther(params.amount),
      })

      // Get current gas price
      const gasPrice = await publicClient.getGasPrice()
      const estimatedCost = gas * gasPrice

      return formatEther(estimatedCost)
    } catch (error) {
      console.error('Error estimating gas:', error)
      return null
    }
  }, [publicClient, address])

  return {
    sendNativeToken,
    getTransactionHistory,
    getTransactionByHash,
    estimateGas,
    isLoading: isLoading || isPending,
    isCryptoPaymentsEnabled,
    isPolygonEnabled,
  }
}