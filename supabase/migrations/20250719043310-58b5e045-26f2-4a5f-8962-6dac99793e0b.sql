-- Add Web3 configuration settings to platform_config
INSERT INTO public.platform_config (key, value, description) VALUES
  ('web3_project_id', '"PLACEHOLDER_PROJECT_ID"', 'WalletConnect Project ID - replace with real project ID'),
  ('web3_network_mode', '"testnet"', 'Web3 network mode: testnet or mainnet'),
  ('web3_rpc_url_mumbai', '"https://rpc-mumbai.maticvigil.com"', 'RPC URL for Polygon Mumbai testnet'),
  ('web3_rpc_url_polygon', '"https://polygon-rpc.com"', 'RPC URL for Polygon mainnet'),
  ('platform_commission_rate', '0.10', 'Platform commission rate (10%)')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();