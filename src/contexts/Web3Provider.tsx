import { ReactNode } from 'react'
import { Web3Context } from './Web3Context'

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
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
