
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Achievement = Tables<'achievements'>;
type UserAchievement = Tables<'user_achievements'> & {
  achievement: Achievement;
};

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = React.useState<UserAchievement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
      checkForNewAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    if (!user) return;

    try {
      // Call our database function to check and unlock achievements
      const { error } = await supabase.rpc('check_user_achievements', {
        user_id_param: user.id
      });

      if (error) throw error;

      // Refresh achievements after checking
      await fetchUserAchievements();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getAchievementProgress = (achievement: Achievement) => {
    // Cast condition_data to object with count property
    const conditionData = achievement.condition_data as { count?: number } | null;
    const targetCount = conditionData?.count || 1;
    
    return {
      current: 0,
      target: targetCount,
      percentage: 0
    };
  };

  return {
    achievements,
    userAchievements,
    loading,
    checkForNewAchievements,
    getAchievementProgress,
    refetch: () => {
      fetchAchievements();
      fetchUserAchievements();
    }
  };
};
