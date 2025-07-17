-- Fix infinite recursion in admin_roles and add missing RLS policies

-- First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

-- Drop existing policies on platform_config that also cause recursion
DROP POLICY IF EXISTS "Admins can view platform config" ON public.platform_config;
DROP POLICY IF EXISTS "Super admins can manage platform config" ON public.platform_config;

-- Create a security definer function to safely check admin roles without recursion
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id_param uuid, required_role text DEFAULT 'admin')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = user_id_param 
    AND (
      admin_roles.role = required_role OR
      admin_roles.role = 'super_admin' OR
      (required_role = 'admin' AND admin_roles.role IN ('admin', 'moderator', 'super_admin'))
    )
  );
$$;

-- Create a simpler function for the existing is_admin function to use
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.check_admin_role(user_id, 'admin');
$$;

-- Enable RLS on admin_roles (was missing)
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create safe RLS policies for admin_roles using the security definer function
CREATE POLICY "Admins can view admin roles safely" 
ON public.admin_roles 
FOR SELECT 
USING (public.check_admin_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can insert admin roles safely" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (public.check_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update admin roles safely" 
ON public.admin_roles 
FOR UPDATE 
USING (public.check_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete admin roles safely" 
ON public.admin_roles 
FOR DELETE 
USING (public.check_admin_role(auth.uid(), 'super_admin'));

-- Enable RLS on platform_config (was missing)
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Create safe RLS policies for platform_config
CREATE POLICY "Admins can view platform config safely" 
ON public.platform_config 
FOR SELECT 
USING (public.check_admin_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can manage platform config safely" 
ON public.platform_config 
FOR ALL 
USING (public.check_admin_role(auth.uid(), 'super_admin'))
WITH CHECK (public.check_admin_role(auth.uid(), 'super_admin'));

-- Enable RLS on admin_audit_log if not already enabled
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Update admin_audit_log policies to use the safe function
DROP POLICY IF EXISTS "Admins can view audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.admin_audit_log;

CREATE POLICY "Admins can view audit log safely" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.check_admin_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log safely" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (public.check_admin_role(auth.uid(), 'admin'));

-- Ensure other tables that use is_admin function are updated
-- Update existing policies that might be using the old is_admin function
-- These should now work properly with the updated security definer function

-- Add RLS to tables that are missing it
ALTER TABLE public.live_match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_rating_history ENABLE ROW LEVEL SECURITY;

-- Add basic policies for these tables
CREATE POLICY "Everyone can view live match sessions" 
ON public.live_match_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can join as spectators" 
ON public.match_spectators 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view match events" 
ON public.match_events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own session analytics" 
ON public.user_session_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all session analytics" 
ON public.user_session_analytics 
FOR ALL 
USING (public.check_admin_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view tournament analytics" 
ON public.tournament_analytics 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view forum categories" 
ON public.forum_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view forum posts" 
ON public.forum_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create forum posts" 
ON public.forum_posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" 
ON public.forum_posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Everyone can view forum replies" 
ON public.forum_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create replies" 
ON public.forum_replies 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies" 
ON public.forum_replies 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can view their own skill rating history" 
ON public.skill_rating_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view skill rating history" 
ON public.skill_rating_history 
FOR SELECT 
USING (true);