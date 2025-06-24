
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';
import type { Tables } from '@/integrations/supabase/types';

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface UseRealTimeTournamentProps {
  tournamentId: string;
  onTournamentUpdate?: () => void;
}

export const useRealTimeTournament = ({ tournamentId, onTournamentUpdate }: UseRealTimeTournamentProps) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        // Fetch tournament
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('tournament_participants')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('status', 'registered');

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchTournamentData();
    }
  }, [tournamentId]);

  // Real-time subscription for tournament updates
  useRealTimeSubscription({
    channelName: `tournament-${tournamentId}`,
    enabled: !!tournamentId,
    onSubscriptionReady: (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Real-time tournament update:', payload);
          setTournament(payload.new as Tournament);
          if (onTournamentUpdate) {
            onTournamentUpdate();
          }
        }
      );
    }
  });

  // Real-time subscription for participants
  useRealTimeSubscription({
    channelName: `participants-${tournamentId}`,
    enabled: !!tournamentId,
    onSubscriptionReady: (channel) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_participants',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('Real-time participants update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newParticipant = payload.new as TournamentParticipant;
            if (newParticipant.status === 'registered') {
              setParticipants(prev => [...prev, newParticipant]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedParticipant = payload.new as TournamentParticipant;
            if (updatedParticipant.status === 'registered') {
              setParticipants(prev => 
                prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
              );
            } else {
              setParticipants(prev => prev.filter(p => p.id !== updatedParticipant.id));
            }
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      );
    }
  });

  return { tournament, participants, loading, setTournament, setParticipants };
};
