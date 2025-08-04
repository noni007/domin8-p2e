
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { TournamentCard } from "./TournamentCard";
import { TournamentCardSkeleton } from "./TournamentCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import type { SearchFilters } from "./TournamentSearch";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentWithData extends Tournament {
  participantCount: number;
  isRegistered: boolean;
}

interface TournamentListProps {
  filters?: SearchFilters;
}

export const TournamentList = ({ filters }: TournamentListProps) => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const { error, isError, handleError, clearError, retryWithErrorHandling } = useErrorHandler();
  const [tournaments, setTournaments] = React.useState<TournamentWithData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      clearError();
      
      // Build query with filters
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(id, user_id, status)
        `);

      // Apply filters
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      
      if (filters?.game) {
        query = query.eq('game', filters.game);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      const sortField = filters?.sortBy || 'created_at';
      const ascending = sortField === 'start_date' || sortField === 'registration_deadline';
      query = query.order(sortField, { ascending });

      const { data: tournamentsData, error: tournamentsError } = await query;

      if (tournamentsError) throw tournamentsError;

      let enrichedTournaments: TournamentWithData[] = (tournamentsData || []).map(tournament => {
        const participants = tournament.tournament_participants || [];
        const participantCount = participants.filter(p => p.status === 'registered' || p.status === 'winner').length;
        const isRegistered = user ? participants.some(p => p.user_id === user.id && (p.status === 'registered' || p.status === 'winner')) : false;

        return {
          ...tournament,
          participantCount,
          isRegistered
        };
      });

      // Apply prize range filter (post-query filtering for complex ranges)
      if (filters?.prizeRange) {
        const [min, max] = filters.prizeRange.split('-').map(s => s === '+' ? Infinity : parseInt(s));
        enrichedTournaments = enrichedTournaments.filter(t => {
          const prizeInDollars = t.prize_pool / 100;
          return prizeInDollars >= min && (max === Infinity || prizeInDollars <= max);
        });
      }

      setTournaments(enrichedTournaments);
    } catch (error) {
      handleError(error, "Failed to load tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTournaments();
  }, [user, filters]);

  const handleRegistrationChange = () => {
    fetchTournaments(); // Refresh the tournament list
  };

  if (isError) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-400">{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => retryWithErrorHandling(fetchTournaments)}
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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
    const hasFilters = filters && (filters.query || filters.game || filters.status || filters.prizeRange);
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">
          {hasFilters ? "No tournaments match your search" : "No tournaments available"}
        </div>
        <p className="text-gray-500">
          {hasFilters 
            ? "Try adjusting your search filters or check back later"
            : "Check back later for upcoming tournaments or create your own!"
          }
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
