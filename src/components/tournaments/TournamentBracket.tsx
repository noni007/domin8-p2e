
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { generateTournamentBracket } from "@/utils/bracketGenerator";
import { MatchCard } from "./MatchCard";
import { toast } from "@/hooks/use-toast";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentBracketProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  bracketGenerated: boolean;
  onBracketGenerated: () => void;
}

export const TournamentBracket = ({ 
  tournamentId, 
  participants, 
  bracketGenerated,
  onBracketGenerated 
}: TournamentBracketProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (bracketGenerated) {
      fetchMatches();
    }
  }, [tournamentId, bracketGenerated]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round')
        .order('bracket_position');

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament bracket.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
      onBracketGenerated();
      await fetchMatches();
      
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

  const handleMatchUpdate = () => {
    fetchMatches(); // Refresh matches when a match is updated
  };

  if (!bracketGenerated) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Bracket Not Generated</h3>
              <p className="text-gray-400 mb-4">
                Generate the tournament bracket to start organizing matches.
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                <Users className="h-4 w-4" />
                <span>{participants.length} participants registered</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateBracket}
              disabled={generating || participants.length < 2}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {generating ? "Generating..." : "Generate Bracket"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-1/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-600 rounded"></div>
              <div className="h-20 bg-gray-600 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {rounds.map((round) => (
              <div key={round} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {round === rounds.length ? 'Final' : 
                     round === rounds.length - 1 ? 'Semi-Final' : 
                     round === rounds.length - 2 ? 'Quarter-Final' : 
                     `Round ${round}`}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    {matchesByRound[round].length} match{matchesByRound[round].length !== 1 ? 'es' : ''}
                  </span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matchesByRound[round].map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      participants={participants}
                      onMatchUpdate={handleMatchUpdate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
