import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SocialIntegrationService } from '@/services/socialIntegrationService';
import { useToast } from '@/hooks/use-toast';

interface SocialIntegrationHook {
  shareContent: (type: string, data: any, platforms: string[]) => Promise<void>;
  generateShareableImage: (type: string, data: any) => Promise<string>;
  trackSocialActivity: (platform: string, action: string) => void;
  connectedPlatforms: string[];
  isSharing: boolean;
}

export const useSocialIntegration = (): SocialIntegrationHook => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    // Check for connected social platforms
    const checkConnectedPlatforms = () => {
      const platforms = [];
      
      // Check if Discord is connected (via OAuth)
      if (user?.app_metadata?.provider === 'discord') {
        platforms.push('discord');
      }
      
      // Check if Google is connected
      if (user?.app_metadata?.provider === 'google') {
        platforms.push('google');
      }
      
      setConnectedPlatforms(platforms);
    };

    if (user) {
      checkConnectedPlatforms();
    }
  }, [user]);

  const shareContent = async (type: string, data: any, platforms: string[]) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to share content.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      const shareableContent = SocialIntegrationService.generateShareableContent(type, data);
      
      // Handle sharing for each platform
      for (const platform of platforms) {
        switch (platform) {
          case 'discord':
            if (type === 'tournament_win') {
              await SocialIntegrationService.notifyTournamentWin(data.tournament, data.winner);
            } else if (type === 'achievement_unlock') {
              await SocialIntegrationService.notifyAchievementUnlock(data.user, data.achievement);
            }
            break;
          
          case 'twitter':
            // For Twitter, we generate a shareable link
            const twitterText = `${shareableContent.title}\n\n${shareableContent.description}\n\n#${shareableContent.hashtags.join(' #')}`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
            window.open(twitterUrl, '_blank');
            break;
          
          case 'clipboard':
            const clipboardText = `${shareableContent.title}\n\n${shareableContent.description}`;
            await navigator.clipboard.writeText(clipboardText);
            toast({
              title: "Copied to clipboard!",
              description: "Share text copied to clipboard.",
            });
            break;
        }

        // Track the share activity
        await SocialIntegrationService.trackSocialShare(
          user.id,
          platform,
          type,
          data.id || 'unknown'
        );
      }

      toast({
        title: "Content shared!",
        description: "Your gaming achievement has been shared successfully.",
      });
    } catch (error) {
      console.error('Error sharing content:', error);
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const generateShareableImage = async (type: string, data: any): Promise<string> => {
    // This would integrate with our MediaGenerator component
    // For now, return a placeholder URL
    return `${window.location.origin}/api/generate-image?type=${type}&id=${data.id}`;
  };

  const trackSocialActivity = (platform: string, action: string) => {
    if (user) {
      SocialIntegrationService.trackSocialShare(
        user.id,
        platform,
        action,
        'activity'
      );
    }
  };

  return {
    shareContent,
    generateShareableImage,
    trackSocialActivity,
    connectedPlatforms,
    isSharing,
  };
};