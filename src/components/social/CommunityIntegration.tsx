import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Bell, 
  Users, 
  Trophy, 
  Settings,
  ExternalLink,
  Bot,
  Twitch
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SocialIntegrationService } from '@/services/socialIntegrationService';

interface CommunityIntegrationProps {
  tournamentId?: string;
  userId?: string;
}

export const CommunityIntegration = ({ tournamentId, userId }: CommunityIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discordNotifications, setDiscordNotifications] = useState(true);
  const [autoShare, setAutoShare] = useState(false);
  const [influencerMode, setInfluencerMode] = useState(false);

  const handleDiscordBotSetup = () => {
    toast({
      title: "Discord Bot Integration",
      description: "Setting up Discord bot for tournament notifications...",
    });

    // This would typically involve:
    // 1. Guiding user to invite bot to their server
    // 2. Setting up webhook URL
    // 3. Configuring notification preferences
    
    window.open('https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=2048', '_blank');
  };

  const handleStreamerIntegration = async () => {
    if (!user) return;

    try {
      await SocialIntegrationService.createStreamerIntegration(
        user.id,
        'twitch',
        {
          channel_name: 'user_channel', // This would come from user input
          auto_notify: true,
          tournament_alerts: true,
        }
      );

      toast({
        title: "Streamer mode activated!",
        description: "Your streams will now include tournament updates.",
      });

      setInfluencerMode(true);
    } catch (error) {
      toast({
        title: "Integration failed",
        description: "Could not set up streamer integration.",
        variant: "destructive",
      });
    }
  };

  const handleAutoPostToggle = (enabled: boolean) => {
    setAutoShare(enabled);
    
    if (enabled) {
      toast({
        title: "Auto-sharing enabled",
        description: "Tournament wins and achievements will be automatically shared.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Discord Integration */}
      <Card className="bg-black/40 border-[#5865F2]/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[#5865F2]" />
            Discord Bot Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Tournament Notifications</Label>
              <p className="text-sm text-gray-400">
                Get notified about tournament starts, wins, and important updates
              </p>
            </div>
            <Switch
              checked={discordNotifications}
              onCheckedChange={setDiscordNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Auto-Share Achievements</Label>
              <p className="text-sm text-gray-400">
                Automatically share wins and achievements to Discord
              </p>
            </div>
            <Switch
              checked={autoShare}
              onCheckedChange={handleAutoPostToggle}
            />
          </div>

          <div className="pt-4 border-t border-gray-600/30">
            <Button
              onClick={handleDiscordBotSetup}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <Bot className="h-4 w-4 mr-2" />
              Add Bot to Server
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Influencer & Streamer Tools */}
      <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Twitch className="h-5 w-5 mr-2 text-purple-400" />
            Influencer & Streamer Tools
            {influencerMode && (
              <Badge className="ml-2 bg-purple-600">Active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <h4 className="text-white font-medium mb-2">Stream Integration</h4>
              <p className="text-sm text-gray-300 mb-3">
                Connect your Twitch/YouTube to show live tournament updates
              </p>
              <Button
                onClick={handleStreamerIntegration}
                size="sm"
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                Connect Stream
              </Button>
            </div>

            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <h4 className="text-white font-medium mb-2">Partnership Tools</h4>
              <p className="text-sm text-gray-300 mb-3">
                Access to promotional materials and special tournament codes
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                Apply for Partnership
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-600/30">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Influencer Mode</Label>
                <p className="text-sm text-gray-400">
                  Enhanced sharing tools and analytics for content creators
                </p>
              </div>
              <Switch
                checked={influencerMode}
                onCheckedChange={setInfluencerMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">1,247</div>
              <div className="text-sm text-gray-400">Discord Members</div>
            </div>
            
            <div className="text-center p-4 bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">89</div>
              <div className="text-sm text-gray-400">Active Streamers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">342</div>
              <div className="text-sm text-gray-400">Shared Moments</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};