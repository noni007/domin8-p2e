
-- Add entry_fee column to tournaments table (if not already added)
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS entry_fee integer DEFAULT 0;

-- Add platform commission configuration
INSERT INTO public.platform_config (key, value, description) VALUES 
('platform_commission_rate', '0.10', 'Platform commission rate (10% = 0.10)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  reward_amount integer NOT NULL DEFAULT 0,
  condition_type text NOT NULL,
  condition_data jsonb DEFAULT '{}',
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id),
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  reward_claimed boolean DEFAULT false,
  reward_claimed_at timestamp with time zone,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on achievements tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (true);

-- RLS policies for user achievements (users can view their own)
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
  ON public.user_achievements 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, reward_amount, condition_type, condition_data) VALUES
('First Tournament', 'Participate in your first tournament', 'participation', 500, 'tournament_join', '{"count": 1}'),
('Tournament Winner', 'Win your first tournament', 'victory', 1000, 'tournament_win', '{"count": 1}'),
('Social Player', 'Add 5 friends to your network', 'social', 250, 'friends_added', '{"count": 5}'),
('Win Streak', 'Win 5 matches in a row', 'performance', 750, 'match_win_streak', '{"count": 5}'),
('Tournament Regular', 'Participate in 10 tournaments', 'participation', 1500, 'tournament_join', '{"count": 10}'),
('Champion', 'Win 5 tournaments', 'victory', 2500, 'tournament_win', '{"count": 5}');

-- Function to distribute tournament prizes
CREATE OR REPLACE FUNCTION public.distribute_tournament_prizes(tournament_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  winner_id uuid;
  platform_commission numeric;
  winner_prize integer;
  commission_amount integer;
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record 
  FROM public.tournaments 
  WHERE id = tournament_id_param AND status = 'completed';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tournament not found or not completed';
  END IF;
  
  -- Get platform commission rate
  SELECT (value::numeric) INTO platform_commission 
  FROM public.platform_config 
  WHERE key = 'platform_commission_rate';
  
  IF platform_commission IS NULL THEN
    platform_commission := 0.10; -- Default 10%
  END IF;
  
  -- Calculate commission and winner prize
  commission_amount := ROUND(tournament_record.prize_pool * platform_commission);
  winner_prize := tournament_record.prize_pool - commission_amount;
  
  -- Find the tournament winner (this would need to be set when tournament completes)
  SELECT tp.user_id INTO winner_id
  FROM public.tournament_participants tp
  WHERE tp.tournament_id = tournament_id_param 
  AND tp.status = 'winner'
  LIMIT 1;
  
  IF winner_id IS NOT NULL THEN
    -- Create winner transaction
    INSERT INTO public.wallet_transactions (
      user_id,
      wallet_id,
      transaction_type,
      amount,
      description,
      status,
      metadata
    )
    SELECT 
      winner_id,
      uw.id,
      'prize_payout',
      winner_prize,
      'Tournament Prize - ' || tournament_record.title,
      'completed',
      jsonb_build_object(
        'tournament_id', tournament_id_param,
        'original_prize_pool', tournament_record.prize_pool,
        'platform_commission', commission_amount
      )
    FROM public.user_wallets uw
    WHERE uw.user_id = winner_id;
    
    -- Update winner's wallet balance
    UPDATE public.user_wallets 
    SET balance = balance + winner_prize,
        updated_at = now()
    WHERE user_id = winner_id;
  END IF;
  
  -- Record platform commission (you could create a platform wallet for this)
  INSERT INTO public.wallet_transactions (
    user_id,
    wallet_id,
    transaction_type,
    amount,
    description,
    status,
    metadata
  ) VALUES (
    NULL, -- Platform transaction
    NULL,
    'platform_commission',
    commission_amount,
    'Platform Commission - ' || tournament_record.title,
    'completed',
    jsonb_build_object(
      'tournament_id', tournament_id_param,
      'commission_rate', platform_commission
    )
  );
END;
$$;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_user_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  user_stat_count integer;
  should_unlock boolean;
BEGIN
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id 
      FROM public.user_achievements 
      WHERE user_id = user_id_param
    )
  LOOP
    should_unlock := false;
    
    -- Check condition based on type
    CASE achievement_record.condition_type
      WHEN 'tournament_join' THEN
        SELECT COUNT(*) INTO user_stat_count
        FROM public.tournament_participants
        WHERE user_id = user_id_param;
        
        should_unlock := user_stat_count >= (achievement_record.condition_data->>'count')::integer;
        
      WHEN 'tournament_win' THEN
        SELECT COUNT(*) INTO user_stat_count
        FROM public.tournament_participants
        WHERE user_id = user_id_param AND status = 'winner';
        
        should_unlock := user_stat_count >= (achievement_record.condition_data->>'count')::integer;
        
      WHEN 'friends_added' THEN
        SELECT COUNT(*) INTO user_stat_count
        FROM public.friendships
        WHERE user_id = user_id_param;
        
        should_unlock := user_stat_count >= (achievement_record.condition_data->>'count')::integer;
    END CASE;
    
    -- Unlock achievement if conditions met
    IF should_unlock THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (user_id_param, achievement_record.id);
      
      -- Add reward to user's wallet
      IF achievement_record.reward_amount > 0 THEN
        INSERT INTO public.wallet_transactions (
          user_id,
          wallet_id,
          transaction_type,
          amount,
          description,
          status,
          metadata
        )
        SELECT 
          user_id_param,
          uw.id,
          'achievement_reward',
          achievement_record.reward_amount,
          'Achievement Reward - ' || achievement_record.name,
          'completed',
          jsonb_build_object('achievement_id', achievement_record.id)
        FROM public.user_wallets uw
        WHERE uw.user_id = user_id_param;
        
        -- Update wallet balance
        UPDATE public.user_wallets 
        SET balance = balance + achievement_record.reward_amount,
            updated_at = now()
        WHERE user_id = user_id_param;
      END IF;
    END IF;
  END LOOP;
END;
$$;
