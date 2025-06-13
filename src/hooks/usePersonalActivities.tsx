
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
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

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

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
