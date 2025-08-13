-- Secure profiles table and add public non-sensitive access via RPC

-- 1) Ensure RLS is enabled and remove any overly permissive existing policies
DO $$
BEGIN
  -- Enable RLS on profiles
  EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Drop all existing policies on profiles to avoid conflicting permissive ones
DO $$
DECLARE p record;
BEGIN
  FOR p IN (
    SELECT polname FROM pg_policy WHERE polrelid = 'public.profiles'::regclass
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', p.polname);
  END LOOP;
END $$;

-- 2) Create strict policies
-- Users can view their own profile, friends' profiles, or if they are admins
CREATE POLICY "Users can view own or friends profiles or admins all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR public.check_admin_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE (f.user_id = auth.uid() AND f.friend_id = profiles.id)
       OR (f.friend_id = auth.uid() AND f.user_id = profiles.id)
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- (Optional) allow inserts only for the system (triggers run as definer). We do not grant INSERT to clients.

-- 3) Create a SECURITY DEFINER function exposing only non-sensitive public profile fields
-- This allows lists like leaderboards and discovery without exposing emails/bios
CREATE OR REPLACE FUNCTION public.get_public_profiles(search_term text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  username text,
  user_type text,
  avatar_url text,
  skill_rating integer,
  win_rate numeric,
  games_played integer,
  current_streak integer,
  best_streak integer,
  created_at timestamptz
) AS $$
  SELECT 
    p.id,
    p.username,
    p.user_type,
    p.avatar_url,
    p.skill_rating,
    p.win_rate,
    p.games_played,
    p.current_streak,
    p.best_streak,
    p.created_at
  FROM public.profiles p
  WHERE (search_term IS NULL OR p.username ILIKE ('%' || search_term || '%'))
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- 4) Grant execute to anon and authenticated (to allow public directories/leaderboards)
GRANT EXECUTE ON FUNCTION public.get_public_profiles(text) TO anon, authenticated;
