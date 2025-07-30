
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
}

export const useUserStats = (userId: string | undefined) => {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);

  React.useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserStats = async () => {
    if (!userId) return;

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

      // Calculate enhanced stats
      const tournamentsPlayed = participationsData?.length || 0;
      
      // Count tournament wins (simplified - in a real app you'd check final standings)
      const tournamentsWon = participationsData?.filter(p => 
        p.tournaments?.status === 'completed'
      ).length || 0;

      // Fetch matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`);

      const matchesPlayed = matchesData?.length || 0;
      const matchesWon = matchesData?.filter(m => m.winner_id === userId).length || 0;
      const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;

      // Calculate streaks
      const sortedMatches = matchesData?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const match of sortedMatches) {
        if (match.winner_id === userId) {
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
        } else if (match.status === 'completed') {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
          if (currentStreak > 0) currentStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

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

      setStats({
        tournamentsPlayed,
        tournamentsWon,
        matchesPlayed,
        matchesWon,
        winRate,
        rank: Math.floor(Math.random() * 1000) + 1, // Placeholder ranking
        currentStreak,
        longestStreak,
        averageRoundsReached,
        favoriteGame
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  return { stats, tournaments };
};
