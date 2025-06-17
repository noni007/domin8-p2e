
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTournamentRegistration } from "@/hooks/useTournamentRegistration";
import { AuthModal } from "@/components/auth/AuthModal";
import { RegistrationStatus } from "./registration/RegistrationStatus";
import { ParticipantsList } from "./registration/ParticipantsList";
import { TournamentSchedule } from "./registration/TournamentSchedule";
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
          <RegistrationStatus
            tournament={tournament}
            participants={participants}
            isRegistered={isRegistered}
            canRegister={canRegister()}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            loading={loading}
            user={user}
            onSignIn={() => setShowAuthModal(true)}
          />

          <ParticipantsList 
            participants={participants} 
            currentUserId={user?.id} 
          />

          <TournamentSchedule tournament={tournament} />
        </CardContent>
      </Card>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
