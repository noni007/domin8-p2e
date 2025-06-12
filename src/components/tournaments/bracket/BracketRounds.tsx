
import { CardContent } from "@/components/ui/card";
import { BracketVisualization } from "./BracketVisualization";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketRoundsProps {
  matches: Match[];
  participants: TournamentParticipant[];
  canEditResult: boolean;
  onMatchUpdate: () => void;
}

export const BracketRounds = ({ matches, participants, canEditResult, onMatchUpdate }: BracketRoundsProps) => {
  return (
    <CardContent>
      <BracketVisualization
        matches={matches}
        participants={participants}
        canEditResult={canEditResult}
        onMatchUpdate={onMatchUpdate}
      />
    </CardContent>
  );
};
