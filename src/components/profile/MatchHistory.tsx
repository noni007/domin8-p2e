
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Trophy, Target } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface MatchWithDetails extends Match {
  tournament: Tournament;
  player1: TournamentParticipant;
  player2: TournamentParticipant | null;
}

interface MatchHistoryProps {
  userId: string;
}

export const MatchHistory = ({ userId }: MatchHistoryProps) => {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchHistory();
  }, [userId]);

  const fetchMatchHistory = async () => {
    try {
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments!inner (
            id,
            title,
            game
          )
        `)
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch participant details for each match
      const matchesWithDetails: MatchWithDetails[] = [];
      
      for (const match of matchData || []) {
        const { data: participants } = await supabase
          .from('tournament_participants')
          .select('*')
          .in('user_id', [match.player1_id, match.player2_id].filter(Boolean))
          .eq('tournament_id', match.tournament_id);

        const player1 = participants?.find(p => p.user_id === match.player1_id);
        const player2 = participants?.find(p => p.user_id === match.player2_id);

        if (player1) {
          matchesWithDetails.push({
            ...match,
            tournament: match.tournaments as Tournament,
            player1,
            player2: player2 || null
          });
        }
      }

      setMatches(matchesWithDetails);
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchResult = (match: MatchWithDetails) => {
    if (match.status !== 'completed' || !match.winner_id) {
      return { result: 'Pending', color: 'bg-gray-600' };
    }
    
    const isWinner = match.winner_id === userId;
    return {
      result: isWinner ? 'Victory' : 'Defeat',
      color: isWinner ? 'bg-green-600' : 'bg-red-600'
    };
  };

  const getOpponentName = (match: MatchWithDetails) => {
    const isPlayer1 = match.player1_id === userId;
    const opponent = isPlayer1 ? match.player2 : match.player1;
    return opponent?.team_name || 'TBD';
  };

  const getScore = (match: MatchWithDetails) => {
    if (!match.score_player1 && !match.score_player2) return '-';
    const isPlayer1 = match.player1_id === userId;
    const myScore = isPlayer1 ? match.score_player1 : match.score_player2;
    const opponentScore = isPlayer1 ? match.score_player2 : match.score_player1;
    return `${myScore || 0} - ${opponentScore || 0}`;
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => {
              const { result, color } = getMatchResult(match);
              
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-blue-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge className={color}>
                      {result === 'Victory' ? (
                        <Trophy className="h-3 w-3 mr-1" />
                      ) : result === 'Defeat' ? (
                        <Target className="h-3 w-3 mr-1" />
                      ) : (
                        <Calendar className="h-3 w-3 mr-1" />
                      )}
                      {result}
                    </Badge>
                    <div>
                      <h4 className="text-white font-medium">
                        vs {getOpponentName(match)}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {match.tournament.title} • {match.tournament.game}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {getScore(match)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Round {match.round}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No matches played yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Join tournaments to start competing!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
