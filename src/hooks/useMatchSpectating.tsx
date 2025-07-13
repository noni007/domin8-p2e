import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpectatorData {
  id: string;
  user_id: string;
  match_id: string;
  joined_at: string;
  is_active: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface MatchSpectatingData {
  spectators: SpectatorData[];
  spectatorCount: number;
  isSpectating: boolean;
  matchStatus: string;
}

export const useMatchSpectating = (matchId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [spectatingData, setSpectatingData] = useState<MatchSpectatingData>({
    spectators: [],
    spectatorCount: 0,
    isSpectating: false,
    matchStatus: 'scheduled'
  });
  const [loading, setLoading] = useState(true);

  // Fetch current spectators
  const fetchSpectators = async () => {
    try {
      const { data: spectators, error } = await supabase
        .from('match_spectators')
        .select(`
          id,
          user_id,
          match_id,
          joined_at,
          is_active,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('match_id', matchId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching spectators:', error);
        return;
      }

      const isUserSpectating = user ? spectators?.some(s => s.user_id === user.id) : false;

      setSpectatingData(prev => ({
        ...prev,
        spectators: spectators || [],
        spectatorCount: spectators?.length || 0,
        isSpectating: isUserSpectating
      }));
    } catch (error) {
      console.error('Error in fetchSpectators:', error);
    } finally {
      setLoading(false);
    }
  };

  // Join as spectator
  const joinAsSpectator = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to spectate matches.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if already spectating
      const { data: existing } = await supabase
        .from('match_spectators')
        .select('id')
        .eq('match_id', matchId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existing) {
        setSpectatingData(prev => ({ ...prev, isSpectating: true }));
        return true;
      }

      // Add as new spectator
      const { error } = await supabase
        .from('match_spectators')
        .insert({
          match_id: matchId,
          user_id: user.id,
          is_active: true
        });

      if (error) {
        console.error('Error joining as spectator:', error);
        toast({
          title: "Error",
          description: "Failed to join as spectator.",
          variant: "destructive",
        });
        return false;
      }

      // Update live match session spectator count
      await supabase.rpc('increment_spectator_count', { match_id: matchId });

      setSpectatingData(prev => ({ ...prev, isSpectating: true }));
      
      toast({
        title: "Joined as spectator",
        description: "You are now watching this match live.",
      });

      return true;
    } catch (error) {
      console.error('Error joining as spectator:', error);
      return false;
    }
  };

  // Leave spectating
  const leaveSpectating = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('match_spectators')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving spectating:', error);
        return false;
      }

      // Update live match session spectator count
      await supabase.rpc('decrement_spectator_count', { match_id: matchId });

      setSpectatingData(prev => ({ ...prev, isSpectating: false }));

      toast({
        title: "Left spectating",
        description: "You are no longer watching this match.",
      });

      return true;
    } catch (error) {
      console.error('Error leaving spectating:', error);
      return false;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchSpectators();

    // Subscribe to spectator changes
    const spectatorChannel = supabase
      .channel(`match_spectators_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_spectators',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchSpectators();
        }
      )
      .subscribe();

    // Subscribe to match status changes
    const matchChannel = supabase
      .channel(`match_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          setSpectatingData(prev => ({
            ...prev,
            matchStatus: payload.new.status
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(spectatorChannel);
      supabase.removeChannel(matchChannel);
    };
  }, [matchId, user?.id]);

  return {
    ...spectatingData,
    loading,
    joinAsSpectator,
    leaveSpectating,
    refreshSpectators: fetchSpectators
  };
};