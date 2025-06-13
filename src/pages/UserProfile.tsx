import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EnhancedProfileStats } from "@/components/profile/EnhancedProfileStats";
import { TournamentHistory } from "@/components/profile/TournamentHistory";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { Achievements } from "@/components/profile/Achievements";
import { RealTimeUpdates } from "@/components/notifications/RealTimeUpdates";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;
type Tournament = Tables<'tournaments'>;

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
}

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
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

      // Calculate enhanced stats
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

      // Calculate streaks
      const sortedMatches = matchesData?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const match of sortedMatches) {
        if (match.winner_id === userId) {
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
        } else if (match.status === 'completed') {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
          if (currentStreak > 0) currentStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate average rounds reached
      const roundsReached = participationsData?.map(p => {
        const userMatches = matchesData?.filter(m => 
          m.tournament_id === p.tournament_id && 
          (m.player1_id === userId || m.player2_id === userId)
        ) || [];
        return Math.max(...userMatches.map(m => m.round), 0);
      }) || [];
      
      const averageRoundsReached = roundsReached.length > 0 
        ? roundsReached.reduce((a, b) => a + b, 0) / roundsReached.length 
        : 0;

      // Find favorite game
      const gameStats: Record<string, number> = {};
      userTournaments.forEach(t => {
        if (t && t.game) {
          gameStats[t.game] = (gameStats[t.game] || 0) + 1;
        }
      });
      
      const favoriteGame = Object.keys(gameStats).reduce((a, b) => 
        gameStats[a] > gameStats[b] ? a : b, 'N/A'
      );

      setStats({
        tournamentsPlayed,
        tournamentsWon,
        matchesPlayed,
        matchesWon,
        winRate,
        rank: Math.floor(Math.random() * 1000) + 1, // Placeholder ranking
        currentStreak,
        longestStreak,
        averageRoundsReached,
        favoriteGame
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTournament = (tournamentId: string) => {
    navigate(`/tournaments?view=${tournamentId}`);
  };

  const handleEditProfile = () => {
    navigate('/profile');
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
        <div className="text-center">
          <h2 className="text-white text-xl mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-4">The requested profile could not be found.</p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Real-time Updates */}
          <RealTimeUpdates userId={userId} />

          {/* Profile Header */}
          <ProfileHeader 
            profile={profile}
            stats={stats}
            isOwnProfile={isOwnProfile}
            onEditProfile={isOwnProfile ? handleEditProfile : undefined}
          />

          {/* Enhanced Stats Overview */}
          {stats && <EnhancedProfileStats stats={stats} />}

          {/* Detailed Information */}
          <Tabs defaultValue="tournaments" className="space-y-4">
            <TabsList className="bg-black/40 border-blue-800/30">
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
                Tournament History
              </TabsTrigger>
              <TabsTrigger value="matches" className="data-[state=active]:bg-blue-600">
                Match History
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tournaments">
              <TournamentHistory 
                tournaments={tournaments}
                onViewTournament={handleViewTournament}
              />
            </TabsContent>

            <TabsContent value="matches">
              <MatchHistory userId={userId!} />
            </TabsContent>

            <TabsContent value="achievements">
              {stats && <Achievements stats={stats} />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
