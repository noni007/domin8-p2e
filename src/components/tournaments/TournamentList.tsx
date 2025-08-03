
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { TournamentCard } from "./TournamentCard";
import { TournamentCardSkeleton } from "./TournamentCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentWithData extends Tournament {
  participantCount: number;
  isRegistered: boolean;
}

export const TournamentList = () => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [tournaments, setTournaments] = React.useState<TournamentWithData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      
      // Fetch tournaments with participant counts
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(id, user_id, status)
        `)
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      const enrichedTournaments: TournamentWithData[] = (tournamentsData || []).map(tournament => {
        const participants = tournament.tournament_participants || [];
        const participantCount = participants.filter(p => p.status === 'registered' || p.status === 'winner').length;
        const isRegistered = user ? participants.some(p => p.user_id === user.id && (p.status === 'registered' || p.status === 'winner')) : false;

        return {
          ...tournament,
          participantCount,
          isRegistered
        };
      });

      setTournaments(enrichedTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTournaments();
  }, [user]);

  const handleRegistrationChange = () => {
    fetchTournaments(); // Refresh the tournament list
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TournamentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No tournaments available</div>
        <p className="text-gray-500">
          Check back later for upcoming tournaments or create your own!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          participantCount={tournament.participantCount}
          isRegistered={tournament.isRegistered}
          onRegistrationChange={handleRegistrationChange}
        />
      ))}
    </div>
  );
};
