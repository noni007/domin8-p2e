
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchResults } from "@/hooks/useMatchResults";
import { Trophy, Loader2 } from "lucide-react";

interface MatchResultFormProps {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  tournamentId: string;
  onResultSubmitted: () => void;
}

export const MatchResultForm = ({
  matchId,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  tournamentId,
  onResultSubmitted
}: MatchResultFormProps) => {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const { submitMatchResult, loading } = useMatchResults();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const winnerId = player1Score > player2Score ? player1Id : player2Id;
    
    const success = await submitMatchResult(
      matchId,
      winnerId,
      player1Score,
      player2Score
    );

    if (success) {
      onResultSubmitted();
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Submit Match Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="player1Score" className="text-gray-300">
                {player1Name} Score
              </Label>
              <Input
                id="player1Score"
                type="number"
                min="0"
                value={player1Score}
                onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                className="bg-black/20 border-blue-800/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="player2Score" className="text-gray-300">
                {player2Name} Score
              </Label>
              <Input
                id="player2Score"
                type="number"
                min="0"
                value={player2Score}
                onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                className="bg-black/20 border-blue-800/30 text-white"
              />
            </div>
          </div>
          
          <div className="text-center text-gray-300">
            Winner: {player1Score > player2Score ? player1Name : 
                    player2Score > player1Score ? player2Name : 
                    "Tie"}
          </div>

          <Button
            type="submit"
            disabled={loading || player1Score === player2Score}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {loading ? "Submitting..." : "Submit Result"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
