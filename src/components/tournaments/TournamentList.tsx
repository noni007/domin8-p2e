
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase, Tournament } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TournamentCard } from "./TournamentCard";
import { TournamentDetails } from "./TournamentDetails";

export const TournamentList = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleRegister = async (tournamentId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for tournaments.",
        variant: "destructive"
      });
      return;
    }

    setRegistering(tournamentId);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: tournamentId,
          user_id: user.id,
          registration_date: new Date().toISOString(),
          status: 'registered'
        }]);

      if (error) throw error;

      setUserRegistrations(prev => [...prev, tournamentId]);
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this tournament.",
      });
    } catch (error) {
      console.error('Error registering for tournament:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistering(null);
    }
  };

  const handleViewDetails = (tournamentId: string) => {
    setSelectedTournament(tournamentId);
  };

  const handleBackToList = () => {
    setSelectedTournament(null);
    fetchUserRegistrations(); // Refresh registrations in case user registered
  };

  if (selectedTournament) {
    return (
      <TournamentDetails 
        tournamentId={selectedTournament} 
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/40 border-blue-800/30 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Active Tournaments</h2>
        <Badge className="bg-blue-600 text-white">
          {tournaments.length} Tournament{tournaments.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      {tournaments.length === 0 ? (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-gray-400">Be the first to create a tournament!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onRegister={handleRegister}
              onViewDetails={handleViewDetails}
              isRegistered={userRegistrations.includes(tournament.id)}
              loading={registering === tournament.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
