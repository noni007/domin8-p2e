import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Share2, 
  TrendingUp, 
  Users, 
  MessageCircle,
  Heart,
  Eye,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SocialStats {
  totalShares: number;
  platformBreakdown: Record<string, number>;
  recentShares: Array<{
    id: string;
    platform: string;
    content_type: string;
    shared_at: string;
  }>;
  weeklyGrowth: number;
  engagementScore: number;
}

export const SocialActivityTracker = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SocialStats>({
    totalShares: 0,
    platformBreakdown: {},
    recentShares: [],
    weeklyGrowth: 0,
    engagementScore: 75,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialStats = async () => {
      if (!user) return;

      try {
        // Fetch social sharing activities
        const { data: activities, error } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'social_share')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Process the data
        const platformBreakdown: Record<string, number> = {};
        const recentShares = activities?.slice(0, 10).map(activity => {
          const metadata = activity.metadata as any;
          return {
            id: activity.id,
            platform: metadata?.platform || 'unknown',
            content_type: metadata?.content_type || 'unknown',
            shared_at: activity.created_at,
          };
        }) || [];

        activities?.forEach(activity => {
          const metadata = activity.metadata as any;
          const platform = metadata?.platform || 'unknown';
          platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
        });

        // Calculate weekly growth (mock calculation)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentShares_ = activities?.filter(
          activity => new Date(activity.created_at) > oneWeekAgo
        ).length || 0;

        setStats({
          totalShares: activities?.length || 0,
          platformBreakdown,
          recentShares,
          weeklyGrowth: recentShares_,
          engagementScore: Math.min(100, 50 + (activities?.length || 0) * 2),
        });
      } catch (error) {
        console.error('Error fetching social stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialStats();
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400">Loading social analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'discord':
        return '💬';
      case 'twitter':
        return '🐦';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      default:
        return '🔗';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'discord':
        return 'bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30';
      case 'twitter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'facebook':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'instagram':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Share2 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalShares}</div>
            <div className="text-sm text-gray-400">Total Shares</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-800/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">+{stats.weeklyGrowth}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.engagementScore}%</div>
            <div className="text-sm text-gray-400">Engagement</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-yellow-800/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{Object.keys(stats.platformBreakdown).length}</div>
            <div className="text-sm text-gray-400">Platforms</div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
            <div key={platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(platform)}</span>
                  <span className="text-white capitalize">{platform}</span>
                </div>
                <Badge className={getPlatformColor(platform)}>
                  {count} shares
                </Badge>
              </div>
              <Progress 
                value={(count / Math.max(...Object.values(stats.platformBreakdown))) * 100} 
                className="h-2"
              />
            </div>
          ))}

          {Object.keys(stats.platformBreakdown).length === 0 && (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No shares yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Start sharing your gaming achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-400" />
            Recent Shares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentShares.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getPlatformIcon(share.platform)}</span>
                  <div>
                    <div className="text-white text-sm font-medium">
                      Shared {share.content_type.replace('_', ' ')}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(share.shared_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getPlatformColor(share.platform)}
                >
                  {share.platform}
                </Badge>
              </div>
            ))}

            {stats.recentShares.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your social shares will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Score */}
      <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="h-5 w-5 mr-2 text-purple-400" />
            Social Engagement Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {stats.engagementScore}%
            </div>
            <Progress value={stats.engagementScore} className="h-3 mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <Eye className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Visibility</div>
              <div className="text-white font-semibold">Good</div>
            </div>
            
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Reach</div>
              <div className="text-white font-semibold">Growing</div>
            </div>
            
            <div className="p-3 bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Growth</div>
              <div className="text-white font-semibold">Strong</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};