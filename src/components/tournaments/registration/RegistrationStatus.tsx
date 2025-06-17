
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Users, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface RegistrationStatusProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isRegistered: boolean;
  canRegister: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  loading: boolean;
  user: any;
  onSignIn: () => void;
}

export const RegistrationStatus = ({
  tournament,
  participants,
  isRegistered,
  canRegister,
  onRegister,
  onUnregister,
  loading,
  user,
  onSignIn
}: RegistrationStatusProps) => {
  const getRegistrationMessage = () => {
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const isFull = participants.length >= tournament.max_participants;
    const deadlinePassed = now > deadline;
    
    if (isRegistered) return "You are registered for this tournament";
    if (!user) return "Please sign in to register for tournaments";
    if (deadlinePassed) return "Registration deadline has passed";
    if (isFull) return "Tournament is full";
    if (tournament.status === 'in_progress') return "Tournament is already in progress";
    if (tournament.status === 'completed') return "Tournament has ended";
    return "Register now to secure your spot";
  };

  const spotsRemaining = tournament.max_participants - participants.length;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        {isRegistered ? (
          <div className="p-2 bg-green-600 rounded-full">
            <Crown className="h-4 w-4 text-white" />
          </div>
        ) : canRegister ? (
          <div className="p-2 bg-blue-600 rounded-full">
            <Users className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="p-2 bg-gray-600 rounded-full">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
        )}
        <div>
          <p className="text-white font-medium">{getRegistrationMessage()}</p>
          {spotsRemaining > 0 && spotsRemaining <= 5 && !isRegistered && (
            <p className="text-orange-400 text-sm">Only {spotsRemaining} spots remaining!</p>
          )}
          {canRegister && (
            <p className="text-gray-400 text-sm">
              Registration closes on {new Date(tournament.registration_deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        {isRegistered ? (
          <Button 
            variant="outline" 
            onClick={onUnregister}
            disabled={loading}
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
          >
            {loading ? "Leaving..." : "Leave Tournament"}
          </Button>
        ) : canRegister ? (
          <Button 
            onClick={onRegister}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {loading ? "Registering..." : "Register Now"}
          </Button>
        ) : !user ? (
          <Button 
            onClick={onSignIn}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            Sign In to Register
          </Button>
        ) : null}
      </div>
    </div>
  );
};
