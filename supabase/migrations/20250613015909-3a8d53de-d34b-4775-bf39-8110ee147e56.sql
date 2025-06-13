
-- Add Row Level Security policies for tournaments table
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view tournaments (public access)
CREATE POLICY "Anyone can view tournaments" 
  ON public.tournaments 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to create tournaments
CREATE POLICY "Authenticated users can create tournaments" 
  ON public.tournaments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Policy to allow organizers to update their own tournaments
CREATE POLICY "Organizers can update their own tournaments" 
  ON public.tournaments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Add RLS policies for tournament_participants table
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view tournament participants
CREATE POLICY "Anyone can view tournament participants" 
  ON public.tournament_participants 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to register for tournaments
CREATE POLICY "Authenticated users can register for tournaments" 
  ON public.tournament_participants 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update/delete their own registrations
CREATE POLICY "Users can manage their own registrations" 
  ON public.tournament_participants 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for profiles table (skipping the duplicate policy)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view profiles (for public profile pages)
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
