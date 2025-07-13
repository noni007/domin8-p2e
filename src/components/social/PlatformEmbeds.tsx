import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Youtube, 
  Twitch, 
  MessageCircle, 
  ExternalLink, 
  Play,
  Users
} from 'lucide-react';

interface PlatformEmbedsProps {
  type: 'tournament' | 'community';
  tournamentId?: string;
}

export const PlatformEmbeds = ({ type, tournamentId }: PlatformEmbedsProps) => {
  const [twitchChannel, setTwitchChannel] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showTwitchEmbed, setShowTwitchEmbed] = useState(false);
  const [showYoutubeEmbed, setShowYoutubeEmbed] = useState(false);

  const handleTwitchEmbed = () => {
    if (twitchChannel.trim()) {
      setShowTwitchEmbed(true);
    }
  };

  const handleYoutubeEmbed = () => {
    if (youtubeUrl.trim()) {
      setShowYoutubeEmbed(true);
    }
  };

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Live Streams Section */}
      <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Play className="h-5 w-5 mr-2 text-purple-400" />
            Live Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Twitch Integration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Twitch className="h-5 w-5 text-purple-500" />
              <span className="text-white font-medium">Twitch Stream</span>
              <Badge className="bg-purple-600">Live</Badge>
            </div>
            
            {!showTwitchEmbed ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Twitch channel name..."
                  value={twitchChannel}
                  onChange={(e) => setTwitchChannel(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button onClick={handleTwitchEmbed} size="sm">
                  Embed
                </Button>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}`}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  className="border-0"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTwitchEmbed(false)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* YouTube Integration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <span className="text-white font-medium">YouTube Video</span>
            </div>
            
            {!showYoutubeEmbed ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube URL..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button onClick={handleYoutubeEmbed} size="sm">
                  Embed
                </Button>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                  title="YouTube video player"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowYoutubeEmbed(false)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Integration */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Community Hubs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discord Widget */}
          <div className="p-4 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#5865F2]" />
                <span className="text-white font-medium">Discord Community</span>
                <Badge className="bg-green-600">Active</Badge>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white"
                onClick={() => window.open('https://discord.gg/domin8', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
            </div>
            
            <div className="text-sm text-gray-300 space-y-1">
              <p>🎮 Gaming discussions</p>
              <p>📢 Tournament announcements</p>
              <p>🏆 Live match updates</p>
              <p>👥 Find teammates</p>
            </div>
          </div>

          {/* Twitter Timeline */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">
                  X
                </div>
                <span className="text-white font-medium">Tournament Updates</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                onClick={() => window.open('https://twitter.com/domin8gaming', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Follow
              </Button>
            </div>
            
            <div className="text-sm text-gray-300 space-y-1">
              <p>📱 Real-time updates</p>
              <p>🎉 Winner announcements</p>
              <p>📊 Tournament statistics</p>
              <p>🔔 Breaking news</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};