
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, Play, Users, Shuffle, Clock } from "lucide-react";
import { generateTournamentBracket, resetTournamentBracket } from "@/utils/bracketGenerator";
import { supabase } from "@/integrations/supabase/client";
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
  const [startingTournament, setStartingTournament] = useState(false);

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

  const handleStartTournament = async () => {
    setStartingTournament(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ 
          status: 'in_progress',
          registration_deadline: new Date().toISOString() // Close registration immediately
        })
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: "Tournament Started!",
        description: "The tournament has officially begun. Registration is now closed.",
      });

      onBracketChange();
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to start tournament.",
        variant: "destructive"
      });
    } finally {
      setStartingTournament(false);
    }
  };

  const calculateRounds = () => {
    if (participants.length < 2) return 0;
    return Math.ceil(Math.log2(participants.length));
  };

  const getNextPowerOf2 = () => {
    return Math.pow(2, Math.ceil(Math.log2(participants.length)));
  };

  const getByes = () => {
    const nextPowerOf2 = getNextPowerOf2();
    return nextPowerOf2 - participants.length;
  };

  if (!isOrganizer) {
    return null;
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tournament Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tournament Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{participants.length}</div>
            <div className="text-xs text-gray-400">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{calculateRounds()}</div>
            <div className="text-xs text-gray-400">Rounds</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{getNextPowerOf2()}</div>
            <div className="text-xs text-gray-400">Bracket Size</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{getByes()}</div>
            <div className="text-xs text-gray-400">Byes</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!bracketGenerated ? (
            <div className="space-y-2">
              <Button 
                onClick={handleGenerateBracket}
                disabled={generating || participants.length < 2}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {generating ? "Generating..." : "Generate Bracket"}
              </Button>
              
              {participants.length < 2 && (
                <p className="text-yellow-400 text-sm text-center">
                  Need at least 2 participants to generate bracket
                </p>
              )}
              
              {participants.length >= 2 && getByes() > 0 && (
                <p className="text-blue-400 text-sm text-center">
                  {getByes()} participant(s) will receive first-round byes
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleStartTournament}
                disabled={startingTournament}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {startingTournament ? "Starting..." : "Start Tournament"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleGenerateBracket}
                  disabled={generating}
                  variant="outline"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {generating ? "Regenerating..." : "Regenerate"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                      disabled={resetting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 border-blue-800/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Reset Tournament Bracket?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        This will delete all matches and reset the tournament to registration status. 
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
                        disabled={resetting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {resetting ? "Resetting..." : "Reset Bracket"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-400 space-y-1 p-3 bg-black/20 rounded">
          <p><strong>Generate Bracket:</strong> Creates tournament matches with randomized seeding</p>
          <p><strong>Start Tournament:</strong> Officially begins the tournament and closes registration</p>
          <p><strong>Regenerate:</strong> Creates a new bracket with different seeding (loses current progress)</p>
          <p><strong>Reset:</strong> Completely removes the bracket and reopens registration</p>
        </div>
      </CardContent>
    </Card>
  );
};
