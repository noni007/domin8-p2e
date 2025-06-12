
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "../MatchCard";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface RoundSectionProps {
  round: number;
  matches: Match[];
  participants: TournamentParticipant[];
  totalRounds: number;
  canEditResult: boolean;
  onMatchUpdate: () => void;
}

export const RoundSection = ({ 
  round, 
  matches, 
  participants, 
  totalRounds, 
  canEditResult, 
  onMatchUpdate 
}: RoundSectionProps) => {
  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-600 text-white">
          {getRoundName(round, totalRounds)}
        </Badge>
        <span className="text-gray-400 text-sm">
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            participants={participants}
            onMatchUpdate={onMatchUpdate}
            canEditResult={canEditResult}
          />
        ))}
      </div>
    </div>
  );
};
