
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface PlayerRanking {
  profile: Profile;
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

export const GlobalLeaderboard = () => {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'tournaments' | 'winrate'>('overall');

  useEffect(() => {
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

  const fetchRankings = async () => {
    setLoading(true);
    
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setRankings([]);
        setLoading(false);
        return;
      }

      // Fetch tournament participations and matches for each user
      const rankingsPromises = profiles.map(async (profile) => {
        // Get tournament participations
        const { data: participations } = await supabase
          .from('tournament_participants')
          .select(`
            *,
            tournaments:tournament_id (*)
          `)
          .eq('user_id', profile.id);

        // Get matches
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
          .eq('status', 'completed');

        const matchesPlayed = matches?.length || 0;
        const matchesWon = matches?.filter(m => m.winner_id === profile.id).length || 0;
        const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

        // Count tournament wins
        const tournamentsWon = participations?.filter(p => 
          p.tournaments?.status === 'completed' && 
          matches?.some(m => 
            m.tournament_id === p.tournament_id && 
            m.winner_id === profile.id && 
            m.round === Math.max(...(matches.filter(match => match.tournament_id === p.tournament_id).map(match => match.round) || [0]))
          )
        ).length || 0;

        const tier = calculateTier(winRate, matchesPlayed);
        
        // Calculate points based on performance
        const points = (tournamentsWon * 100) + (matchesWon * 10) + Math.floor(winRate);

        return {
          profile,
          stats: {
            tournamentsWon,
            matchesWon,
            matchesPlayed,
            winRate,
            points,
            tier
          },
          rank: 0 // Will be set after sorting
        };
      });

      const playerRankings = await Promise.all(rankingsPromises);

      // Sort based on selected category
      let sortedRankings = [...playerRankings];
      
      switch (selectedCategory) {
        case 'tournaments':
          sortedRankings.sort((a, b) => b.stats.tournamentsWon - a.stats.tournamentsWon || b.stats.points - a.stats.points);
          break;
        case 'winrate':
          sortedRankings.sort((a, b) => {
            // Only rank players with at least 5 matches for win rate
            if (a.stats.matchesPlayed < 5 && b.stats.matchesPlayed < 5) return b.stats.points - a.stats.points;
            if (a.stats.matchesPlayed < 5) return 1;
            if (b.stats.matchesPlayed < 5) return -1;
            return b.stats.winRate - a.stats.winRate || b.stats.points - a.stats.points;
          });
          break;
        default: // overall
          sortedRankings.sort((a, b) => b.stats.points - a.stats.points);
          break;
      }

      // Assign ranks
      sortedRankings = sortedRankings.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      setRankings(sortedRankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Master': return 'bg-purple-600';
      case 'Diamond': return 'bg-blue-600';
      case 'Platinum': return 'bg-green-600';
      case 'Gold': return 'bg-yellow-600';
      case 'Silver': return 'bg-gray-500';
      default: return 'bg-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="space-y-4">
          <TabsList className="bg-black/40 border-blue-800/30">
            <TabsTrigger value="overall" className="data-[state=active]:bg-blue-600">
              Overall Points
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
              Tournament Wins
            </TabsTrigger>
            <TabsTrigger value="winrate" className="data-[state=active]:bg-blue-600">
              Win Rate
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-3">
            {rankings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No rankings available yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankings.slice(0, 50).map((player) => (
                  <div 
                    key={player.profile.id} 
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                      player.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30' 
                        : 'bg-gray-800/50 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <span className="text-2xl font-bold text-white">#{player.rank}</span>
                        {getRankIcon(player.rank)}
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {player.profile.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="text-white font-semibold">
                          {player.profile.username || 'Anonymous Player'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTierColor(player.stats.tier)} text-white text-xs`}>
                            {player.stats.tier}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {player.stats.matchesPlayed} matches played
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {selectedCategory === 'overall' && `${player.stats.points} pts`}
                        {selectedCategory === 'tournaments' && `${player.stats.tournamentsWon} wins`}
                        {selectedCategory === 'winrate' && (
                          player.stats.matchesPlayed >= 5 
                            ? `${player.stats.winRate.toFixed(1)}%`
                            : 'Not ranked'
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {selectedCategory === 'overall' && `${player.stats.tournamentsWon} tournaments won`}
                        {selectedCategory === 'tournaments' && `${player.stats.winRate.toFixed(1)}% win rate`}
                        {selectedCategory === 'winrate' && `${player.stats.matchesWon}/${player.stats.matchesPlayed} matches`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
