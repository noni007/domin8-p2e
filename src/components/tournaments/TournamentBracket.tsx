
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { BracketControls } from "./BracketControls";
import { TournamentStats } from "./TournamentStats";
import { TournamentManagement } from "./TournamentManagement";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeMatches } from "@/hooks/useRealTimeMatches";
import { BracketHeader } from "./bracket/BracketHeader";
import { BracketEmptyState } from "./bracket/BracketEmptyState";
import { BracketLoadingState } from "./bracket/BracketLoadingState";
import { BracketRounds } from "./bracket/BracketRounds";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentBracketProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  bracketGenerated: boolean;
  onBracketGenerated: () => void;
}

export const TournamentBracket = ({ 
  tournament, 
  participants, 
  bracketGenerated,
  onBracketGenerated 
}: TournamentBracketProps) => {
  const { user } = useAuth();

  // Check if current user is the organizer
  const isOrganizer = user?.id === tournament.organizer_id;

  // Use real-time matches hook
  const { matches, loading } = useRealTimeMatches({
    tournamentId: tournament.id,
    onMatchUpdate: () => {
      console.log('Match updated - refreshing tournament data');
      onBracketGenerated();
    }
  });

  const handleBracketChange = () => {
    onBracketGenerated();
  };

  const handleMatchUpdate = () => {
    // The real-time hook will automatically update the matches
    console.log('Match result submitted');
  };

  const canEditResult = isOrganizer || matches.some(match => 
    user?.id === match.player1_id || user?.id === match.player2_id
  );

  return (
    <div className="space-y-6" role="region" aria-label="Tournament bracket section">
      {/* Tournament Statistics */}
      <section aria-labelledby="tournament-stats-heading">
        <h2 id="tournament-stats-heading" className="sr-only">Tournament Statistics</h2>
        <TournamentStats 
          tournament={tournament}
          participants={participants}
          matches={matches}
        />
      </section>

      {/* Tournament Management (Organizer Only) */}
      {isOrganizer && (
        <section aria-labelledby="tournament-management-heading">
          <h2 id="tournament-management-heading" className="sr-only">Tournament Management</h2>
          <TournamentManagement
            tournament={tournament}
            participants={participants}
            isOrganizer={isOrganizer}
            onUpdate={handleBracketChange}
          />
        </section>
      )}

      {/* Bracket Controls */}
      <section aria-labelledby="bracket-controls-heading">
        <h2 id="bracket-controls-heading" className="sr-only">Bracket Controls</h2>
        <BracketControls
          tournamentId={tournament.id}
          participants={participants}
          bracketGenerated={bracketGenerated}
          onBracketChange={handleBracketChange}
          isOrganizer={isOrganizer}
        />
      </section>
      
      {/* Bracket Display */}
      <section aria-labelledby="bracket-display-heading">
        <h2 id="bracket-display-heading" className="sr-only">Tournament Bracket</h2>
        {!bracketGenerated ? (
          <BracketEmptyState 
            participants={participants} 
            isOrganizer={isOrganizer} 
          />
        ) : loading ? (
          <BracketLoadingState />
        ) : (
          <Card 
            className="bg-black/40 border-blue-800/30 backdrop-blur-sm"
            role="region"
            aria-label="Interactive tournament bracket"
          >
            <BracketHeader />
            <BracketRounds
              matches={matches}
              participants={participants}
              canEditResult={canEditResult}
              onMatchUpdate={handleMatchUpdate}
            />
          </Card>
        )}
      </section>
    </div>
  );
};
