
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;

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

interface ActivityWithProfile extends UserActivity {
  profile?: PublicProfile;
}

interface UsePersonalActivitiesProps {
  pageSize?: number;
  activityTypes?: string[];
  userId?: string;
}

export const usePersonalActivities = ({
  pageSize = 10,
  activityTypes = [],
  userId
}: UsePersonalActivitiesProps = {}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithProfile[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (pageNumber: number = 1) => {
    if (!user) return;

    try {
      const targetUserId = userId || user.id;
      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('user_activities')
        .select('*', { count: 'exact' })
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }

      const { data: activitiesData, error: activitiesError, count } = await query;

      if (activitiesError) throw activitiesError;

      // Get user profile using secure RPC
      const { data: allProfiles, error: profileError } = await supabase
        .rpc('get_public_profiles');

      if (profileError) throw profileError;

      const profile = (allProfiles || []).find((p: PublicProfile) => p.id === targetUserId);

      const activitiesWithProfile = activitiesData?.map(activity => ({
        ...activity,
        profile
      })) || [];

      if (pageNumber === 1) {
        setActivities(activitiesWithProfile);
      } else {
        setActivities(prev => [...prev, ...activitiesWithProfile]);
      }

      setTotal(count || 0);
    } catch (error) {
      console.error('Error fetching personal activities:', error);
      setActivities([]);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  const refetch = () => {
    setPage(1);
    setLoading(true);
    fetchActivities(1).finally(() => setLoading(false));
  };

  useEffect(() => {
    const loadActivities = async () => {
      if (user) {
        setLoading(true);
        await fetchActivities(1);
        setLoading(false);
      }
    };

    loadActivities();
  }, [user, userId, activityTypes.join(',')]);

  const hasMore = activities.length < total;

  return {
    activities,
    loading,
    total,
    hasMore,
    loadMore,
    refetch
  };
};
