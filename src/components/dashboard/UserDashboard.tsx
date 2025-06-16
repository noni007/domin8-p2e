
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useTournaments } from "@/hooks/useTournaments";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { EnhancedActivityFeed } from "@/components/activity/EnhancedActivityFeed";
import { SocialActivityFeed } from "@/components/activity/SocialActivityFeed";
import { RealTimeUpdates } from "@/components/notifications/RealTimeUpdates";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'> & {
  entry_fee?: number;
};

export const UserDashboard = () => {
  const { user } = useAuth();
  const { stats } = useUserStats(user?.id);
  const { tournaments } = useTournaments();
  const { toast } = useToast();
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [tournamentParticipants, setTournamentParticipants] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
      fetchTournamentParticipants();
    }
  }, [user, tournaments]);

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRegistrations(data?.map(reg => reg.tournament_id) || []);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const fetchTournamentParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*');

      if (error) throw error;
      
      const participantsByTournament = (data || []).reduce((acc, participant) => {
        if (!acc[participant.tournament_id]) {
          acc[participant.tournament_id] = [];
        }
        acc[participant.tournament_id].push(participant);
        return acc;
      }, {} as Record<string, any[]>);

      setTournamentParticipants(participantsByTournament);
    } catch (error) {
      console.error('Error fetching tournament participants:', error);
    }
  };

  const upcomingTournaments = tournaments
    .filter(t => t.status === 'upcoming')
    .slice(0, 3);

  const activeTournaments = tournaments
    .filter(t => t.status === 'active')
    .slice(0, 2);

  const handleViewTournamentDetails = (tournament: Tournament) => {
    toast({
      title: "Tournament Details",
      description: "Tournament details feature coming soon!",
    });
    console.log('View tournament details:', tournament.id);
  };

  const handleRegistrationChange = () => {
    fetchUserRegistrations();
    fetchTournamentParticipants();
  };

  return (
    <div className="space-y-8">
      {/* Real-time Updates */}
      <RealTimeUpdates userId={user?.id || ''} />

      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Gamer'}! 🎮
        </h1>
        <p className="text-gray-400">
          Ready to dominate some tournaments today?
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.tournamentsWon}</p>
                  <p className="text-sm text-gray-400">Tournaments Won</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-400">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">#{stats.rank}</p>
                  <p className="text-sm text-gray-400">Global Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                  <p className="text-sm text-gray-400">Current Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tournaments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tournaments */}
          {activeTournaments.length > 0 && (
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                  Active Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament}
                    participants={tournamentParticipants[tournament.id] || []}
                    isRegistered={userRegistrations.includes(tournament.id)}
                    onRegistrationChange={handleRegistrationChange}
                    onViewDetails={handleViewTournamentDetails}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tournaments */}
          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                Upcoming Tournaments
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTournaments.length > 0 ? (
                upcomingTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament}
                    participants={tournamentParticipants[tournament.id] || []}
                    isRegistered={userRegistrations.includes(tournament.id)}
                    onRegistrationChange={handleRegistrationChange}
                    onViewDetails={handleViewTournamentDetails}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No upcoming tournaments. Check back later!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Personal Activity Feed */}
          <EnhancedActivityFeed 
            title="Your Recent Activity"
            maxItems={8}
            showFilters={true}
          />
        </div>

        {/* Right Column - Social Feed */}
        <div className="space-y-6">
          <SocialActivityFeed />
        </div>
      </div>
    </div>
  );
};
