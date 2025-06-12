
import { CardContent } from "@/components/ui/card";
import { RoundSection } from "./RoundSection";
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
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <CardContent>
      <div className="space-y-8">
        {rounds.map((round) => (
          <RoundSection
            key={round}
            round={round}
            matches={matchesByRound[round]}
            participants={participants}
            totalRounds={rounds.length}
            canEditResult={canEditResult}
            onMatchUpdate={onMatchUpdate}
          />
        ))}
      </div>
    </CardContent>
  );
};
