import { polygon, polygonMumbai } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

// Web3Modal Project ID - This should be set via environment or platform config
const projectId = 'your-project-id' // TODO: Add to platform config

// Define chains based on environment
export const chains = [polygon, polygonMumbai] as const

// Wagmi configuration
export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Gaming Platform',
        description: 'Web3 Gaming Tournament Platform',
        url: 'https://yourplatform.com',
        icons: ['https://yourplatform.com/icon.png']
      }
    }),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
  ssr: false,
})

// Network configurations
export const NETWORKS = {
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  POLYGON_MUMBAI: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
} as const

// Contract addresses (will be populated from platform config)
export const CONTRACT_ADDRESSES = {
  TOURNAMENT_ESCROW: '',
  PLATFORM_TOKEN: '',
  ACHIEVEMENT_NFT: '',
} as const

// Token configurations
export const SUPPORTED_TOKENS = {
  MATIC: {
    symbol: 'MATIC',
    decimals: 18,
    address: null, // Native token
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  },
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT
  },
} as const

// Gas settings
export const GAS_SETTINGS = {
  DEFAULT_GAS_LIMIT: 21000n,
  TOKEN_TRANSFER_GAS_LIMIT: 100000n,
  CONTRACT_INTERACTION_GAS_LIMIT: 300000n,
  MAX_PRIORITY_FEE_PER_GAS: 30000000000n, // 30 gwei
} as const