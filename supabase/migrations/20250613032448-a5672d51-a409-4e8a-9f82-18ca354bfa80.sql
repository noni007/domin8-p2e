
-- Add foreign key constraints to link team tables with profiles
ALTER TABLE public.team_members 
ADD CONSTRAINT fk_team_members_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_messages 
ADD CONSTRAINT fk_team_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_invitations 
ADD CONSTRAINT fk_team_invitations_invited_by 
FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_invitations 
ADD CONSTRAINT fk_team_invitations_invited_user_id 
FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.teams 
ADD CONSTRAINT fk_teams_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
