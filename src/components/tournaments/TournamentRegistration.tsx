
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Crown, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTournamentRegistration } from "@/hooks/useTournamentRegistration";
import { AuthModal } from "@/components/auth/AuthModal";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentRegistrationProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isRegistered: boolean;
  onRegistrationChange: () => void;
}

export const TournamentRegistration = ({
  tournament,
  participants,
  isRegistered,
  onRegistrationChange
}: TournamentRegistrationProps) => {
  const { user } = useAuth();
  const { registerForTournament, unregisterFromTournament, loading } = useTournamentRegistration();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleRegister = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const success = await registerForTournament(tournament.id, tournament.title);
    if (success) {
      onRegistrationChange();
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    
    const success = await unregisterFromTournament(tournament.id);
    if (success) {
      onRegistrationChange();
    }
  };

  const canRegister = () => {
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const isFull = participants.length >= tournament.max_participants;
    const deadlinePassed = now > deadline;
    const registrationOpen = tournament.status === 'registration_open' || tournament.status === 'upcoming';
    
    return registrationOpen && !isFull && !deadlinePassed && !isRegistered;
  };

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
    <>
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tournament Registration
            </CardTitle>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              {participants.length}/{tournament.max_participants} Registered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registration Status & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              {isRegistered ? (
                <div className="p-2 bg-green-600 rounded-full">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              ) : canRegister() ? (
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
                {canRegister() && (
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
                  onClick={handleUnregister}
                  disabled={loading}
                  className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                >
                  {loading ? "Leaving..." : "Leave Tournament"}
                </Button>
              ) : canRegister() ? (
                <Button 
                  onClick={handleRegister}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  {loading ? "Registering..." : "Register Now"}
                </Button>
              ) : !user ? (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  Sign In to Register
                </Button>
              ) : null}
            </div>
          </div>

          {/* Participants List */}
          {participants.length > 0 && (
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
                    {participant.user_id === user?.id && (
                      <Badge className="bg-green-600 text-white text-xs">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tournament Schedule Info */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h4 className="text-white font-semibold">Tournament Schedule</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Registration Deadline:</span>
                <br />
                <span className="text-white">
                  {new Date(tournament.registration_deadline).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Tournament Start:</span>
                <br />
                <span className="text-white">
                  {new Date(tournament.start_date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
