
-- Create friendships table to track friend relationships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create friend_requests table for pending invitations
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create user_activities table for activity feed
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('tournament_join', 'tournament_win', 'match_win', 'achievement_unlock', 'friend_added')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" 
  ON public.friendships 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create their own friendships" 
  ON public.friendships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friendships" 
  ON public.friendships 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for friend_requests
CREATE POLICY "Users can view their sent and received friend requests" 
  ON public.friend_requests 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" 
  ON public.friend_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests" 
  ON public.friend_requests 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends' activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = user_activities.user_id)
         OR (friend_id = auth.uid() AND user_id = user_activities.user_id)
    )
  );

CREATE POLICY "Users can create their own activities" 
  ON public.user_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friend_requests_sender_id ON public.friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON public.friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
