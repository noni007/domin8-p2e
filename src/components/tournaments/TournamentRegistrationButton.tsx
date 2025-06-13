
import { Button } from "@/components/ui/button";
import { useTournamentRegistration } from "@/hooks/useTournamentRegistration";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Loader2 } from "lucide-react";

interface TournamentRegistrationButtonProps {
  tournamentId: string;
  tournamentTitle: string;
  isRegistered: boolean;
  onRegistrationChange: () => void;
}

export const TournamentRegistrationButton = ({
  tournamentId,
  tournamentTitle,
  isRegistered,
  onRegistrationChange
}: TournamentRegistrationButtonProps) => {
  const { user } = useAuth();
  const { registerForTournament, unregisterFromTournament, loading } = useTournamentRegistration();

  const handleRegistration = async () => {
    if (isRegistered) {
      const success = await unregisterFromTournament(tournamentId);
      if (success) {
        onRegistrationChange();
      }
    } else {
      const success = await registerForTournament(tournamentId, tournamentTitle);
      if (success) {
        onRegistrationChange();
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={handleRegistration}
      disabled={loading}
      variant={isRegistered ? "outline" : "default"}
      className={
        isRegistered
          ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
          : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Trophy className="h-4 w-4 mr-2" />
      )}
      {loading ? "Processing..." : isRegistered ? "Unregister" : "Register"}
    </Button>
  );
};
