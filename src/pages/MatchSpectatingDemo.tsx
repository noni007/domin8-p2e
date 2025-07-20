import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Users } from "lucide-react";
import { LiveMatchSpectator } from "@/components/matches/LiveMatchSpectator";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

export const MatchSpectatingDemo = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemoData();
  }, []);

  const fetchDemoData = async () => {
    try {
      // Fetch active matches for demo
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['in_progress', 'scheduled'])
        .order('scheduled_time')
        .limit(10);

      if (matchError) throw matchError;

      setMatches(matchData || []);

      // Fetch participants for these matches
      if (matchData && matchData.length > 0) {
        const tournamentIds = [...new Set(matchData.map(m => m.tournament_id))];
        
        const { data: participantData, error: participantError } = await supabase
          .from('tournament_participants')
          .select('*')
          .in('tournament_id', tournamentIds);

        if (participantError) throw participantError;
        setParticipants(participantData || []);
      }
    } catch (error) {
      console.error('Error fetching demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatusBadge = (status: string) => {
    const statusConfig = {
      'in_progress': { label: '🔴 LIVE', className: 'bg-red-600' },
      'scheduled': { label: '⏰ Scheduled', className: 'bg-blue-600' },
      'completed': { label: '✅ Completed', className: 'bg-green-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, className: 'bg-gray-600' };
    
    return (
      <Badge className={`${config.className} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.user_id === userId);
    return participant?.team_name || `Player ${userId.slice(0, 8)}`;
  };

  if (selectedMatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedMatch(null)}
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Match List
          </Button>
        </div>

        <LiveMatchSpectator
          match={selectedMatch}
          participants={participants}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Live Match Spectating</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Watch live matches in real-time with instant updates, spectator count, and match events.
          Experience the thrill of tournament action as it happens!
        </p>
      </div>

      {/* Demo Info */}
      <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Real-time Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/20 rounded-lg">
              <Play className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Live Updates</h3>
              <p className="text-gray-300 text-sm">Match scores and status update instantly</p>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Spectator Count</h3>
              <p className="text-gray-300 text-sm">See how many people are watching</p>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg">
              <Badge className="h-8 w-8 text-purple-400 mx-auto mb-2 rounded-full flex items-center justify-center">🔔</Badge>
              <h3 className="text-white font-semibold mb-1">Live Events</h3>
              <p className="text-gray-300 text-sm">Real-time match events and notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Matches */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Available Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No active matches available for spectating.</p>
              <p className="text-gray-500 text-sm mt-2">
                Check back later or create a tournament to generate matches!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card 
                  key={match.id}
                  className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMatch(match)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">
                            Match #{match.match_number}
                          </h3>
                          {getMatchStatusBadge(match.status)}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {getParticipantName(match.player1_id)} vs {match.player2_id ? getParticipantName(match.player2_id) : 'TBD'}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {new Date(match.scheduled_time).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {match.status === 'completed' && (
                          <div className="text-white font-mono">
                            {match.score_player1} - {match.score_player2}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSelectedMatch(match)}
                        >
                          {match.status === 'in_progress' ? 'Watch Live' : 'View Match'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};