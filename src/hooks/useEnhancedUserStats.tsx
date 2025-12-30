
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Tournament = Tables<'tournaments'>;

interface PublicProfile {
  id: string;
  username: string;
  user_type: string;
  avatar_url: string | null;
  skill_rating: number | null;
  games_played: number | null;
  win_rate: number | null;
  current_streak: number | null;
  best_streak: number | null;
  created_at: string;
}

interface EnhancedUserStats extends PublicProfile {
  rank: number;
  recentMatches: any[];
  achievements: any[];
  ratingHistory: any[];
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
  recentPerformance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  averageMatchesPerDay: number;
  totalPlayTime: number;
  lastActiveDate: string;
}

export const useEnhancedUserStats = (userId?: string) => {
  const [stats, setStats] = React.useState<EnhancedUserStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);

  React.useEffect(() => {
    if (!userId) return;

    const fetchEnhancedStats = async () => {
      try {
        // Get user profile using secure RPC
        const { data: allProfiles, error: profileError } = await supabase
          .rpc('get_public_profiles');

        if (profileError) throw profileError;

        const profile = (allProfiles || []).find((p: PublicProfile) => p.id === userId);
        
        if (!profile) {
          console.error('Profile not found for user:', userId);
          setLoading(false);
          return;
        }

        // Get user's rank based on skill rating (count users with higher rating)
        const rank = (allProfiles || []).filter(
          (p: PublicProfile) => (p.skill_rating || 0) > (profile.skill_rating || 0)
        ).length + 1;

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

        // Get user tournaments
        const { data: userTournaments, error: tournamentsError } = await supabase
          .from('tournament_participants')
          .select(`
            tournament_id,
            status,
            tournaments (*)
          `)
          .eq('user_id', userId);

        if (tournamentsError) throw tournamentsError;

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

        // Calculate enhanced stats
        const totalMatches = recentMatches?.length || 0;
        const wonMatches = recentMatches?.filter(match => match.winner_id === userId).length || 0;
        const calculatedWinRate = totalMatches > 0 ? wonMatches / totalMatches : 0;
        const tournamentsPlayed = userTournaments?.length || 0;
        const tournamentsWon = userTournaments?.filter(t => t.status === 'winner').length || 0;

        // Determine tier based on skill rating
        const getTier = (rating: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' => {
          if (rating >= 2000) return 'Master';
          if (rating >= 1800) return 'Diamond';
          if (rating >= 1600) return 'Platinum';
          if (rating >= 1400) return 'Gold';
          if (rating >= 1200) return 'Silver';
          return 'Bronze';
        };

        const enhancedStats: EnhancedUserStats = {
          ...profile,
          rank,
          recentMatches: recentMatches || [],
          achievements: achievements || [],
          ratingHistory: ratingHistory || [],
          tournamentsPlayed,
          tournamentsWon,
          matchesPlayed: totalMatches,
          matchesWon: wonMatches,
          winRate: calculatedWinRate * 100,
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.best_streak || 0,
          averageRoundsReached: 0,
          favoriteGame: 'N/A',
          recentPerformance: calculatedWinRate * 100,
          tier: getTier(profile.skill_rating || 1000),
          averageMatchesPerDay: 0,
          totalPlayTime: 0,
          lastActiveDate: new Date().toISOString()
        };

        setStats(enhancedStats);
        setTournaments(userTournaments?.map(t => t.tournaments).filter(Boolean) as Tournament[] || []);
      } catch (error) {
        console.error('Error fetching enhanced user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedStats();
  }, [userId]);

  return { stats, tournaments, loading };
};
