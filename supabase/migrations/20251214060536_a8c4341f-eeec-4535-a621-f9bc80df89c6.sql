-- Phase 1: Fix Email Exposure in Profiles
-- Create a secure function to get profile data without exposing email to non-owners

CREATE OR REPLACE FUNCTION public.get_safe_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  user_type text,
  avatar_url text,
  bio text,
  skill_rating integer,
  win_rate numeric,
  games_played integer,
  current_streak integer,
  best_streak integer,
  created_at timestamp with time zone,
  email text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.user_type,
    p.avatar_url,
    p.bio,
    p.skill_rating,
    p.win_rate,
    p.games_played,
    p.current_streak,
    p.best_streak,
    p.created_at,
    -- Only return email if viewing own profile or is admin
    CASE 
      WHEN auth.uid() = p.id OR check_admin_role(auth.uid(), 'admin') THEN p.email
      ELSE NULL
    END as email
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$;

-- Phase 2: Fix Social Integration Token Exposure
-- Update the function to NOT return sensitive tokens to the client

CREATE OR REPLACE FUNCTION public.get_user_social_integrations_safe(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  platform text,
  platform_user_id text,
  platform_username text,
  expires_at timestamp with time zone,
  integration_data jsonb,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use the calling user's ID if no target specified
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Only allow users to access their own integrations
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Access denied: Users can only access their own social integrations';
  END IF;
  
  -- Return data WITHOUT access_token and refresh_token
  RETURN QUERY
  SELECT 
    si.id,
    si.user_id,
    si.platform,
    si.platform_user_id,
    si.platform_username,
    si.expires_at,
    si.integration_data,
    si.is_active,
    si.created_at,
    si.updated_at
  FROM social_integrations si
  WHERE si.user_id = target_user_id;
END;
$$;

-- Phase 3: Filter Wallet Transaction Metadata
-- Create secure function that filters out sensitive payment details

CREATE OR REPLACE FUNCTION public.get_safe_transactions(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  wallet_id uuid,
  user_id uuid,
  transaction_type text,
  amount integer,
  description text,
  status text,
  reference_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  safe_metadata jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Default to current user if not specified
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;
  
  -- Only allow users to view their own transactions (or admins to view all)
  IF auth.uid() != p_user_id AND NOT check_admin_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Users can only view their own transactions';
  END IF;
  
  RETURN QUERY
  SELECT 
    wt.id,
    wt.wallet_id,
    wt.user_id,
    wt.transaction_type,
    wt.amount,
    wt.description,
    wt.status,
    wt.reference_id,
    wt.created_at,
    wt.updated_at,
    -- Filter metadata to only include safe fields
    jsonb_build_object(
      'tournament_id', wt.metadata->>'tournament_id',
      'achievement_id', wt.metadata->>'achievement_id',
      'match_id', wt.metadata->>'match_id',
      'commission_rate', wt.metadata->>'commission_rate'
    ) as safe_metadata
  FROM wallet_transactions wt
  WHERE wt.user_id = p_user_id
  ORDER BY wt.created_at DESC;
END;
$$;

-- Phase 4: Create public tournament view with safe organizer data
-- Create a function to get tournaments with organizer username instead of UUID

CREATE OR REPLACE FUNCTION public.get_public_tournaments(
  p_status text DEFAULT NULL,
  p_game text DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  game text,
  status text,
  prize_pool integer,
  entry_fee integer,
  max_participants integer,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  registration_deadline timestamp with time zone,
  tournament_type text,
  bracket_generated boolean,
  created_at timestamp with time zone,
  organizer_username text,
  participant_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.game,
    t.status,
    t.prize_pool,
    t.entry_fee,
    t.max_participants,
    t.start_date,
    t.end_date,
    t.registration_deadline,
    t.tournament_type,
    t.bracket_generated,
    t.created_at,
    p.username as organizer_username,
    (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as participant_count
  FROM tournaments t
  LEFT JOIN profiles p ON t.organizer_id = p.id
  WHERE (p_status IS NULL OR t.status = p_status)
    AND (p_game IS NULL OR t.game = p_game)
  ORDER BY t.created_at DESC
  LIMIT p_limit;
END;
$$;