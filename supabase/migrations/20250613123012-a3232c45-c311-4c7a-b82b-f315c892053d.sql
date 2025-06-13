
-- Create feature waitlist table
CREATE TABLE public.feature_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature_name TEXT NOT NULL DEFAULT 'historical_stats_upload',
  join_position INTEGER NOT NULL,
  referral_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waitlist milestones table
CREATE TABLE public.waitlist_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  milestone_count INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'badge',
  unlocked_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for feature waitlist
ALTER TABLE public.feature_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (for joining waitlist)
CREATE POLICY "Anyone can join waitlist" 
  ON public.feature_waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow users to view waitlist stats (count only)
CREATE POLICY "Anyone can view waitlist stats" 
  ON public.feature_waitlist 
  FOR SELECT 
  USING (true);

-- Add RLS policies for milestones
ALTER TABLE public.waitlist_milestones ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view milestones
CREATE POLICY "Anyone can view milestones" 
  ON public.waitlist_milestones 
  FOR SELECT 
  USING (true);

-- Policy to allow admins to manage milestones
CREATE POLICY "Admins can manage milestones" 
  ON public.waitlist_milestones 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create unique constraint to prevent duplicate emails per feature
CREATE UNIQUE INDEX feature_waitlist_email_feature_idx 
  ON public.feature_waitlist (email, feature_name);

-- Insert initial milestones for historical stats upload feature
INSERT INTO public.waitlist_milestones (feature_name, milestone_count, title, description, reward_type) VALUES
  ('historical_stats_upload', 25, 'Early Adopters', 'First 25 users get exclusive beta access', 'early_access'),
  ('historical_stats_upload', 100, 'Community Champions', 'Help us reach 100 sign-ups!', 'badge'),
  ('historical_stats_upload', 250, 'Feature Unlocked!', 'Minimum threshold reached - development begins', 'feature_unlock'),
  ('historical_stats_upload', 500, 'Super Supporters', 'Premium feature access for all supporters', 'premium_access');

-- Function to get current waitlist position
CREATE OR REPLACE FUNCTION public.get_waitlist_position(user_email TEXT, feature TEXT DEFAULT 'historical_stats_upload')
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT join_position 
  FROM public.feature_waitlist 
  WHERE email = user_email AND feature_name = feature;
$$;

-- Function to get waitlist stats
CREATE OR REPLACE FUNCTION public.get_waitlist_stats(feature TEXT DEFAULT 'historical_stats_upload')
RETURNS TABLE (
  total_count INTEGER,
  progress_to_next_milestone INTEGER,
  next_milestone_target INTEGER,
  next_milestone_title TEXT
)
LANGUAGE sql
STABLE
AS $$
  WITH stats AS (
    SELECT COUNT(*)::INTEGER as total
    FROM public.feature_waitlist 
    WHERE feature_name = feature
  ),
  next_milestone AS (
    SELECT milestone_count, title
    FROM public.waitlist_milestones 
    WHERE feature_name = feature 
      AND milestone_count > (SELECT total FROM stats)
      AND unlocked_at IS NULL
    ORDER BY milestone_count ASC
    LIMIT 1
  )
  SELECT 
    s.total,
    s.total as progress_to_next_milestone,
    COALESCE(m.milestone_count, 500) as next_milestone_target,
    COALESCE(m.title, 'Maximum Goal') as next_milestone_title
  FROM stats s
  LEFT JOIN next_milestone m ON true;
$$;
