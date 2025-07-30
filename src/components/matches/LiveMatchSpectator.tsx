import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, EyeOff, Trophy, Clock, Signal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Match = Tables<'matches'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface LiveMatchSpectatorProps {
  match: Match;
  participants: TournamentParticipant[];
}

export const LiveMatchSpectator = ({ match, participants }: LiveMatchSpectatorProps) => {
  const { user } = useAuth();
  const [isSpectating, setIsSpectating] = React.useState(false);
  const [spectatorCount, setSpectatorCount] = React.useState(0);
  const [matchEvents, setMatchEvents] = React.useState<any[]>([]);
  const [liveSession, setLiveSession] = React.useState<any>(null);

  // Get player names
  const player1 = participants.find(p => p.user_id === match.player1_id);
  const player2 = participants.find(p => p.user_id === match.player2_id);

  // Real-time subscription for match updates and events
  const { isSubscribed } = useRealTimeSubscription({
    channelName: `live-match-${match.id}`,
    enabled: true,
    onSubscriptionReady: (channel) => {
      // Listen for match updates
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${match.id}`
        },
        (payload) => {
          console.log('Live match update:', payload);
        }
      );

      // Listen for match events
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${match.id}`
        },
        (payload) => {
          console.log('New match event:', payload);
          setMatchEvents(prev => [payload.new, ...prev]);
        }
      );

      // Listen for live session updates
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_match_sessions',
          filter: `match_id=eq.${match.id}`
        },
        (payload) => {
          console.log('Live session update:', payload);
          if (payload.new) {
            setLiveSession(payload.new);
            setSpectatorCount((payload.new as any)?.spectator_count || 0);
          }
        }
      );

      // Listen for spectator changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_spectators',
          filter: `match_id=eq.${match.id}`
        },
        (payload) => {
          console.log('Spectator update:', payload);
          fetchSpectatorCount();
        }
      );
    }
  });

  // Fetch initial data
  React.useEffect(() => {
    fetchInitialData();
    fetchSpectatorCount();
  }, [match.id]);

  const fetchInitialData = async () => {
    try {
      // Fetch live session
      const { data: session } = await supabase
        .from('live_match_sessions')
        .select('*')
        .eq('match_id', match.id)
        .single();

      if (session) {
        setLiveSession(session);
        setSpectatorCount(session.spectator_count || 0);
      }

      // Fetch recent match events
      const { data: events } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (events) {
        setMatchEvents(events);
      }

      // Check if user is currently spectating
      if (user) {
        const { data: spectator } = await supabase
          .from('match_spectators')
          .select('*')
          .eq('match_id', match.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        setIsSpectating(!!spectator);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchSpectatorCount = async () => {
    try {
      const { count } = await supabase
        .from('match_spectators')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .eq('is_active', true);

      setSpectatorCount(count || 0);
    } catch (error) {
      console.error('Error fetching spectator count:', error);
    }
  };

  const toggleSpectating = async () => {
    if (!user) return;

    try {
      if (isSpectating) {
        // Stop spectating
        await supabase
          .from('match_spectators')
          .update({ is_active: false, left_at: new Date().toISOString() })
          .eq('match_id', match.id)
          .eq('user_id', user.id);

        // Decrement spectator count
        await supabase.rpc('decrement_spectator_count', { match_id: match.id });
        
        setIsSpectating(false);
      } else {
        // Start spectating
        await supabase
          .from('match_spectators')
          .insert({
            match_id: match.id,
            user_id: user.id,
            is_active: true
          });

        // Increment spectator count
        await supabase.rpc('increment_spectator_count', { match_id: match.id });
        
        setIsSpectating(true);
      }
    } catch (error) {
      console.error('Error toggling spectating:', error);
    }
  };

  const getMatchStatusColor = () => {
    switch (match.status) {
      case 'in_progress': return 'bg-green-600';
      case 'completed': return 'bg-gray-600';
      case 'scheduled': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      {/* Match Header */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Signal className="h-5 w-5 text-green-400" />
                Live Match #{match.match_number}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getMatchStatusColor()} text-white`}>
                  {match.status === 'in_progress' ? '🔴 LIVE' : match.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {isSubscribed && (
                  <Badge className="bg-green-600 text-white">
                    Real-time Connected
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Users className="h-4 w-4" />
                <span>{spectatorCount} watching</span>
              </div>
              {user && (
                <Button
                  onClick={toggleSpectating}
                  variant={isSpectating ? "destructive" : "default"}
                  size="sm"
                  className="gap-2"
                >
                  {isSpectating ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isSpectating ? 'Stop Watching' : 'Watch Live'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg text-center ${
              match.winner_id === match.player1_id ? 'bg-green-600/20 border border-green-500/30' : 'bg-gray-800/50'
            }`}>
              <div className="text-white font-semibold mb-2">
                {player1?.team_name || `Player ${match.player1_id.slice(0, 8)}`}
              </div>
              <div className="flex items-center justify-center gap-2">
                {match.status === 'completed' && (
                  <span className="text-2xl font-bold text-white">
                    {match.score_player1}
                  </span>
                )}
                {match.winner_id === match.player1_id && (
                  <Trophy className="h-5 w-5 text-yellow-400" />
                )}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              match.winner_id === match.player2_id ? 'bg-green-600/20 border border-green-500/30' : 'bg-gray-800/50'
            }`}>
              <div className="text-white font-semibold mb-2">
                {player2?.team_name || `Player ${match.player2_id?.slice(0, 8) || 'TBD'}`}
              </div>
              <div className="flex items-center justify-center gap-2">
                {match.status === 'completed' && (
                  <span className="text-2xl font-bold text-white">
                    {match.score_player2}
                  </span>
                )}
                {match.winner_id === match.player2_id && (
                  <Trophy className="h-5 w-5 text-yellow-400" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Events Feed */}
      {matchEvents.length > 0 && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {matchEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <span className="text-white text-sm">
                    {event.event_type}: {JSON.stringify(event.event_data)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatEventTime(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};