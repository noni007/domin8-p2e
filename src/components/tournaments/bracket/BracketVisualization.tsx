
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface BracketVisualizationProps {
  matches: Match[];
  participants: TournamentParticipant[];
  canEditResult: boolean;
  onMatchUpdate: () => void;
}

export const BracketVisualization = ({ 
  matches, 
  participants, 
  canEditResult, 
  onMatchUpdate 
}: BracketVisualizationProps) => {
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>);

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const getRoundName = (round: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  const getPlayerName = (participant: TournamentParticipant | undefined) => {
    if (!participant) return 'TBD';
    const index = participants.indexOf(participant);
    return `Player ${index + 1}`;
  };

  const getMatchStatus = (match: Match) => {
    switch (match.status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'scheduled': return 'Scheduled';
      default: return 'Pending';
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12" role="status" aria-label="No matches available">
        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-400">No matches available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" role="region" aria-label="Tournament bracket visualization">
      {/* Tournament Progress Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30" role="banner">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Tournament Progress</h3>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>{participants.length} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                <span>{totalRounds} Rounds</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {getRoundName(Math.max(...rounds.filter(r => 
                matchesByRound[r].some(m => m.status === 'completed')
              )) || 1)}
            </div>
            <div className="text-gray-400 text-sm">Current Round</div>
          </div>
        </div>
      </div>

      {/* Bracket Flow Visualization */}
      <div className="relative overflow-x-auto" role="main" aria-label="Tournament bracket matches">
        <div className="flex gap-8 min-w-max pb-4">
          {rounds.map((round, roundIndex) => (
            <div key={round} className="flex flex-col items-center space-y-4 min-w-[280px]" role="region" aria-labelledby={`round-${round}-heading`}>
              {/* Round Header */}
              <div id={`round-${round}-heading`} className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/30">
                <Badge className="bg-blue-600 text-white font-semibold">
                  {getRoundName(round)}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">
                  {matchesByRound[round].length} match{matchesByRound[round].length !== 1 ? 'es' : ''}
                </div>
              </div>

              {/* Matches */}
              <div className="space-y-4" role="list" aria-label={`Matches in ${getRoundName(round)}`}>
                {matchesByRound[round].map((match, matchIndex) => {
                  const player1 = participants.find(p => p.user_id === match.player1_id);
                  const player2 = participants.find(p => p.user_id === match.player2_id);
                  
                  return (
                    <Card 
                      key={match.id} 
                      className="bg-black/40 border-blue-800/30 backdrop-blur-sm w-64 hover:border-blue-600/50 transition-all duration-200 focus-within:border-blue-600/70"
                      role="listitem"
                      tabIndex={0}
                      aria-label={`Match ${match.match_number}: ${getPlayerName(player1)} vs ${getPlayerName(player2)}, Status: ${getMatchStatus(match)}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          // Focus management for match interaction
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          {/* Match Info */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              className={`text-xs ${
                                match.status === 'completed' ? 'bg-green-600' : 
                                match.status === 'in_progress' ? 'bg-yellow-600' : 'bg-blue-600'
                              } text-white`}
                              aria-label={`Match ${match.match_number}, status: ${getMatchStatus(match)}`}
                            >
                              Match #{match.match_number}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <time dateTime={match.scheduled_time}>
                                {new Date(match.scheduled_time).toLocaleDateString()}
                              </time>
                            </div>
                          </div>

                          {/* Players */}
                          <div className="space-y-2" role="group" aria-label="Match participants">
                            <div className={`flex items-center justify-between p-2 rounded text-sm ${
                              match.winner_id === match.player1_id ? 'bg-green-600/20 border border-green-500/30' : 'bg-gray-800/50'
                            }`} role="group" aria-label={`Player 1: ${getPlayerName(player1)}`}>
                              <span className="text-white font-medium">{getPlayerName(player1)}</span>
                              <div className="flex items-center gap-2">
                                {match.status === 'completed' && (
                                  <span className="text-white font-mono text-xs" aria-label={`Score: ${match.score_player1}`}>
                                    {match.score_player1}
                                  </span>
                                )}
                                {match.winner_id === match.player1_id && (
                                  <Trophy className="h-3 w-3 text-yellow-400" aria-label="Winner" />
                                )}
                              </div>
                            </div>
                            
                            <div className="text-center" aria-hidden="true">
                              <span className="text-gray-400 text-xs">VS</span>
                            </div>
                            
                            <div className={`flex items-center justify-between p-2 rounded text-sm ${
                              match.winner_id === match.player2_id ? 'bg-green-600/20 border border-green-500/30' : 'bg-gray-800/50'
                            }`} role="group" aria-label={`Player 2: ${getPlayerName(player2)}`}>
                              <span className="text-white font-medium">{getPlayerName(player2)}</span>
                              <div className="flex items-center gap-2">
                                {match.status === 'completed' && (
                                  <span className="text-white font-mono text-xs" aria-label={`Score: ${match.score_player2}`}>
                                    {match.score_player2}
                                  </span>
                                )}
                                {match.winner_id === match.player2_id && (
                                  <Trophy className="h-3 w-3 text-yellow-400" aria-label="Winner" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          {!player1 || !player2 ? (
                            <div className="text-center py-1 bg-yellow-600/20 rounded text-yellow-400 text-xs" role="status">
                              Awaiting players
                            </div>
                          ) : match.status === 'scheduled' ? (
                            <div className="text-center py-1 bg-blue-600/20 rounded text-blue-400 text-xs" role="status">
                              Scheduled
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Connection Arrow */}
              {roundIndex < rounds.length - 1 && (
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-0" aria-hidden="true">
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
