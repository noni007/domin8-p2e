import React from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useWeb3Context } from '@/contexts/Web3Context'
import { toast } from 'sonner'

interface Web3WalletState {
  address: string | null
  isConnected: boolean
  isLoading: boolean
  balance: string | null
  chainId: number | null
  networkName: string | null
}

/**
 * NOTE: Web3 dependencies (wagmi / @web3modal) are currently disabled because they
 * triggered a runtime ESM error in this project.
 *
 * This hook intentionally avoids importing those packages at module scope so the app
 * can boot without a blank screen.
 */
export const useWeb3Wallet = () => {
  const { user } = useAuth()
  const { isWeb3Enabled } = useWeb3Context()

  const [walletState, setWalletState] = React.useState<Web3WalletState>({
    address: null,
    isConnected: false,
    isLoading: false,
    balance: null,
    chainId: null,
    networkName: null,
  })

  React.useEffect(() => {
    if (!isWeb3Enabled) {
      setWalletState({
        address: null,
        isConnected: false,
        isLoading: false,
        balance: null,
        chainId: null,
        networkName: null,
      })
    }
  }, [isWeb3Enabled])

  const connectWallet = async () => {
    if (!isWeb3Enabled) {
      toast.error('Web3 features are currently disabled')
      return
    }

    if (!user) {
      toast.error('Please sign in to connect your wallet')
      return
    }

    toast.error('Web3 wallet integration is not configured yet')
  }

  const disconnectWallet = async () => {
    setWalletState({
      address: null,
      isConnected: false,
      isLoading: false,
      balance: null,
      chainId: null,
      networkName: null,
    })
    toast.success('Wallet disconnected')
  }

  const getUserWallets = async () => {
    if (!user || !isWeb3Enabled) return []

    try {
      const { data, error } = await supabase
        .from('user_web3_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_used_at', { ascending: false })

      if (error) {
        console.error('Error fetching user wallets:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user wallets:', error)
      return []
    }
  }

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getUserWallets,
    isWeb3Enabled,
  }
}
