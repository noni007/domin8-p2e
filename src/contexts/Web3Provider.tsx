
import React, { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/web3/walletConnect'
import { Web3Context } from './Web3Context'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { isFeatureEnabled } = useFeatureFlags()
  
  const isWeb3Enabled = isFeatureEnabled('feature_web3_wallets')
  const isCryptoPaymentsEnabled = isFeatureEnabled('feature_crypto_payments')
  const isPolygonEnabled = isFeatureEnabled('feature_polygon_integration')
  const isSmartContractsEnabled = isFeatureEnabled('feature_smart_contracts')

  const contextValue = {
    isWeb3Enabled,
    isCryptoPaymentsEnabled,
    isPolygonEnabled,
    isSmartContractsEnabled
  }

  if (!isWeb3Enabled) {
    return (
      <Web3Context.Provider value={contextValue}>
        {children}
      </Web3Context.Provider>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3Context.Provider value={contextValue}>
          {children}
        </Web3Context.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
