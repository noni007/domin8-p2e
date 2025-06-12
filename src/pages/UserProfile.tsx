
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Medal, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;
type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;
type Match = Tables<'matches'>;

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
}

export const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch tournament participations
      const { data: participationsData, error: participationsError } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          tournaments:tournament_id (*)
        `)
        .eq('user_id', userId);

      if (participationsError) throw participationsError;
      
      const userTournaments = participationsData?.map(p => p.tournaments).filter(Boolean) || [];
      setTournaments(userTournaments as Tournament[]);

      // Calculate stats
      const tournamentsPlayed = participationsData?.length || 0;
      
      // Count tournament wins (simplified - in a real app you'd check final standings)
      const tournamentsWon = participationsData?.filter(p => 
        p.tournaments?.status === 'completed'
      ).length || 0;

      // Fetch matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);

      const matchesPlayed = matchesData?.length || 0;
      const matchesWon = matchesData?.filter(m => m.winner_id === userId).length || 0;
      const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

      setStats({
        tournamentsPlayed,
        tournamentsWon,
        matchesPlayed,
        matchesWon,
        winRate,
        rank: Math.floor(Math.random() * 1000) + 1 // Placeholder ranking
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (winRate: number) => {
    if (winRate >= 80) return { name: 'Master', color: 'bg-purple-600' };
    if (winRate >= 70) return { name: 'Diamond', color: 'bg-blue-600' };
    if (winRate >= 60) return { name: 'Platinum', color: 'bg-green-600' };
    if (winRate >= 50) return { name: 'Gold', color: 'bg-yellow-600' };
    if (winRate >= 40) return { name: 'Silver', color: 'bg-gray-500' };
    return { name: 'Bronze', color: 'bg-orange-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 border-red-800/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-white text-xl mb-2">User Not Found</h2>
            <p className="text-gray-400">The requested profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = stats ? getTierBadge(stats.winRate) : { name: 'Unranked', color: 'bg-gray-600' };

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
            <Button 
              variant="outline" 
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.username || 'Anonymous Player'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`${tier.color} text-white`}>
                    <Trophy className="h-4 w-4 mr-1" />
                    {tier.name}
                  </Badge>
                  {stats && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Rank #{stats.rank}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                {profile.bio && (
                  <p className="text-gray-300">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.tournamentsPlayed}</div>
                <div className="text-sm text-gray-400">Tournaments</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.tournamentsWon}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.matchesPlayed}</div>
                <div className="text-sm text-gray-400">Matches</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.winRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">#{stats.rank}</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Information */}
        <Tabs defaultValue="tournaments" className="space-y-4">
          <TabsList className="bg-black/40 border-blue-800/30">
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
              Tournament History
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments">
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Tournament History</CardTitle>
              </CardHeader>
              <CardContent>
                {tournaments.length > 0 ? (
                  <div className="space-y-4">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-blue-600/50 transition-colors"
                      >
                        <div>
                          <h3 className="text-white font-semibold">{tournament.title}</h3>
                          <p className="text-gray-400 text-sm">{tournament.game}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(tournament.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              tournament.status === 'completed'
                                ? 'bg-green-600'
                                : tournament.status === 'in_progress'
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                            }
                          >
                            {tournament.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-gray-400 text-sm mt-1">
                            ${tournament.prize_pool.toLocaleString()} Prize
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No tournament history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats && stats.tournamentsWon > 0 && (
                    <div className="flex items-center gap-3 p-4 border border-yellow-600/30 rounded-lg bg-yellow-600/10">
                      <Medal className="h-8 w-8 text-yellow-400" />
                      <div>
                        <h3 className="text-white font-semibold">Tournament Winner</h3>
                        <p className="text-gray-400 text-sm">Won {stats.tournamentsWon} tournament{stats.tournamentsWon !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                  
                  {stats && stats.winRate >= 70 && (
                    <div className="flex items-center gap-3 p-4 border border-purple-600/30 rounded-lg bg-purple-600/10">
                      <Star className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="text-white font-semibold">Elite Player</h3>
                        <p className="text-gray-400 text-sm">Maintained {stats.winRate.toFixed(1)}% win rate</p>
                      </div>
                    </div>
                  )}
                  
                  {stats && stats.matchesPlayed >= 10 && (
                    <div className="flex items-center gap-3 p-4 border border-blue-600/30 rounded-lg bg-blue-600/10">
                      <Trophy className="h-8 w-8 text-blue-400" />
                      <div>
                        <h3 className="text-white font-semibold">Veteran</h3>
                        <p className="text-gray-400 text-sm">Played {stats.matchesPlayed} matches</p>
                      </div>
                    </div>
                  )}
                  
                  {(!stats || (stats.tournamentsWon === 0 && stats.winRate < 70 && stats.matchesPlayed < 10)) && (
                    <div className="col-span-full text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No achievements unlocked yet</p>
                      <p className="text-gray-500 text-sm">Participate in tournaments to earn achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
