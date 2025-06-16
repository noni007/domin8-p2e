
import { useState, useEffect } from 'react';
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    // This would be more complex in a real implementation
    // For now, return basic progress based on user's activity
    return {
      current: 0,
      target: achievement.condition_data?.count || 1,
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
