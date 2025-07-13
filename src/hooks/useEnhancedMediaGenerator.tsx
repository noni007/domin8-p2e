import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMediaGeneratorProps {
  type: 'tournament_card' | 'achievement_unlock' | 'match_result';
  data: any;
  onImageGenerated?: (imageUrl: string) => void;
  useAI?: boolean; // Toggle between canvas and AI generation
}

export const useEnhancedMediaGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAIImage = async (type: string, data: any): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate AI images.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('generate-social-image', {
        body: {
          type,
          data,
          userId: user.id,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Generation failed",
          description: "Could not generate AI image. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (result?.cached) {
        toast({
          title: "Image ready!",
          description: "Using cached version of your image.",
        });
      } else {
        toast({
          title: "AI image generated!",
          description: "Your custom gaming image is ready to share.",
        });
      }

      return result?.image_url || result?.image || null;
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast({
        title: "Generation error",
        description: "There was an error generating your image.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getUserGeneratedMedia = async (mediaType?: string) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('generated_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (mediaType) {
        query = query.eq('media_type', mediaType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching generated media:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching generated media:', error);
      return [];
    }
  };

  const deleteGeneratedMedia = async (mediaId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('generated_media')
        .delete()
        .eq('id', mediaId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting media:', error);
        return false;
      }

      toast({
        title: "Media deleted",
        description: "Generated image has been removed.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  };

  return {
    generateAIImage,
    getUserGeneratedMedia,
    deleteGeneratedMedia,
  };
};