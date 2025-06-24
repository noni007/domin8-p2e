
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';
import type { Tables } from '@/integrations/supabase/types';

type Match = Tables<'matches'>;

interface UseRealTimeMatchesProps {
  tournamentId: string;
  onMatchUpdate?: () => void;
}

export const useRealTimeMatches = ({ tournamentId, onMatchUpdate }: UseRealTimeMatchesProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchMatches = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchMatches();
    }
  }, [tournamentId]);

  // Real-time subscription
  const { channel } = useRealTimeSubscription({
    channelName: `matches-${tournamentId}`,
    enabled: !!tournamentId,
    onSubscriptionReady: (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Real-time match update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setMatches(prev => [...prev, payload.new as Match]);
          } else if (payload.eventType === 'UPDATE') {
            setMatches(prev => 
              prev.map(match => 
                match.id === payload.new.id ? payload.new as Match : match
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => 
              prev.filter(match => match.id !== payload.old.id)
            );
          }

          if (onMatchUpdate) {
            onMatchUpdate();
          }
        }
      );
    }
  });

  return { matches, loading, setMatches };
};
