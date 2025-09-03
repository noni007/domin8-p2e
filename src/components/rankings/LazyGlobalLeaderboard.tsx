import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';
import { withLazyLoad } from '@/components/performance/LazyLoadOptimizer';
import { VirtualizedLeaderboard } from './VirtualizedLeaderboard';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { supabase } from '@/integrations/supabase/client';

// Lazy load the heavy computation components
const LazyVirtualizedLeaderboard = withLazyLoad(
  () => import('./VirtualizedLeaderboard').then(m => ({ default: m.VirtualizedLeaderboard })),
  { delay: 100 }
);

interface PlayerRanking {
  profile: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
  stats: {
    tournamentsWon: number;
    matchesWon: number;
    matchesPlayed: number;
    winRate: number;
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  };
  rank: number;
}

export const LazyGlobalLeaderboard = () => {
  const [rankings, setRankings] = React.useState<PlayerRanking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<'overall' | 'tournaments' | 'winrate'>('overall');
  const [categoryLoading, setCategoryLoading] = React.useState(false);
  
  const { shouldRenderComponent, isLowPerformanceDevice } = usePerformanceOptimization();

  React.useEffect(() => {
    fetchRankings();
  }, [selectedCategory]);

  const calculateTier = (winRate: number, matchesPlayed: number): PlayerRanking['stats']['tier'] => {
    if (matchesPlayed < 5) return 'Bronze';
    if (winRate >= 80 && matchesPlayed >= 20) return 'Master';
    if (winRate >= 70) return 'Diamond';
    if (winRate >= 60) return 'Platinum';
    if (winRate >= 50) return 'Gold';
    if (winRate >= 40) return 'Silver';
    return 'Bronze';
  };

  const fetchRankings = React.useCallback(async () => {
    if (rankings.length > 0) {
      setCategoryLoading(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch public profiles with optimized query
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_public_profiles');

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setRankings([]);
        setLoading(false);
        setCategoryLoading(false);
        return;
      }

      // Limit the number of profiles processed on low-performance devices
      const profilesToProcess = isLowPerformanceDevice 
        ? profiles.slice(0, 50) 
        : profiles.slice(0, 100);

      // Batch process rankings with optimized queries
      const batchSize = isLowPerformanceDevice ? 10 : 20;
      const batches = [];
      
      for (let i = 0; i < profilesToProcess.length; i += batchSize) {
        batches.push(profilesToProcess.slice(i, i + batchSize));
      }

      const allRankings: PlayerRanking[] = [];

      for (const batch of batches) {
        const batchPromises = batch.map(async (profile) => {
          // Optimize queries to fetch only necessary data
          const [participations, matches] = await Promise.all([
            supabase
              .from('tournament_participants')
              .select('tournament_id, tournaments!inner(status)')
              .eq('user_id', profile.id)
              .limit(50),
            supabase
              .from('matches')
              .select('winner_id, tournament_id, round')
              .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
              .eq('status', 'completed')
              .limit(100)
          ]);

          const matchesPlayed = matches.data?.length || 0;
          const matchesWon = matches.data?.filter(m => m.winner_id === profile.id).length || 0;
          const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

          // Simplified tournament wins calculation for performance
          const tournamentsWon = participations.data?.filter(p => 
            p.tournaments?.status === 'completed'
          ).length || 0;

          const tier = calculateTier(winRate, matchesPlayed);
          const points = (tournamentsWon * 100) + (matchesWon * 10) + Math.floor(winRate);

          return {
            profile: {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url
            },
            stats: {
              tournamentsWon,
              matchesWon,
              matchesPlayed,
              winRate,
              points,
              tier
            },
            rank: 0
          };
        });

        const batchResults = await Promise.all(batchPromises);
        allRankings.push(...batchResults);
      }

      // Sort and assign ranks
      let sortedRankings = [...allRankings];
      
      switch (selectedCategory) {
        case 'tournaments':
          sortedRankings.sort((a, b) => b.stats.tournamentsWon - a.stats.tournamentsWon || b.stats.points - a.stats.points);
          break;
        case 'winrate':
          sortedRankings.sort((a, b) => {
            if (a.stats.matchesPlayed < 5 && b.stats.matchesPlayed < 5) return b.stats.points - a.stats.points;
            if (a.stats.matchesPlayed < 5) return 1;
            if (b.stats.matchesPlayed < 5) return -1;
            return b.stats.winRate - a.stats.winRate || b.stats.points - a.stats.points;
          });
          break;
        default:
          sortedRankings.sort((a, b) => b.stats.points - a.stats.points);
          break;
      }

      sortedRankings = sortedRankings.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      setRankings(sortedRankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
      setCategoryLoading(false);
    }
  }, [selectedCategory, isLowPerformanceDevice, rankings.length]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (!shouldRenderComponent('medium')) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Leaderboard temporarily unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Global Leaderboard
          {categoryLoading && <LoadingSpinner size="sm" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="overall" disabled={categoryLoading}>
              Overall Points
            </TabsTrigger>
            <TabsTrigger value="tournaments" disabled={categoryLoading}>
              Tournament Wins
            </TabsTrigger>
            <TabsTrigger value="winrate" disabled={categoryLoading}>
              Win Rate
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            {categoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner text="Updating rankings..." />
              </div>
            ) : (
              <Suspense fallback={<LeaderboardSkeleton />}>
                <LazyVirtualizedLeaderboard 
                  rankings={rankings}
                  selectedCategory={selectedCategory}
                  height={isLowPerformanceDevice ? 400 : 600}
                />
              </Suspense>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};