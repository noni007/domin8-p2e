
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TournamentCard } from "./TournamentCard";
import { TournamentDetails } from "./TournamentDetails";
import { TournamentCardSkeleton } from "./TournamentCardSkeleton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

type Tournament = Tables<'tournaments'> & {
  entry_fee?: number;
};

export const TournamentList = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [tournamentParticipants, setTournamentParticipants] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserRegistrations();
      fetchTournamentParticipants();
    }
  }, [user]);

  // Real-time subscription for tournaments
  useRealTimeSubscription({
    channelName: 'tournaments-list',
    enabled: true,
    onSubscriptionReady: (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        (payload) => {
          console.log('Tournament list update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTournaments(prev => [payload.new as Tournament, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTournaments(prev => 
              prev.map(tournament => 
                tournament.id === payload.new.id ? payload.new as Tournament : tournament
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTournaments(prev => 
              prev.filter(tournament => tournament.id !== payload.old.id)
            );
          }
        }
      );
    }
  });

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

    setRegistrationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRegistrations(data?.map(reg => reg.tournament_id) || []);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    } finally {
      setRegistrationsLoading(false);
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

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament.id);
  };

  const handleBackToList = () => {
    setSelectedTournament(null);
    fetchUserRegistrations();
    fetchTournamentParticipants();
  };

  const handleRegistrationChange = () => {
    fetchUserRegistrations();
    fetchTournamentParticipants();
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Active Tournaments</h2>
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-gray-400">Loading tournaments...</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Active Tournaments</h2>
        <div className="flex items-center gap-3">
          {registrationsLoading && <LoadingSpinner size="sm" />}
          <Badge className="bg-blue-600 text-white">
            {tournaments.length} Tournament{tournaments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
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
              participants={tournamentParticipants[tournament.id] || []}
              onViewDetails={handleViewDetails}
              isRegistered={userRegistrations.includes(tournament.id)}
              onRegistrationChange={handleRegistrationChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
