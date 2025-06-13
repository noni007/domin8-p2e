
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logAchievementUnlock } from '@/utils/activityHelpers';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock achievements for now - in a real app these would come from the database
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Victory',
      description: 'Win your first match',
      condition: 'win_first_match',
      unlocked: false
    },
    {
      id: '2',
      name: 'Tournament Champion',
      description: 'Win your first tournament',
      condition: 'win_first_tournament',
      unlocked: false
    },
    {
      id: '3',
      name: 'Social Butterfly',
      description: 'Add 5 friends',
      condition: 'add_5_friends',
      unlocked: false
    },
    {
      id: '4',
      name: 'Win Streak',
      description: 'Win 5 matches in a row',
      condition: 'win_5_streak',
      unlocked: false
    },
    {
      id: '5',
      name: 'Tournament Regular',
      description: 'Participate in 3 tournaments',
      condition: 'join_3_tournaments',
      unlocked: false
    }
  ];

  const checkAndUnlockAchievements = async () => {
    if (!user) return;

    try {
      // Get user stats to check achievement conditions
      const { data: matchWins } = await supabase
        .from('matches')
        .select('id')
        .eq('winner_id', user.id);

      const { data: tournamentWins } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'tournament_win');

      const { data: friendCount } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', user.id);

      const { data: tournamentParticipations } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('user_id', user.id);

      const stats = {
        matchWins: matchWins?.length || 0,
        tournamentWins: tournamentWins?.length || 0,
        friendCount: friendCount?.length || 0,
        tournamentParticipations: tournamentParticipations?.length || 0
      };

      // Check each achievement
      const updatedAchievements = mockAchievements.map(achievement => {
        let shouldUnlock = false;

        switch (achievement.condition) {
          case 'win_first_match':
            shouldUnlock = stats.matchWins >= 1;
            break;
          case 'win_first_tournament':
            shouldUnlock = stats.tournamentWins >= 1;
            break;
          case 'add_5_friends':
            shouldUnlock = stats.friendCount >= 5;
            break;
          case 'win_5_streak':
            // This would need more complex logic to check consecutive wins
            shouldUnlock = stats.matchWins >= 5;
            break;
          case 'join_3_tournaments':
            shouldUnlock = stats.tournamentParticipations >= 3;
            break;
        }

        // If achievement should be unlocked and wasn't before, log the activity
        if (shouldUnlock && !achievement.unlocked) {
          logAchievementUnlock(user.id, achievement.name, achievement.description);
          
          toast({
            title: "Achievement Unlocked!",
            description: `You earned "${achievement.name}": ${achievement.description}`
          });
        }

        return {
          ...achievement,
          unlocked: shouldUnlock
        };
      });

      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkAndUnlockAchievements();
      setLoading(false);
    }
  }, [user]);

  return {
    achievements,
    loading,
    checkAchievements: checkAndUnlockAchievements
  };
};
