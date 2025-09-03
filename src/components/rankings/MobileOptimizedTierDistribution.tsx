import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useIsMobile } from '@/hooks/use-mobile';

interface TierData {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  count: number;
  percentage: number;
  color: string;
}

export const MobileOptimizedTierDistribution = () => {
  const [tierData, setTierData] = React.useState<TierData[]>([]);
  const [totalPlayers, setTotalPlayers] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  
  const { shouldRenderComponent, isLowPerformanceDevice } = usePerformanceOptimization();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    fetchTierDistribution();
  }, []);

  const calculateTier = (winRate: number, matchesPlayed: number): TierData['tier'] => {
    if (matchesPlayed < 5) return 'Bronze';
    if (winRate >= 80 && matchesPlayed >= 20) return 'Master';
    if (winRate >= 70) return 'Diamond';
    if (winRate >= 60) return 'Platinum';
    if (winRate >= 50) return 'Gold';
    if (winRate >= 40) return 'Silver';
    return 'Bronze';
  };

  const fetchTierDistribution = React.useCallback(async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_public_profiles');

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setTierData([]);
        setTotalPlayers(0);
        setLoading(false);
        return;
      }

      setTotalPlayers(profiles.length);

      const tierCounts: Record<TierData['tier'], number> = {
        'Bronze': 0,
        'Silver': 0,
        'Gold': 0,
        'Platinum': 0,
        'Diamond': 0,
        'Master': 0
      };

      // Limit processing on low-performance devices
      const profilesToProcess = isLowPerformanceDevice 
        ? profiles.slice(0, 30) 
        : profiles;

      // Batch process for better performance
      const batchSize = isLowPerformanceDevice ? 5 : 10;
      
      for (let i = 0; i < profilesToProcess.length; i += batchSize) {
        const batch = profilesToProcess.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (profile) => {
          const { data: matches } = await supabase
            .from('matches')
            .select('winner_id')
            .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
            .eq('status', 'completed')
            .limit(50); // Limit for performance

          const matchesPlayed = matches?.length || 0;
          const matchesWon = matches?.filter(m => m.winner_id === profile.id).length || 0;
          const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

          return calculateTier(winRate, matchesPlayed);
        });

        const batchTiers = await Promise.all(batchPromises);
        batchTiers.forEach(tier => tierCounts[tier]++);
      }

      const tierColors = {
        'Master': 'bg-purple-600',
        'Diamond': 'bg-blue-600',
        'Platinum': 'bg-green-600',
        'Gold': 'bg-yellow-600',
        'Silver': 'bg-gray-500',
        'Bronze': 'bg-orange-600'
      };

      const data: TierData[] = Object.entries(tierCounts).map(([tier, count]) => ({
        tier: tier as TierData['tier'],
        count,
        percentage: profilesToProcess.length > 0 ? (count / profilesToProcess.length) * 100 : 0,
        color: tierColors[tier as keyof typeof tierColors]
      }));

      const tierOrder = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
      data.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

      setTierData(data);
    } catch (error) {
      console.error('Error fetching tier distribution:', error);
    } finally {
      setLoading(false);
    }
  }, [isLowPerformanceDevice]);

  if (!shouldRenderComponent('low')) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tier Distribution
          </CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <LoadingSpinner size="sm" text="Calculating..." />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tier Distribution
        </CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">{totalPlayers} players</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tierData.map((tier) => (
          <div key={tier.tier} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${tier.color} text-white text-xs`}>
                {tier.tier}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-semibold">{tier.count}</div>
                {!isMobile && (
                  <div className="text-muted-foreground text-xs">
                    {tier.percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            <Progress 
              value={tier.percentage} 
              className="h-1.5"
            />
          </div>
        ))}
        
        {!isMobile && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Requirements</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Master: 80%+ WR, 20+ matches</div>
              <div>Diamond: 70%+ WR • Platinum: 60%+ WR</div>
              <div>Gold: 50%+ WR • Silver: 40%+ WR</div>
              <div>Bronze: Below 40% or &lt;5 matches</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};