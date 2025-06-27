import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingAnalytics } from "@/hooks/useOnboardingAnalytics";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;

export const FirstTournamentStep = () => {
  const { user } = useAuth();
  const { trackTournamentRegistration } = useOnboardingAnalytics();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingTournaments();
  }, []);

  const fetchUpcomingTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId: string) => {
    if (!user) return;

    setRegistering(tournamentId);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered'
        });

      if (error) throw error;

      // Track tournament registration in analytics
      trackTournamentRegistration(tournamentId);

      toast({
        title: "Registration Successful! 🎉",
        description: "You're now registered for your first tournament. Good luck!",
      });

      // Refresh tournaments to update participant count
      fetchUpcomingTournaments();
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRegistering(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading tournaments...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-white">Ready for Your First Tournament?</h3>
        <p className="text-gray-400">
          {tournaments.length > 0 
            ? "Here are some upcoming tournaments perfect for new players"
            : "No upcoming tournaments right now, but don't worry - new ones are added regularly!"
          }
        </p>
      </div>

      {tournaments.length > 0 ? (
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-black/40 border-blue-800/30 hover:border-blue-700/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xl font-semibold text-white">{tournament.title}</h4>
                      <Badge className="bg-green-600 text-white">
                        {tournament.status}
                      </Badge>
                    </div>
                    <p className="text-gray-300">{tournament.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">
                      ${tournament.prize_pool || 0}
                    </div>
                    <p className="text-sm text-gray-400">Prize Pool</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(tournament.start_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Users className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Max Players</p>
                      <p className="text-sm font-medium">{tournament.max_participants}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-300">
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-xs text-gray-400">Entry Fee</p>
                      <p className="text-sm font-medium">${tournament.entry_fee || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Trophy className="h-4 w-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-sm font-medium capitalize">{tournament.tournament_type}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Registration open
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Online
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handleRegister(tournament.id)}
                    disabled={registering === tournament.id}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {registering === tournament.id ? (
                      'Registering...'
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Join Tournament
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center space-y-6 p-8">
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-white">No Active Tournaments</h4>
            <p className="text-gray-400 max-w-md mx-auto">
              Tournaments are added regularly. Check back soon or explore the platform 
              to see past tournaments and prepare for upcoming competitions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <Trophy className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Browse Past Tournaments</p>
              <p className="text-xs text-gray-400">See what competitions looked like</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Connect with Players</p>
              <p className="text-xs text-gray-400">Build your network while you wait</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center pt-6">
        <div className="p-4 bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg border border-blue-800/30">
          <h4 className="text-white font-medium mb-2">New to competitive gaming?</h4>
          <p className="text-gray-300 text-sm">
            Don't worry! Most tournaments have skill brackets, and you can always start with 
            smaller competitions to build your confidence and ranking.
          </p>
        </div>
      </div>
    </div>
  );
};
