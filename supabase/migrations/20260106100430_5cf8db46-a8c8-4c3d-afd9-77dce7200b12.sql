-- Create atomic wallet balance update function to prevent race conditions
CREATE OR REPLACE FUNCTION public.update_wallet_balance_atomic(
  p_wallet_id UUID,
  p_amount NUMERIC
)
RETURNS TABLE(new_balance NUMERIC) AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  -- Use row-level locking with FOR UPDATE to prevent race conditions
  UPDATE public.user_wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_wallet_id
  RETURNING balance INTO v_new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found: %', p_wallet_id;
  END IF;
  
  RETURN QUERY SELECT v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;