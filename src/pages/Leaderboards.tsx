
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, TrendingUp, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface LeaderboardPlayer {
  profile: Profile;
  rank: number;
  score: number;
  tournamentsWon: number;
  matchesWon: number;
  matchesPlayed: number;
  winRate: number;
  tier: string;
}

export const Leaderboards = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'winRate' | 'tournaments'>('score');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // For each profile, calculate their stats
      const playersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get tournament participations
          const { data: participations } = await supabase
            .from('tournament_participants')
            .select(`
              *,
              tournaments:tournament_id (status)
            `)
            .eq('user_id', profile.id);

          // Get matches
          const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`);

          const tournamentsWon = participations?.filter(p => 
            p.tournaments?.status === 'completed'
          ).length || 0;

          const matchesPlayed = matches?.length || 0;
          const matchesWon = matches?.filter(m => m.winner_id === profile.id).length || 0;
          const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

          // Calculate score (weighted combination of factors)
          const score = (tournamentsWon * 100) + (matchesWon * 10) + (winRate * 2);

          const getTier = (winRate: number) => {
            if (winRate >= 80) return 'Master';
            if (winRate >= 70) return 'Diamond';
            if (winRate >= 60) return 'Platinum';
            if (winRate >= 50) return 'Gold';
            if (winRate >= 40) return 'Silver';
            return 'Bronze';
          };

          return {
            profile,
            rank: 0, // Will be set after sorting
            score,
            tournamentsWon,
            matchesWon,
            matchesPlayed,
            winRate,
            tier: getTier(winRate)
          };
        })
      );

      // Sort and assign ranks
      const sortedPlayers = playersWithStats
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({ ...player, rank: index + 1 }));

      setPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPlayers = () => {
    return [...players].sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate;
        case 'tournaments':
          return b.tournamentsWon - a.tournamentsWon;
        default:
          return a.rank - b.rank; // Original score-based ranking
      }
    });
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return <span className="text-gray-400 font-mono">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const sortedPlayers = getSortedPlayers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
            Leaderboards
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            See how you rank against the best players in Africa. Climb the ladder and earn your place among the elite.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">{players.length}</div>
              <div className="text-gray-300">Total Players</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">
                {players.filter(p => p.matchesPlayed > 0).length}
              </div>
              <div className="text-gray-300">Active Players</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-600/20 to-teal-600/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">
                {players.filter(p => p.tier === 'Master' || p.tier === 'Diamond').length}
              </div>
              <div className="text-gray-300">Elite Players</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Rankings
              </CardTitle>
              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)} className="w-full sm:w-auto">
                <TabsList className="bg-black/40 border-blue-800/30">
                  <TabsTrigger value="score" className="data-[state=active]:bg-blue-600">
                    Overall Score
                  </TabsTrigger>
                  <TabsTrigger value="winRate" className="data-[state=active]:bg-blue-600">
                    Win Rate
                  </TabsTrigger>
                  <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
                    Tournaments
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {players.length > 0 ? (
              <div className="space-y-3">
                {sortedPlayers.slice(0, 50).map((player, index) => (
                  <div
                    key={player.profile.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:border-blue-600/50 cursor-pointer ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-yellow-500/30' : 
                      'border-gray-700 hover:bg-gray-800/30'
                    }`}
                    onClick={() => window.location.href = `/profile/${player.profile.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(sortBy === 'score' ? player.rank : index + 1)}
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {player.profile.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-white font-semibold">
                          {player.profile.username || 'Anonymous Player'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTierColor(player.tier)} text-white text-xs`}>
                            {player.tier}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {player.matchesPlayed} matches played
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {sortBy === 'score' && (
                        <>
                          <div className="text-lg font-bold text-blue-400">
                            {player.score.toFixed(0)} pts
                          </div>
                          <div className="text-sm text-gray-400">
                            {player.winRate.toFixed(1)}% win rate
                          </div>
                        </>
                      )}
                      {sortBy === 'winRate' && (
                        <>
                          <div className="text-lg font-bold text-green-400">
                            {player.winRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">
                            {player.matchesWon}/{player.matchesPlayed} wins
                          </div>
                        </>
                      )}
                      {sortBy === 'tournaments' && (
                        <>
                          <div className="text-lg font-bold text-yellow-400">
                            {player.tournamentsWon} wins
                          </div>
                          <div className="text-sm text-gray-400">
                            {player.winRate.toFixed(1)}% win rate
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No players found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboards;
