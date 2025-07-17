import React, { createContext, useContext, useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { config } from '@/lib/web3/config'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'

// Create a client
const queryClient = new QueryClient()

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: 'your-project-id', // TODO: Add to platform config
  enableAnalytics: true,
  enableOnramp: true,
})

interface Web3ContextType {
  isWeb3Enabled: boolean
  isCryptoPaymentsEnabled: boolean
  isPolygonEnabled: boolean
  isSmartContractsEnabled: boolean
}

const Web3Context = createContext<Web3ContextType>({
  isWeb3Enabled: false,
  isCryptoPaymentsEnabled: false,
  isPolygonEnabled: false,
  isSmartContractsEnabled: false,
})

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: React.ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { flags, isFeatureEnabled } = useFeatureFlags()
  const [contextValue, setContextValue] = useState<Web3ContextType>({
    isWeb3Enabled: false,
    isCryptoPaymentsEnabled: false,
    isPolygonEnabled: false,
    isSmartContractsEnabled: false,
  })

  useEffect(() => {
    setContextValue({
      isWeb3Enabled: isFeatureEnabled('feature_web3_wallets'),
      isCryptoPaymentsEnabled: isFeatureEnabled('feature_crypto_payments'),
      isPolygonEnabled: isFeatureEnabled('feature_polygon_integration'),
      isSmartContractsEnabled: isFeatureEnabled('feature_smart_contracts'),
    })
  }, [flags, isFeatureEnabled])

  // If Web3 features are disabled, provide a simple context without Wagmi
  if (!contextValue.isWeb3Enabled) {
    return (
      <Web3Context.Provider value={contextValue}>
        {children}
      </Web3Context.Provider>
    )
  }

  // If Web3 features are enabled, wrap with Wagmi providers
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