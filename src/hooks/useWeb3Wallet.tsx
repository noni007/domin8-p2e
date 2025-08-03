import React from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useWeb3Context } from '@/contexts/Web3Context'
import { NETWORKS } from '@/lib/web3/config'
import { toast } from 'sonner'

interface Web3WalletState {
  address: string | null
  isConnected: boolean
  isLoading: boolean
  balance: string | null
  chainId: number | null
  networkName: string | null
}

export const useWeb3Wallet = () => {
  const { user } = useAuth()
  const { isWeb3Enabled } = useWeb3Context()
  const { open } = useWeb3Modal()
  
  // Wagmi hooks (only work when Web3 is enabled)
  const { address, isConnected: wagmiConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })

  const [walletState, setWalletState] = React.useState<Web3WalletState>({
    address: null,
    isConnected: false,
    isLoading: false,
    balance: null,
    chainId: null,
    networkName: null,
  })

  // Update wallet state when Web3 data changes
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
      return
    }

    const networkName = chainId === 137 
      ? NETWORKS.POLYGON_MAINNET.name 
      : chainId === 80001 
      ? NETWORKS.POLYGON_MUMBAI.name 
      : 'Unknown'

    setWalletState({
      address: address || null,
      isConnected: wagmiConnected,
      isLoading: false,
      balance: balance ? `${balance.formatted} ${balance.symbol}` : null,
      chainId: chainId || null,
      networkName,
    })
  }, [isWeb3Enabled, address, wagmiConnected, balance, chainId])

  // Save wallet connection to database
  const saveWalletConnection = async (walletAddress: string, walletType: string) => {
    if (!user || !isWeb3Enabled) return

    try {
      const { error } = await supabase
        .from('user_web3_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress.toLowerCase(),
          wallet_type: walletType,
          network_id: chainId || 137,
          is_primary: true,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,wallet_address,network_id'
        })

      if (error) {
        console.error('Error saving wallet connection:', error)
        toast.error('Failed to save wallet connection')
      } else {
        toast.success('Wallet connected successfully!')
      }
    } catch (error) {
      console.error('Error saving wallet connection:', error)
      toast.error('Failed to save wallet connection')
    }
  }

  // Remove wallet connection from database
  const removeWalletConnection = async () => {
    if (!user || !address || !isWeb3Enabled) return

    try {
      const { error } = await supabase
        .from('user_web3_wallets')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('wallet_address', address.toLowerCase())

      if (error) {
        console.error('Error removing wallet connection:', error)
      }
    } catch (error) {
      console.error('Error removing wallet connection:', error)
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    if (!isWeb3Enabled) {
      toast.error('Web3 features are currently disabled')
      return
    }

    if (!user) {
      toast.error('Please sign in to connect your wallet')
      return
    }

    try {
      setWalletState(prev => ({ ...prev, isLoading: true }))
      open()
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
      setWalletState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (!isWeb3Enabled) return

    try {
      await removeWalletConnection()
      disconnect()
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  // Handle successful connection
  React.useEffect(() => {
    if (wagmiConnected && address && user && isWeb3Enabled) {
      // Determine wallet type based on connector
      const walletType = 'unknown' // TODO: Determine from connector
      saveWalletConnection(address, walletType)
    }
  }, [wagmiConnected, address, user, isWeb3Enabled])

  // Get user's saved wallets
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