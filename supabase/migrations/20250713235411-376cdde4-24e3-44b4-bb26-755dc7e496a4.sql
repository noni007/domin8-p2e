-- Create function to increment spectator count for live match sessions
CREATE OR REPLACE FUNCTION public.increment_spectator_count(match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or insert live match session with incremented spectator count
  INSERT INTO public.live_match_sessions (match_id, spectator_count, status)
  VALUES (match_id, 1, 'active')
  ON CONFLICT (match_id) 
  DO UPDATE SET 
    spectator_count = COALESCE(live_match_sessions.spectator_count, 0) + 1,
    updated_at = now();
END;
$$;

-- Create function to decrement spectator count for live match sessions
CREATE OR REPLACE FUNCTION public.decrement_spectator_count(match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update live match session with decremented spectator count
  UPDATE public.live_match_sessions 
  SET 
    spectator_count = GREATEST(COALESCE(spectator_count, 0) - 1, 0),
    updated_at = now()
  WHERE match_id = decrement_spectator_count.match_id;
END;
$$;