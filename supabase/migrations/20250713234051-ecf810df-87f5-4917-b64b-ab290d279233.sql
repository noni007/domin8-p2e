-- Add enhanced social tracking and media generation tables

-- Create social_integrations table to track connected platforms
CREATE TABLE public.social_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  integration_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_posts table to track automated posts
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_type TEXT NOT NULL, -- 'achievement', 'tournament_win', 'match_result'
  content_title TEXT NOT NULL,
  content_description TEXT,
  content_url TEXT,
  image_url TEXT,
  platform_post_id TEXT,
  post_status TEXT DEFAULT 'pending', -- 'pending', 'posted', 'failed'
  scheduled_for TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  engagement_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_media table to track AI-generated images
CREATE TABLE public.generated_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'tournament_card', 'achievement_unlock', 'match_result'
  prompt TEXT NOT NULL,
  image_url TEXT,
  file_path TEXT,
  generation_model TEXT DEFAULT 'gpt-image-1',
  generation_data JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_integrations
CREATE POLICY "Users can view their own social integrations" 
ON public.social_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social integrations" 
ON public.social_integrations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for social_posts
CREATE POLICY "Users can view their own social posts" 
ON public.social_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social posts" 
ON public.social_posts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for generated_media
CREATE POLICY "Users can view their own generated media" 
ON public.generated_media 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own generated media" 
ON public.generated_media 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_social_integrations_user_platform ON public.social_integrations(user_id, platform);
CREATE INDEX idx_social_posts_user_status ON public.social_posts(user_id, post_status);
CREATE INDEX idx_social_posts_scheduled ON public.social_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_generated_media_user_type ON public.generated_media(user_id, media_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_social_integrations_updated_at
  BEFORE UPDATE ON public.social_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_media_updated_at
  BEFORE UPDATE ON public.generated_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();