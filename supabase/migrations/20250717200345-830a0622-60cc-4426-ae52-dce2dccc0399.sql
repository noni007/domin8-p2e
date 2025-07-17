
-- Enable all Web3 features for testing
INSERT INTO public.platform_config (key, value, description) VALUES
  ('feature_web3_wallets', 'true', 'Enable Web3 wallet connections'),
  ('feature_crypto_payments', 'true', 'Enable cryptocurrency payments'),
  ('feature_polygon_integration', 'true', 'Enable Polygon blockchain integration'),
  ('feature_smart_contracts', 'true', 'Enable smart contract deployment and management'),
  ('feature_platform_token', 'true', 'Enable platform token functionality'),
  ('feature_nft_achievements', 'true', 'Enable NFT-based achievements'),
  ('feature_token_staking', 'true', 'Enable token staking features'),
  ('web3_network_mode', 'testnet', 'Web3 network mode (testnet/mainnet)'),
  ('web3_project_id', 'your-project-id-here', 'WalletConnect Project ID'),
  ('web3_rpc_url_mumbai', 'https://rpc-mumbai.maticvigil.com/', 'Mumbai testnet RPC URL'),
  ('web3_rpc_url_polygon', 'https://polygon-rpc.com/', 'Polygon mainnet RPC URL'),
  ('web3_contract_tournament_escrow', '0x0000000000000000000000000000000000000000', 'Tournament escrow contract address'),
  ('web3_contract_platform_token', '0x0000000000000000000000000000000000000000', 'Platform token contract address'),
  ('web3_contract_achievement_nft', '0x0000000000000000000000000000000000000000', 'Achievement NFT contract address')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();
