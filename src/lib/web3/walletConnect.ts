
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { supabase } from '@/integrations/supabase/client'

// Project ID - this should be updated with real WalletConnect Project ID
const projectId = 'your-project-id-here' // TODO: Get from platform_config

// Define chains
const chains = [polygon, polygonMumbai] as const

// Create wagmi config
const metadata = {
  name: 'Gamed Platform',
  description: 'Competitive Gaming Tournament Platform',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
}

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// Create modal
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
})

// Get Web3 config from platform settings
export const getWeb3Config = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_config')
      .select('key, value')
      .in('key', [
        'web3_project_id',
        'web3_network_mode',
        'web3_rpc_url_mumbai',
        'web3_rpc_url_polygon'
      ])

    if (error) throw error

    const config: Record<string, any> = {}
    data?.forEach((item) => {
      config[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value
    })

    return config
  } catch (error) {
    console.error('Error loading Web3 config:', error)
    return {}
  }
}
