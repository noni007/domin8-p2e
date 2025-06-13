
import { Card, CardContent } from "@/components/ui/card";
import { MatchManagement } from "../MatchManagement";
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
  if (matches.length === 0) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">No matches scheduled yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Group matches by round
  const roundsMap = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds && totalRounds > 1) return "Final";
    if (round === totalRounds - 1 && totalRounds > 2) return "Semi-Final";
    if (round === totalRounds - 2 && totalRounds > 3) return "Quarter-Final";
    return `Round ${round}`;
  };

  const totalRounds = Math.max(...rounds);

  return (
    <CardContent className="p-6">
      <div className="space-y-8">
        {rounds.map((round) => {
          const roundMatches = roundsMap[round].sort((a, b) => a.bracket_position - b.bracket_position);
          
          return (
            <div key={round} className="space-y-4">
              <h3 className="text-xl font-bold text-white border-b border-blue-800/30 pb-2">
                {getRoundName(round, totalRounds)}
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roundMatches.map((match) => (
                  <MatchManagement
                    key={match.id}
                    match={match}
                    participants={participants}
                    canEditResult={canEditResult}
                    onMatchUpdate={onMatchUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  );
};
