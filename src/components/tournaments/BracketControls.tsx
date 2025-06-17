
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trophy, RotateCcw, Users, Play } from "lucide-react";
import { useTournamentLifecycle } from "@/hooks/useTournamentLifecycle";
import { resetTournamentBracket } from "@/utils/bracketGenerator";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketControlsProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  bracketGenerated: boolean;
  onBracketChange: () => void;
  isOrganizer: boolean;
}

export const BracketControls = ({
  tournamentId,
  participants,
  bracketGenerated,
  onBracketChange,
  isOrganizer
}: BracketControlsProps) => {
  const { generateBracket, loading } = useTournamentLifecycle();
  const [resetting, setResetting] = useState(false);

  const handleGenerateBracket = async () => {
    const success = await generateBracket(tournamentId);
    if (success) {
      onBracketChange();
    }
  };

  const handleResetBracket = async () => {
    setResetting(true);
    try {
      await resetTournamentBracket(tournamentId);
      onBracketChange();
      toast({
        title: "Bracket Reset",
        description: "Tournament bracket has been reset successfully.",
      });
    } catch (error) {
      console.error('Error resetting bracket:', error);
      toast({
        title: "Error",
        description: "Failed to reset tournament bracket.",
        variant: "destructive"
      });
    } finally {
      setResetting(false);
    }
  };

  if (!isOrganizer) {
    return null;
  }

  const canGenerateBracket = participants.length >= 2 && !bracketGenerated;
  const canResetBracket = bracketGenerated;

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Bracket Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants.length} participants registered</span>
          </div>
          <div className="text-gray-400">
            {bracketGenerated ? "Bracket Generated" : "No Bracket"}
          </div>
        </div>

        <div className="space-y-2">
          {canGenerateBracket && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={loading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? "Generating..." : "Generate Tournament Bracket"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-blue-800/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Generate Tournament Bracket?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will create a tournament bracket with {participants.length} participants. 
                    Matches will be automatically scheduled and participants will be randomly seeded.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleGenerateBracket}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Generate Bracket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canResetBracket && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  disabled={resetting}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {resetting ? "Resetting..." : "Reset Bracket"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-red-800/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Reset Tournament Bracket?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will delete all matches and reset the tournament bracket. 
                    All match results will be lost. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetBracket}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reset Bracket
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {participants.length < 2 && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Need at least 2 participants to generate a bracket
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
