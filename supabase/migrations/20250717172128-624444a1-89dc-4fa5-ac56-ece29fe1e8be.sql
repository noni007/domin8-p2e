-- Phase 1: Web3 Foundation Infrastructure Database Migration

-- Add Web3 feature flags to platform_config
INSERT INTO public.platform_config (key, value, description) VALUES
('feature_web3_wallets', 'false', 'Enable/disable Web3 wallet connection (MetaMask, WalletConnect)'),
('feature_crypto_payments', 'false', 'Enable/disable cryptocurrency payments alongside PayStack'),
('feature_polygon_integration', 'false', 'Enable/disable Polygon network features'),
('feature_smart_contracts', 'false', 'Enable/disable smart contract interactions'),
('feature_platform_token', 'false', 'Enable/disable platform token rewards and staking'),
('feature_nft_achievements', 'false', 'Enable/disable NFT achievement minting'),
('feature_token_staking', 'false', 'Enable/disable token staking features'),
('polygon_network_mode', 'testnet', 'Polygon network mode: testnet (Mumbai) or mainnet'),
('platform_token_address', '', 'Deployed platform token contract address'),
('tournament_escrow_address', '', 'Deployed tournament escrow contract address')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Create user_web3_wallets table for storing connected wallet addresses
CREATE TABLE public.user_web3_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL, -- 'metamask', 'walletconnect', 'coinbase', etc.
  network_id INTEGER NOT NULL DEFAULT 137, -- 137 for Polygon mainnet, 80001 for Mumbai testnet
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, wallet_address, network_id)
);

-- Enable RLS on user_web3_wallets
ALTER TABLE public.user_web3_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_web3_wallets
CREATE POLICY "Users can manage their own Web3 wallets" 
ON public.user_web3_wallets 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all Web3 wallets" 
ON public.user_web3_wallets 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create crypto_transactions table for blockchain transaction tracking
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  network_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'tournament_entry', 'prize_payout', 'token_transfer', 'stake', 'unstake'
  amount_wei TEXT NOT NULL, -- Store as string to handle large numbers
  amount_formatted DECIMAL(20,8) NOT NULL,
  token_address TEXT, -- NULL for native MATIC, contract address for tokens
  token_symbol TEXT NOT NULL DEFAULT 'MATIC',
  gas_used BIGINT,
  gas_price_wei TEXT,
  block_number BIGINT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  related_tournament_id UUID,
  related_match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on crypto_transactions
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for crypto_transactions
CREATE POLICY "Users can view their own crypto transactions" 
ON public.crypto_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto transactions" 
ON public.crypto_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update crypto transactions" 
ON public.crypto_transactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all crypto transactions" 
ON public.crypto_transactions 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create smart_contracts table for contract deployment tracking
CREATE TABLE public.smart_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_name TEXT NOT NULL,
  contract_type TEXT NOT NULL, -- 'tournament_escrow', 'platform_token', 'achievement_nft', 'governance'
  contract_address TEXT NOT NULL,
  network_id INTEGER NOT NULL,
  deployment_transaction_hash TEXT NOT NULL,
  deployer_address TEXT NOT NULL,
  deployed_by_user_id UUID,
  abi_json JSONB NOT NULL,
  bytecode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(contract_address, network_id)
);

-- Enable RLS on smart_contracts
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_contracts
CREATE POLICY "Everyone can view active smart contracts" 
ON public.smart_contracts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage smart contracts" 
ON public.smart_contracts 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_web3_wallets_user_id ON public.user_web3_wallets(user_id);
CREATE INDEX idx_user_web3_wallets_wallet_address ON public.user_web3_wallets(wallet_address);
CREATE INDEX idx_user_web3_wallets_network_id ON public.user_web3_wallets(network_id);

CREATE INDEX idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_hash ON public.crypto_transactions(transaction_hash);
CREATE INDEX idx_crypto_transactions_status ON public.crypto_transactions(status);
CREATE INDEX idx_crypto_transactions_tournament_id ON public.crypto_transactions(related_tournament_id);
CREATE INDEX idx_crypto_transactions_network_id ON public.crypto_transactions(network_id);

CREATE INDEX idx_smart_contracts_address ON public.smart_contracts(contract_address);
CREATE INDEX idx_smart_contracts_type ON public.smart_contracts(contract_type);
CREATE INDEX idx_smart_contracts_network_id ON public.smart_contracts(network_id);

-- Create trigger for updated_at columns
CREATE TRIGGER update_user_web3_wallets_updated_at
BEFORE UPDATE ON public.user_web3_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_transactions_updated_at
BEFORE UPDATE ON public.crypto_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_contracts_updated_at
BEFORE UPDATE ON public.smart_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();