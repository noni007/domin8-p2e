
-- Add skill rating system and enhanced match tracking
ALTER TABLE profiles ADD COLUMN skill_rating INTEGER DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN games_played INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN win_rate DECIMAL DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN best_streak INTEGER DEFAULT 0;

-- Create skill rating history table
CREATE TABLE public.skill_rating_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  rating_change INTEGER NOT NULL,
  match_id UUID,
  tournament_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live match sessions table
CREATE TABLE public.live_match_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  spectator_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match spectators table
CREATE TABLE public.match_spectators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create match events table for real-time updates
CREATE TABLE public.match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create community forums table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics tables
CREATE TABLE public.user_session_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  pages_visited INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tournament_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL,
  total_participants INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  average_match_duration INTERVAL,
  completion_rate DECIMAL DEFAULT 0.0,
  spectator_engagement JSONB DEFAULT '{}',
  revenue_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE skill_rating_history ADD CONSTRAINT fk_skill_rating_user FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE live_match_sessions ADD CONSTRAINT fk_live_match FOREIGN KEY (match_id) REFERENCES matches(id);
ALTER TABLE match_spectators ADD CONSTRAINT fk_spectator_match FOREIGN KEY (match_id) REFERENCES matches(id);
ALTER TABLE match_spectators ADD CONSTRAINT fk_spectator_user FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE match_events ADD CONSTRAINT fk_event_match FOREIGN KEY (match_id) REFERENCES matches(id);
ALTER TABLE forum_posts ADD CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES forum_categories(id);
ALTER TABLE forum_posts ADD CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES profiles(id);
ALTER TABLE forum_replies ADD CONSTRAINT fk_reply_post FOREIGN KEY (post_id) REFERENCES forum_posts(id);
ALTER TABLE forum_replies ADD CONSTRAINT fk_reply_author FOREIGN KEY (author_id) REFERENCES profiles(id);
ALTER TABLE user_session_analytics ADD CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE tournament_analytics ADD CONSTRAINT fk_analytics_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id);

-- Enable realtime for live features
ALTER TABLE live_match_sessions REPLICA IDENTITY FULL;
ALTER TABLE match_spectators REPLICA IDENTITY FULL;
ALTER TABLE match_events REPLICA IDENTITY FULL;
ALTER TABLE matches REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE live_match_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE match_spectators;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Create indexes for performance
CREATE INDEX idx_skill_rating_history_user ON skill_rating_history(user_id);
CREATE INDEX idx_live_match_sessions_match ON live_match_sessions(match_id);
CREATE INDEX idx_match_spectators_match ON match_spectators(match_id);
CREATE INDEX idx_match_spectators_user ON match_spectators(user_id);
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX idx_forum_replies_post ON forum_replies(post_id);

-- Insert initial forum categories
INSERT INTO forum_categories (name, description, icon, order_index) VALUES
('General Discussion', 'General gaming discussions and platform feedback', 'message-circle', 1),
('Tournament Talk', 'Discuss upcoming and past tournaments', 'trophy', 2),
('Strategy & Tips', 'Share strategies and gameplay tips', 'target', 3),
('Bug Reports', 'Report platform issues and bugs', 'alert-triangle', 4),
('Feature Requests', 'Suggest new features for the platform', 'lightbulb', 5);

-- Create function to update skill ratings
CREATE OR REPLACE FUNCTION update_skill_rating(
  winner_id UUID,
  loser_id UUID,
  match_id UUID
) RETURNS VOID AS $$
DECLARE
  winner_rating INTEGER;
  loser_rating INTEGER;
  winner_new_rating INTEGER;
  loser_new_rating INTEGER;
  k_factor INTEGER := 32;
  expected_winner DECIMAL;
  expected_loser DECIMAL;
BEGIN
  -- Get current ratings
  SELECT skill_rating INTO winner_rating FROM profiles WHERE id = winner_id;
  SELECT skill_rating INTO loser_rating FROM profiles WHERE id = loser_id;
  
  -- Calculate expected scores using ELO formula
  expected_winner := 1.0 / (1.0 + POWER(10, (loser_rating - winner_rating) / 400.0));
  expected_loser := 1.0 / (1.0 + POWER(10, (winner_rating - loser_rating) / 400.0));
  
  -- Calculate new ratings
  winner_new_rating := winner_rating + ROUND(k_factor * (1.0 - expected_winner));
  loser_new_rating := loser_rating + ROUND(k_factor * (0.0 - expected_loser));
  
  -- Ensure ratings don't go below 100
  winner_new_rating := GREATEST(winner_new_rating, 100);
  loser_new_rating := GREATEST(loser_new_rating, 100);
  
  -- Update profiles
  UPDATE profiles SET 
    skill_rating = winner_new_rating,
    games_played = games_played + 1,
    win_rate = CASE 
      WHEN games_played = 0 THEN 1.0
      ELSE (win_rate * games_played + 1.0) / (games_played + 1)
    END,
    current_streak = current_streak + 1,
    best_streak = GREATEST(best_streak, current_streak + 1)
  WHERE id = winner_id;
  
  UPDATE profiles SET 
    skill_rating = loser_new_rating,
    games_played = games_played + 1,
    win_rate = CASE 
      WHEN games_played = 0 THEN 0.0
      ELSE (win_rate * games_played) / (games_played + 1)
    END,
    current_streak = 0
  WHERE id = loser_id;
  
  -- Record rating history
  INSERT INTO skill_rating_history (user_id, rating_before, rating_after, rating_change, match_id)
  VALUES 
    (winner_id, winner_rating, winner_new_rating, winner_new_rating - winner_rating, match_id),
    (loser_id, loser_rating, loser_new_rating, loser_new_rating - loser_rating, match_id);
END;
$$ LANGUAGE plpgsql;
