
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketEmptyStateProps {
  participants: TournamentParticipant[];
  isOrganizer: boolean;
}

export const BracketEmptyState = ({ participants, isOrganizer }: BracketEmptyStateProps) => {
  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tournament Bracket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mb-4">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Bracket Not Generated</h3>
            <p className="text-gray-400 mb-4">
              {isOrganizer 
                ? "Generate the tournament bracket to start organizing matches." 
                : "Waiting for the organizer to generate the bracket."
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
              <Users className="h-4 w-4" />
              <span>{participants.length} participants registered</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
