
import React, { createContext, useContext } from 'react'

interface Web3ContextType {
  isWeb3Enabled: boolean
  isCryptoPaymentsEnabled: boolean
  isPolygonEnabled: boolean
  isSmartContractsEnabled: boolean
}

export const Web3Context = createContext<Web3ContextType>({
  isWeb3Enabled: false,
  isCryptoPaymentsEnabled: false,
  isPolygonEnabled: false,
  isSmartContractsEnabled: false
})

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3Context must be used within Web3Provider')
  }
  return context
}
