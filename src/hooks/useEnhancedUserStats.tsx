
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type Match = Tables<'matches'>;

interface EnhancedUserStats {
  // Basic stats
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  
  // Advanced stats
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
  recentPerformance: number; // Win rate in last 10 matches
  
  // Rankings
  rank: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  
  // Activity stats
  averageMatchesPerDay: number;
  totalPlayTime: number; // in hours
  lastActiveDate: string;
}

export const useEnhancedUserStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<EnhancedUserStats | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEnhancedStats();
    }
  }, [userId]);

  const calculateTier = (winRate: number, matchesPlayed: number): EnhancedUserStats['tier'] => {
    if (matchesPlayed < 5) return 'Bronze';
    if (winRate >= 80 && matchesPlayed >= 20) return 'Master';
    if (winRate >= 70) return 'Diamond';
    if (winRate >= 60) return 'Platinum';
    if (winRate >= 50) return 'Gold';
    if (winRate >= 40) return 'Silver';
    return 'Bronze';
  };

  const calculateStreaks = (matches: Match[], userId: string) => {
    const sortedMatches = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (const match of sortedMatches) {
      const isWin = match.winner_id === userId;
      
      if (isWin) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak > 0) currentStreak = 0;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  };

  const fetchEnhancedStats = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Fetch tournament participations
      const { data: participationsData, error: participationsError } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          tournaments:tournament_id (*)
        `)
        .eq('user_id', userId);

      if (participationsError) throw participationsError;
      
      const userTournaments = participationsData?.map(p => p.tournaments).filter(Boolean) || [];
      setTournaments(userTournaments as Tournament[]);

      // Fetch all matches for this user
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;
      
      setMatches(matchesData || []);

      // Calculate comprehensive stats
      const tournamentsPlayed = participationsData?.length || 0;
      const tournamentsWon = participationsData?.filter(p => 
        p.tournaments?.status === 'completed' && 
        matchesData?.some(m => 
          m.tournament_id === p.tournament_id && 
          m.winner_id === userId && 
          m.round === Math.max(...matchesData.filter(match => match.tournament_id === p.tournament_id).map(match => match.round))
        )
      ).length || 0;

      const completedMatches = matchesData?.filter(m => m.status === 'completed') || [];
      const matchesPlayed = completedMatches.length;
      const matchesWon = completedMatches.filter(m => m.winner_id === userId).length;
      const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

      // Calculate streaks
      const { currentStreak, longestStreak } = calculateStreaks(matchesData || [], userId);

      // Calculate recent performance (last 10 matches)
      const recentMatches = completedMatches.slice(0, 10);
      const recentWins = recentMatches.filter(m => m.winner_id === userId).length;
      const recentPerformance = recentMatches.length > 0 ? (recentWins / recentMatches.length) * 100 : 0;

      // Calculate average rounds reached
      const roundsReached = participationsData?.map(p => {
        const userMatches = matchesData?.filter(m => 
          m.tournament_id === p.tournament_id && 
          (m.player1_id === userId || m.player2_id === userId)
        ) || [];
        return Math.max(...userMatches.map(m => m.round), 0);
      }) || [];
      
      const averageRoundsReached = roundsReached.length > 0 
        ? roundsReached.reduce((a, b) => a + b, 0) / roundsReached.length 
        : 0;

      // Find favorite game
      const gameStats: Record<string, number> = {};
      userTournaments.forEach(t => {
        if (t && t.game) {
          gameStats[t.game] = (gameStats[t.game] || 0) + 1;
        }
      });
      
      const favoriteGame = Object.keys(gameStats).reduce((a, b) => 
        gameStats[a] > gameStats[b] ? a : b, 'N/A'
      );

      // Calculate activity metrics
      const firstMatch = completedMatches[completedMatches.length - 1];
      const daysSinceFirst = firstMatch 
        ? Math.max(1, Math.floor((Date.now() - new Date(firstMatch.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
      const averageMatchesPerDay = matchesPlayed / daysSinceFirst;

      // Estimate total play time (15 minutes average per match)
      const totalPlayTime = matchesPlayed * 0.25; // hours

      const lastActiveDate = completedMatches[0]?.created_at || new Date().toISOString();

      const tier = calculateTier(winRate, matchesPlayed);
      const rank = Math.floor(Math.random() * 1000) + 1; // Placeholder ranking

      setStats({
        tournamentsPlayed,
        tournamentsWon,
        matchesPlayed,
        matchesWon,
        winRate,
        currentStreak,
        longestStreak,
        averageRoundsReached,
        favoriteGame,
        recentPerformance,
        rank,
        tier,
        averageMatchesPerDay,
        totalPlayTime,
        lastActiveDate
      });

    } catch (error) {
      console.error('Error fetching enhanced user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, tournaments, matches, loading, refetch: fetchEnhancedStats };
};
