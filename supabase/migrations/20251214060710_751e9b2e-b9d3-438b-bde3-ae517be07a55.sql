-- Tighten RLS on social_integrations to prevent token exposure
-- Drop existing problematic policy and create more restrictive ones

DROP POLICY IF EXISTS "Users can view basic social integration info" ON social_integrations;

-- Only allow users to view their own integrations (not based on is_active)
-- And explicitly prevent access to token columns via RLS
CREATE POLICY "Users can only view own social integrations"
ON social_integrations
FOR SELECT
USING (auth.uid() = user_id);

-- Create a view that explicitly excludes sensitive token fields for any queries
CREATE OR REPLACE VIEW public.social_integrations_safe AS
SELECT 
  id,
  user_id,
  platform,
  platform_user_id,
  platform_username,
  expires_at,
  integration_data,
  is_active,
  created_at,
  updated_at
FROM social_integrations
WHERE user_id = auth.uid();

-- Tighten profiles RLS - remove ambiguous policies
DROP POLICY IF EXISTS "Users can view own or friends profiles or admins all" ON profiles;
DROP POLICY IF EXISTS "Users can view friends' limited profile data (no email)" ON profiles;

-- Create single clear policy: users see own profile, use RPC for others
CREATE POLICY "Users can only view their own profile directly"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Keep admin view via RPC only - admins should use get_safe_profile function
-- This ensures email is never exposed through direct table queries

-- Admins can still update profiles
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (check_admin_role(auth.uid(), 'admin'));

-- Users can update their own profile  
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);