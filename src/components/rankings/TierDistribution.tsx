import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Skeleton } from "@/components/common/Skeleton";

interface TierData {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  count: number;
  percentage: number;
  color: string;
}

export const TierDistribution = () => {
  const [tierData, setTierData] = useState<TierData[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const fetchTierDistribution = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setTierData([]);
        setTotalPlayers(0);
        setLoading(false);
        return;
      }

      setTotalPlayers(profiles.length);

      // Calculate tier for each player
      const tierCounts: Record<TierData['tier'], number> = {
        'Bronze': 0,
        'Silver': 0,
        'Gold': 0,
        'Platinum': 0,
        'Diamond': 0,
        'Master': 0
      };

      for (const profile of profiles) {
        // Get matches for this user
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
          .eq('status', 'completed');

        const matchesPlayed = matches?.length || 0;
        const matchesWon = matches?.filter(m => m.winner_id === profile.id).length || 0;
        const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

        const tier = calculateTier(winRate, matchesPlayed);
        tierCounts[tier]++;
      }

      // Convert to array with percentages
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
        percentage: profiles.length > 0 ? (count / profiles.length) * 100 : 0,
        color: tierColors[tier as keyof typeof tierColors]
      }));

      // Sort by tier hierarchy (Master first, Bronze last)
      const tierOrder = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
      data.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

      setTierData(data);
    } catch (error) {
      console.error('Error fetching tier distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5" />
            Tier Distribution
          </CardTitle>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="h-4 w-4" />
            <LoadingSpinner size="sm" text="Calculating tiers..." />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Tier Distribution
        </CardTitle>
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="h-4 w-4" />
          <span>{totalPlayers} players ranked</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tierData.map((tier) => (
          <div key={tier.tier} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${tier.color} text-white`}>
                {tier.tier}
              </Badge>
              <div className="text-right">
                <div className="text-white font-semibold">{tier.count} players</div>
                <div className="text-gray-400 text-sm">{tier.percentage.toFixed(1)}%</div>
              </div>
            </div>
            <Progress 
              value={tier.percentage} 
              className="h-2"
            />
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Tier Requirements</h4>
          <div className="space-y-1 text-sm text-gray-300">
            <div>• Master: 80%+ win rate, 20+ matches</div>
            <div>• Diamond: 70%+ win rate</div>
            <div>• Platinum: 60%+ win rate</div>
            <div>• Gold: 50%+ win rate</div>
            <div>• Silver: 40%+ win rate</div>
            <div>• Bronze: Below 40% or &lt;5 matches</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
