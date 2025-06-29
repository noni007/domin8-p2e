
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Tournament = Tables<'tournaments'>;

interface EnhancedUserStats extends Profile {
  rank: number;
  recentMatches: any[];
  achievements: any[];
  ratingHistory: any[];
  // Add missing properties for compatibility
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
  const [stats, setStats] = useState<EnhancedUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

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
        const winRate = totalMatches > 0 ? wonMatches / totalMatches : 0;
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
          rank: (rankData?.length || 0) + 1,
          recentMatches: recentMatches || [],
          achievements: achievements || [],
          ratingHistory: ratingHistory || [],
          tournamentsPlayed,
          tournamentsWon,
          matchesPlayed: totalMatches,
          matchesWon: wonMatches,
          winRate: winRate * 100, // Convert to percentage
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.best_streak || 0,
          averageRoundsReached: 0, // Calculate based on tournament data
          favoriteGame: 'N/A', // Determine from most played game
          recentPerformance: winRate * 100,
          tier: getTier(profile.skill_rating || 1000),
          averageMatchesPerDay: 0, // Calculate based on match history
          totalPlayTime: 0, // Calculate based on session data
          lastActiveDate: new Date().toISOString()
        };

        setStats(enhancedStats);
        setTournaments(userTournaments?.map(t => t.tournaments).filter(Boolean) || []);
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
