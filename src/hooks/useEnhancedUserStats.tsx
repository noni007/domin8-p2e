
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface EnhancedUserStats extends Profile {
  rank: number;
  recentMatches: any[];
  achievements: any[];
  ratingHistory: any[];
}

export const useEnhancedUserStats = (userId?: string) => {
  const [stats, setStats] = useState<EnhancedUserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchEnhancedStats = async () => {
      try {
        // Get user profile with enhanced stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Get user's rank based on skill rating
        const { data: rankData, error: rankError } = await supabase
          .from('profiles')
          .select('id')
          .gt('skill_rating', profile.skill_rating || 0)
          .order('skill_rating', { ascending: false });

        if (rankError) throw rankError;

        // Get recent matches
        const { data: recentMatches, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            tournament:tournaments(title)
          `)
          .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10);

        if (matchesError) throw matchesError;

        // Get rating history
        const { data: ratingHistory, error: historyError } = await supabase
          .from('skill_rating_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (historyError) throw historyError;

        // Get achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievement:achievements(*)
          `)
          .eq('user_id', userId);

        if (achievementsError) throw achievementsError;

        setStats({
          ...profile,
          rank: (rankData?.length || 0) + 1,
          recentMatches: recentMatches || [],
          achievements: achievements || [],
          ratingHistory: ratingHistory || []
        });
      } catch (error) {
        console.error('Error fetching enhanced user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedStats();
  }, [userId]);

  return { stats, loading };
};
