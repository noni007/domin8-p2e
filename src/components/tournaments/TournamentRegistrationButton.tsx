
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
  const { registerForTournament, unregisterFromTournament, isRegistering } = useTournamentRegistrationWithFees();

  const handleRegistration = async () => {
    if (isRegistered) {
      const result = await unregisterFromTournament(tournamentId, entryFee);
      if (result.success) {
        onRegistrationChange();
      }
    } else {
      const result = await registerForTournament(tournamentId, entryFee);
      if (result.success) {
        onRegistrationChange();
      }
    }
  };

  if (!user) {
    return null;
  }

  const formatFee = (kobo: number) => `₦${(kobo / 100).toFixed(2)}`;

  return (
    <Button
      onClick={handleRegistration}
      disabled={isRegistering}
      variant={isRegistered ? "outline" : "default"}
      className={
        isRegistered
          ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
          : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      }
    >
      {isRegistering ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isRegistered ? (
        <Trophy className="h-4 w-4 mr-2" />
      ) : entryFee > 0 ? (
        <DollarSign className="h-4 w-4 mr-2" />
      ) : (
        <Trophy className="h-4 w-4 mr-2" />
      )}
      {isRegistering 
        ? "Processing..." 
        : isRegistered 
          ? "Unregister" 
          : entryFee > 0 
            ? `Pay ${formatFee(entryFee)}` 
            : "Register"
      }
    </Button>
  );
};
