import { supabase } from '@/integrations/supabase/client'

// Placeholder config - Web3 features are temporarily disabled
// These will be properly configured when Web3 features are enabled
export const config = null

// Placeholder modal
export const web3Modal = null

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

    const configData: Record<string, any> = {}
    data?.forEach((item) => {
      configData[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value
    })

    return configData
  } catch (error) {
    console.error('Error loading Web3 config:', error)
    return {}
  }
}
