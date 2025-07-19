-- Fix all database functions to include proper search_path for security
-- This addresses all 15 "Function Search Path Mutable" warnings

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, email, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'player')
  );
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user_notification_preferences function
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- Fix handle_new_team function
CREATE OR REPLACE FUNCTION public.handle_new_team()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user_wallet function
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- Fix increment_spectator_count function
CREATE OR REPLACE FUNCTION public.increment_spectator_count(match_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update or insert live match session with incremented spectator count
  INSERT INTO public.live_match_sessions (match_id, spectator_count, status)
  VALUES (match_id, 1, 'active')
  ON CONFLICT (match_id) 
  DO UPDATE SET 
    spectator_count = COALESCE(live_match_sessions.spectator_count, 0) + 1,
    updated_at = now();
END;
$function$;

-- Fix get_waitlist_position function
CREATE OR REPLACE FUNCTION public.get_waitlist_position(user_email text, feature text DEFAULT 'historical_stats_upload'::text)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path = ''
AS $function$
  SELECT join_position 
  FROM public.feature_waitlist 
  WHERE email = user_email AND feature_name = feature;
$function$;

-- Fix decrement_spectator_count function
CREATE OR REPLACE FUNCTION public.decrement_spectator_count(match_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update live match session with decremented spectator count
  UPDATE public.live_match_sessions 
  SET 
    spectator_count = GREATEST(COALESCE(spectator_count, 0) - 1, 0),
    updated_at = now()
  WHERE match_id = decrement_spectator_count.match_id;
END;
$function$;

-- Fix check_admin_role function
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id_param uuid, required_role text DEFAULT 'admin'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = user_id_param 
    AND (
      admin_roles.role = required_role OR
      admin_roles.role = 'super_admin' OR
      (required_role = 'admin' AND admin_roles.role IN ('admin', 'moderator', 'super_admin'))
    )
  );
$function$;

-- Fix update_skill_rating function
CREATE OR REPLACE FUNCTION public.update_skill_rating(winner_id uuid, loser_id uuid, match_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
  SELECT skill_rating INTO winner_rating FROM public.profiles WHERE id = winner_id;
  SELECT skill_rating INTO loser_rating FROM public.profiles WHERE id = loser_id;
  
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
  UPDATE public.profiles SET 
    skill_rating = winner_new_rating,
    games_played = games_played + 1,
    win_rate = CASE 
      WHEN games_played = 0 THEN 1.0
      ELSE (win_rate * games_played + 1.0) / (games_played + 1)
    END,
    current_streak = current_streak + 1,
    best_streak = GREATEST(best_streak, current_streak + 1)
  WHERE id = winner_id;
  
  UPDATE public.profiles SET 
    skill_rating = loser_new_rating,
    games_played = games_played + 1,
    win_rate = CASE 
      WHEN games_played = 0 THEN 0.0
      ELSE (win_rate * games_played) / (games_played + 1)
    END,
    current_streak = 0
  WHERE id = loser_id;
  
  -- Record rating history
  INSERT INTO public.skill_rating_history (user_id, rating_before, rating_after, rating_change, match_id)
  VALUES 
    (winner_id, winner_rating, winner_new_rating, winner_new_rating - winner_rating, match_id),
    (loser_id, loser_rating, loser_new_rating, loser_new_rating - loser_rating, match_id);
END;
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT public.check_admin_role(user_id, 'admin');
$function$;

-- Fix get_waitlist_stats function
CREATE OR REPLACE FUNCTION public.get_waitlist_stats(feature text DEFAULT 'historical_stats_upload'::text)
 RETURNS TABLE(total_count integer, progress_to_next_milestone integer, next_milestone_target integer, next_milestone_title text)
 LANGUAGE sql
 STABLE
 SET search_path = ''
AS $function$
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
$function$;

-- Fix distribute_tournament_prizes function
CREATE OR REPLACE FUNCTION public.distribute_tournament_prizes(tournament_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix check_user_achievements function
CREATE OR REPLACE FUNCTION public.check_user_achievements(user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix update_tournament_prize_pool function
CREATE OR REPLACE FUNCTION public.update_tournament_prize_pool(tournament_id uuid, amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.tournaments 
  SET prize_pool = prize_pool + amount,
      updated_at = now()
  WHERE id = tournament_id;
END;
$function$;