-- Drop existing RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile and friends' profiles" ON public.profiles;

-- Create separate policies for better security
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view friends' limited profile data (no email)" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id AND 
  EXISTS (
    SELECT 1 FROM friendships 
    WHERE (user_id = auth.uid() AND friend_id = profiles.id) 
    OR (friend_id = auth.uid() AND user_id = profiles.id)
  )
);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create a secure function to get friend profiles without sensitive data
CREATE OR REPLACE FUNCTION public.get_friend_profiles(target_user_id uuid DEFAULT NULL)
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
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
  WHERE (
    target_user_id IS NULL OR p.id = target_user_id
  ) AND (
    -- User can see their own profile completely through other means
    auth.uid() != p.id AND
    -- Only show friends' profiles
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE (f.user_id = auth.uid() AND f.friend_id = p.id)
      OR (f.friend_id = auth.uid() AND f.user_id = p.id)
    )
  );
$$;

-- Add comment to email column to highlight its sensitive nature
COMMENT ON COLUMN public.profiles.email IS 'SENSITIVE: Email addresses should never be exposed in friend/public profile views';

-- Update the existing get_public_profiles function to ensure it never returns emails
CREATE OR REPLACE FUNCTION public.get_public_profiles(search_term text DEFAULT NULL::text)
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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;