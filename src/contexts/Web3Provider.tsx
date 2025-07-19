
import React, { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/web3/walletConnect'
import { Web3Context } from './Web3Context'

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Temporarily disable Web3 features to avoid hook call issues
  // These will be enabled based on feature flags once the app loads properly
  const contextValue = {
    isWeb3Enabled: false,
    isCryptoPaymentsEnabled: false,
    isPolygonEnabled: false,
    isSmartContractsEnabled: false
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}
