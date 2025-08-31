
-- 1) USER WALLETS: remove overly-permissive policy
alter table public.user_wallets enable row level security;

drop policy if exists "System can manage wallets" on public.user_wallets;

-- Keep existing (already present per schema):
-- - "Users can view own wallet" (SELECT using user_id = auth.uid())
-- - "Admins can view all wallets" (ALL using is_admin(auth.uid()))
-- Inserts/updates/deletes should be performed by backend (service role / SEC. DEFINER fns)


-- 2) WALLET TRANSACTIONS: remove permissive policy and add safe INSERT policy
drop policy if exists "System can manage transactions" on public.wallet_transactions;

-- Allow users to create only their own pending transactions for their own wallet
create policy "Users can create pending transactions for own wallet"
  on public.wallet_transactions
  for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and wallet_id in (
      select id from public.user_wallets where user_id = auth.uid()
    )
  );

-- Keep existing (already present per schema):
-- - "Users can view own transactions" (SELECT using user_id = auth.uid())
-- - "Admins can view all transactions" (ALL using is_admin(auth.uid()))
-- Updates to status (e.g., completing/failed) should be done by backend/service role


-- 3) CRYPTO TRANSACTIONS: remove permissive update policy
drop policy if exists "System can update crypto transactions" on public.crypto_transactions;

-- Keep existing (already present per schema):
-- - "Users can create their own crypto transactions" (INSERT with check user_id = auth.uid())
-- - "Users can view their own crypto transactions" (SELECT using user_id = auth.uid())
-- - "Admins can view all crypto transactions" (SELECT using is_admin(auth.uid()))
-- Updates should be performed by backend/service role only
