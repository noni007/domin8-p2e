
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { MatchCard } from "./MatchCard";
import { BracketControls } from "./BracketControls";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeMatches } from "@/hooks/useRealTimeMatches";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentBracketProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  bracketGenerated: boolean;
  onBracketGenerated: () => void;
}

export const TournamentBracket = ({ 
  tournament, 
  participants, 
  bracketGenerated,
  onBracketGenerated 
}: TournamentBracketProps) => {
  const { user } = useAuth();

  // Check if current user is the organizer
  const isOrganizer = user?.id === tournament.organizer_id;

  // Use real-time matches hook
  const { matches, loading } = useRealTimeMatches({
    tournamentId: tournament.id,
    onMatchUpdate: () => {
      console.log('Match updated - refreshing tournament data');
      onBracketGenerated();
    }
  });

  const handleBracketChange = () => {
    onBracketGenerated();
  };

  const handleMatchUpdate = () => {
    // The real-time hook will automatically update the matches
    console.log('Match result submitted');
  };

  if (!bracketGenerated) {
    return (
      <div className="space-y-6">
        <BracketControls
          tournamentId={tournament.id}
          participants={participants}
          bracketGenerated={bracketGenerated}
          onBracketChange={handleBracketChange}
          isOrganizer={isOrganizer}
        />
        
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
                  {isOrganizer 
                    ? "Generate the tournament bracket to start organizing matches." 
                    : "Waiting for the organizer to generate the bracket."
                  }
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                  <Users className="h-4 w-4" />
                  <span>{participants.length} participants registered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <BracketControls
          tournamentId={tournament.id}
          participants={participants}
          bracketGenerated={bracketGenerated}
          onBracketChange={handleBracketChange}
          isOrganizer={isOrganizer}
        />
        
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
      </div>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  return (
    <div className="space-y-6">
      <BracketControls
        tournamentId={tournament.id}
        participants={participants}
        bracketGenerated={bracketGenerated}
        onBracketChange={handleBracketChange}
        isOrganizer={isOrganizer}
      />
      
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Bracket
            <Badge className="bg-green-600 text-white text-xs">
              Live Updates
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {rounds.map((round) => (
              <div key={round} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {getRoundName(round, rounds.length)}
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
                      canEditResult={isOrganizer || user?.id === match.player1_id || user?.id === match.player2_id}
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
