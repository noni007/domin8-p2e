
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedBracketVisualization } from "../EnhancedBracketVisualization";
import { MatchResultForm } from "../MatchResultForm";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketRoundsProps {
  matches: Match[];
  participants: TournamentParticipant[];
  canEditResult: boolean;
  onMatchUpdate: () => void;
}

export const BracketRounds = ({ 
  matches, 
  participants, 
  canEditResult, 
  onMatchUpdate 
}: BracketRoundsProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleCloseForm = () => {
    setSelectedMatch(null);
  };

  const handleMatchUpdated = () => {
    setSelectedMatch(null);
    onMatchUpdate();
  };

  if (matches.length === 0) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">No matches scheduled yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <CardContent className="p-6">
        <EnhancedBracketVisualization
          matches={matches}
          participants={participants}
          canEditResult={canEditResult}
          onMatchUpdate={onMatchUpdate}
          onEditMatch={handleEditMatch}
        />
      </CardContent>
      
      {/* Match Result Form Modal */}
      {selectedMatch && (
        <MatchResultForm
          match={selectedMatch}
          participants={participants}
          onClose={handleCloseForm}
          onMatchUpdated={handleMatchUpdated}
        />
      )}
    </>
  );
};
