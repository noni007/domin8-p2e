
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;

interface ParticipantsListProps {
  participants: TournamentParticipant[];
  currentUserId?: string;
}

export const ParticipantsList = ({ participants, currentUserId }: ParticipantsListProps) => {
  if (participants.length === 0) return null;

  return (
    <div>
      <h4 className="text-white font-semibold mb-3">Registered Participants</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {participants.map((participant, index) => (
          <div 
            key={participant.id}
            className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {index + 1}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {participant.team_name || `Player ${index + 1}`}
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(participant.registration_date).toLocaleDateString()}
              </p>
            </div>
            {participant.user_id === currentUserId && (
              <Badge className="bg-green-600 text-white text-xs">You</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
