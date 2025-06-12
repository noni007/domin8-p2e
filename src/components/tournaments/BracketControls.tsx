
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, Play } from "lucide-react";
import { generateTournamentBracket, resetTournamentBracket } from "@/utils/bracketGenerator";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketControlsProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  bracketGenerated: boolean;
  onBracketChange: () => void;
  isOrganizer?: boolean;
}

export const BracketControls = ({ 
  tournamentId, 
  participants, 
  bracketGenerated, 
  onBracketChange,
  isOrganizer = false 
}: BracketControlsProps) => {
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleGenerateBracket = async () => {
    if (participants.length < 2) {
      toast({
        title: "Not Enough Participants",
        description: "At least 2 participants are required to generate a bracket.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      await generateTournamentBracket(tournamentId, participants);
      onBracketChange();
      
      toast({
        title: "Bracket Generated!",
        description: "Tournament bracket has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating bracket:', error);
      toast({
        title: "Error",
        description: "Failed to generate tournament bracket.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
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

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="text-white text-lg">Bracket Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {!bracketGenerated ? (
            <Button 
              onClick={handleGenerateBracket}
              disabled={generating || participants.length < 2}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Bracket"}
            </Button>
          ) : (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    disabled={resetting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Bracket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/90 border-blue-800/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Reset Tournament Bracket?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This will delete all matches and reset the tournament to registration status. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetBracket}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={resetting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {resetting ? "Resetting..." : "Reset Bracket"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>Participants: {participants.length}</p>
          {participants.length >= 2 && (
            <p>Rounds needed: {Math.ceil(Math.log2(participants.length))}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
