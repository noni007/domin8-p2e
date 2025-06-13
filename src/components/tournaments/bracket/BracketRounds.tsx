
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

  const getPlayerName = (playerId: string) => {
    const participant = participants.find(p => p.user_id === playerId);
    return participant?.team_name || `Player ${playerId.slice(0, 8)}`;
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
      {selectedMatch && selectedMatch.player1_id && selectedMatch.player2_id && (
        <MatchResultForm
          matchId={selectedMatch.id}
          player1Id={selectedMatch.player1_id}
          player2Id={selectedMatch.player2_id}
          player1Name={getPlayerName(selectedMatch.player1_id)}
          player2Name={getPlayerName(selectedMatch.player2_id)}
          tournamentId={selectedMatch.tournament_id}
          onResultSubmitted={handleMatchUpdated}
        />
      )}
    </>
  );
};
