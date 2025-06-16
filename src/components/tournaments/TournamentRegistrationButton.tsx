
import { Button } from "@/components/ui/button";
import { useTournamentRegistrationWithFees } from "@/hooks/useTournamentRegistrationWithFees";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Loader2, DollarSign } from "lucide-react";

interface TournamentRegistrationButtonProps {
  tournamentId: string;
  tournamentTitle: string;
  entryFee?: number;
  isRegistered: boolean;
  onRegistrationChange: () => void;
}

export const TournamentRegistrationButton = ({
  tournamentId,
  tournamentTitle,
  entryFee = 0,
  isRegistered,
  onRegistrationChange
}: TournamentRegistrationButtonProps) => {
  const { user } = useAuth();
  const { registerForTournament, unregisterFromTournament, loading } = useTournamentRegistrationWithFees();

  const handleRegistration = async () => {
    if (isRegistered) {
      const success = await unregisterFromTournament(tournamentId, entryFee, tournamentTitle);
      if (success) {
        onRegistrationChange();
      }
    } else {
      const success = await registerForTournament(tournamentId, tournamentTitle, entryFee);
      if (success) {
        onRegistrationChange();
      }
    }
  };

  if (!user) {
    return null;
  }

  const formatFee = (cents: number) => (cents / 100).toFixed(2);

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
      ) : isRegistered ? (
        <Trophy className="h-4 w-4 mr-2" />
      ) : entryFee > 0 ? (
        <DollarSign className="h-4 w-4 mr-2" />
      ) : (
        <Trophy className="h-4 w-4 mr-2" />
      )}
      {loading 
        ? "Processing..." 
        : isRegistered 
          ? "Unregister" 
          : entryFee > 0 
            ? `Pay $${formatFee(entryFee)}` 
            : "Register"
      }
    </Button>
  );
};
