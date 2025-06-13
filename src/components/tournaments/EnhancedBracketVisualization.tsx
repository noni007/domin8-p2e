
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, Crown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface EnhancedBracketVisualizationProps {
  matches: Match[];
  participants: TournamentParticipant[];
  canEditResult: boolean;
  onMatchUpdate: () => void;
  onEditMatch: (match: Match) => void;
}

export const EnhancedBracketVisualization = ({ 
  matches, 
  participants, 
  canEditResult, 
  onMatchUpdate,
  onEditMatch 
}: EnhancedBracketVisualizationProps) => {
  const getPlayerName = (playerId: string) => {
    const participant = participants.find(p => p.user_id === playerId);
    return participant?.team_name || `Player ${playerId.slice(0, 8)}`;
  };

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') {
      return { color: 'bg-green-600', text: 'Completed' };
    }
    if (match.status === 'in_progress') {
      return { color: 'bg-yellow-600', text: 'Live' };
    }
    if (match.player1_id && match.player2_id) {
      return { color: 'bg-blue-600', text: 'Scheduled' };
    }
    return { color: 'bg-gray-600', text: 'Waiting' };
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds && totalRounds > 1) return "Final";
    if (round === totalRounds - 1 && totalRounds > 2) return "Semi-Final";
    if (round === totalRounds - 2 && totalRounds > 3) return "Quarter-Final";
    return `Round ${round}`;
  };

  // Group matches by round
  const roundsMap = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const totalRounds = Math.max(...rounds);

  if (matches.length === 0) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Bracket Generated</h3>
          <p className="text-gray-400">The tournament bracket hasn't been created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {rounds.map((round) => {
        const roundMatches = roundsMap[round].sort((a, b) => a.bracket_position - b.bracket_position);
        
        return (
          <div key={round} className="space-y-4">
            {/* Round Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  {getRoundName(round, totalRounds)}
                </Badge>
                <span className="text-gray-400">
                  {roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              
              {round === totalRounds && (
                <Crown className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            
            {/* Round Matches */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roundMatches.map((match) => {
                const status = getMatchStatus(match);
                const isWinner1 = match.winner_id === match.player1_id;
                const isWinner2 = match.winner_id === match.player2_id;
                
                return (
                  <Card 
                    key={match.id} 
                    className="bg-black/60 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-gray-400">
                          Match {match.match_number}
                        </CardTitle>
                        <Badge className={`${status.color} text-white text-xs`}>
                          {status.text}
                        </Badge>
                      </div>
                      
                      {match.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(match.scheduled_time).toLocaleString()}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Player 1 */}
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        isWinner1 ? 'bg-green-600/20 border border-green-600/40' : 
                        match.status === 'completed' ? 'bg-red-600/10 border border-red-600/20' :
                        'bg-gray-800/40 border border-gray-600/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isWinner1 && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className={`font-semibold ${
                            isWinner1 ? 'text-green-400' : 'text-white'
                          }`}>
                            {match.player1_id ? getPlayerName(match.player1_id) : 'TBD'}
                          </span>
                        </div>
                        {match.score_player1 !== null && (
                          <span className={`font-bold ${
                            isWinner1 ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {match.score_player1}
                          </span>
                        )}
                      </div>
                      
                      {/* VS Divider */}
                      <div className="text-center">
                        <span className="text-gray-500 text-sm font-bold">VS</span>
                      </div>
                      
                      {/* Player 2 */}
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        isWinner2 ? 'bg-green-600/20 border border-green-600/40' : 
                        match.status === 'completed' ? 'bg-red-600/10 border border-red-600/20' :
                        'bg-gray-800/40 border border-gray-600/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isWinner2 && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className={`font-semibold ${
                            isWinner2 ? 'text-green-400' : 'text-white'
                          }`}>
                            {match.player2_id ? getPlayerName(match.player2_id) : 'TBD'}
                          </span>
                        </div>
                        {match.score_player2 !== null && (
                          <span className={`font-bold ${
                            isWinner2 ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {match.score_player2}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      {canEditResult && match.player1_id && match.player2_id && match.status !== 'completed' && (
                        <Button 
                          onClick={() => onEditMatch(match)}
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                        >
                          Enter Result
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
