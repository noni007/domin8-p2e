
export const NETWORKS = {
  POLYGON_MAINNET: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://polygon-rpc.com/'] },
      public: { http: ['https://polygon-rpc.com/'] },
    },
    blockExplorer: 'https://polygonscan.com',
  },
  POLYGON_MUMBAI: {
    id: 80001,
    name: 'Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://rpc-mumbai.maticvigil.com/'] },
      public: { http: ['https://rpc-mumbai.maticvigil.com/'] },
    },
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
} as const

export const SUPPORTED_TOKENS = {
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    address: null, // Native token
    icon: '🔷',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // Polygon USDC
    icon: '💵',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // Polygon USDT
    icon: '💰',
  },
} as const

export const SMART_CONTRACT_ADDRESSES = {
  TOURNAMENT_ESCROW: '0x0000000000000000000000000000000000000000', // Placeholder
  PLATFORM_TOKEN: '0x0000000000000000000000000000000000000000', // Placeholder
  ACHIEVEMENT_NFT: '0x0000000000000000000000000000000000000000', // Placeholder
} as const

export const DEFAULT_GAS_LIMIT = 500000
export const DEFAULT_GAS_PRICE = '20000000000' // 20 gwei
