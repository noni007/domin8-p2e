
-- Create enum for team member roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  max_members INTEGER NOT NULL DEFAULT 10,
  is_public BOOLEAN NOT NULL DEFAULT true
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(team_id, invited_user_id)
);

-- Create team messages table for internal communication
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add team_id to tournaments table for team tournaments
ALTER TABLE public.tournaments ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
ALTER TABLE public.tournaments ADD COLUMN tournament_type TEXT NOT NULL DEFAULT 'individual';

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Anyone can view public teams" ON public.teams
  FOR SELECT USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM public.team_members WHERE team_id = teams.id
  ));

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team owners and admins can update teams" ON public.teams
  FOR UPDATE TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = teams.id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can delete teams" ON public.teams
  FOR DELETE TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = teams.id AND role = 'owner'
    )
  );

-- RLS Policies for team_members
CREATE POLICY "Anyone can view team members" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Team owners and admins can manage members" ON public.team_members
  FOR ALL TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id AND tm.role IN ('owner', 'admin')
    ) OR auth.uid() = user_id
  );

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations" ON public.team_invitations
  FOR SELECT TO authenticated USING (
    auth.uid() = invited_user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invitations.team_id
    )
  );

CREATE POLICY "Team owners and admins can manage invitations" ON public.team_invitations
  FOR ALL TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invitations.team_id AND role IN ('owner', 'admin')
    ) OR auth.uid() = invited_user_id
  );

-- RLS Policies for team_messages
CREATE POLICY "Team members can view messages" ON public.team_messages
  FOR SELECT TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_messages.team_id
    )
  );

CREATE POLICY "Team members can send messages" ON public.team_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_messages.team_id
    )
  );

-- Create function to automatically add team creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new teams
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();

-- Enable realtime for team messages
ALTER TABLE public.team_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
