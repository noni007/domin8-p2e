
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { BracketControls } from "./BracketControls";
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

  if (!bracketGenerated) {
    return (
      <div className="space-y-6">
        <BracketControls
          tournamentId={tournament.id}
          participants={participants}
          bracketGenerated={bracketGenerated}
          onBracketChange={handleBracketChange}
          isOrganizer={isOrganizer}
        />
        
        <BracketEmptyState 
          participants={participants} 
          isOrganizer={isOrganizer} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <BracketControls
          tournamentId={tournament.id}
          participants={participants}
          bracketGenerated={bracketGenerated}
          onBracketChange={handleBracketChange}
          isOrganizer={isOrganizer}
        />
        
        <BracketLoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BracketControls
        tournamentId={tournament.id}
        participants={participants}
        bracketGenerated={bracketGenerated}
        onBracketChange={handleBracketChange}
        isOrganizer={isOrganizer}
      />
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <BracketHeader />
        <BracketRounds
          matches={matches}
          participants={participants}
          canEditResult={canEditResult}
          onMatchUpdate={handleMatchUpdate}
        />
      </Card>
    </div>
  );
};
