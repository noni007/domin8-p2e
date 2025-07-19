import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, User, Chrome } from 'lucide-react';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  mode?: 'login' | 'signup';
}

export const SocialLoginButtons = ({ onSuccess, mode = 'login' }: SocialLoginButtonsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'discord' | 'google') => {
    setLoading(provider);
    
    try {
      // Get current location for redirect after auth
      const currentPath = window.location.pathname;
      const intendedPath = currentPath === '/auth' ? '/' : currentPath;
      const redirectUrl = `${window.location.origin}${intendedPath}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error(`${provider} auth error:`, error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${provider === 'discord' ? 'Discord' : 'Google'} Login`,
          description: "Redirecting to authentication...",
        });
        // Don't call onSuccess here as the redirect will handle it
      }
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: "Authentication Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Steam auth would require server-side implementation
  const handleSteamLogin = () => {
    toast({
      title: "Steam Integration",
      description: "Steam login coming soon! Use Discord for gaming community features.",
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleSocialLogin('discord')}
        disabled={loading !== null}
        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
      >
        {loading === 'discord' ? (
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <MessageCircle className="h-4 w-4 mr-2" />
        )}
        {mode === 'signup' ? 'Sign up with Discord' : 'Continue with Discord'}
      </Button>

      <Button
        onClick={() => handleSocialLogin('google')}
        disabled={loading !== null}
        variant="outline"
        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        {loading === 'google' ? (
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        ) : (
          <Chrome className="h-4 w-4 mr-2" />
        )}
        {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
      </Button>

      <Button
        onClick={handleSteamLogin}
        disabled={loading !== null}
        variant="outline"
        className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
      >
        <User className="h-4 w-4 mr-2" />
        {mode === 'signup' ? 'Sign up with Steam (Soon)' : 'Continue with Steam (Soon)'}
      </Button>

      <div className="text-center text-sm text-gray-500 mt-4">
        Gaming community accounts for the best experience
      </div>
    </div>
  );
};