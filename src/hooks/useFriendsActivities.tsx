
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
}

interface UseFriendsActivitiesProps {
  pageSize?: number;
  activityTypes?: string[];
  userId?: string;
}

export const useFriendsActivities = ({
  pageSize = 10,
  activityTypes = [],
  userId
}: UseFriendsActivitiesProps = {}) => {
  const { user } = useAuth();
  const [activities, setActivities] = React.useState<ActivityWithProfile[]>([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const fetchActivities = async (pageNumber: number = 1) => {
    if (!user || userId) return; // Don't fetch friends activities when viewing specific user

    try {
      // First get user's friends
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setActivities([]);
        setTotal(0);
        return;
      }

      const friendIds = friendships.map(f => f.friend_id);
      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('user_activities')
        .select('*', { count: 'exact' })
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (activityTypes.length > 0) {
        query = query.in('activity_type', activityTypes);
      }

      const { data: activitiesData, error: activitiesError, count } = await query;

      if (activitiesError) throw activitiesError;

      // Get profiles for all friends who have activities
      if (activitiesData && activitiesData.length > 0) {
        const userIds = [...new Set(activitiesData.map(a => a.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const activitiesWithProfiles = activitiesData.map(activity => ({
          ...activity,
          profile: profiles?.find(p => p.id === activity.user_id)
        }));

        if (pageNumber === 1) {
          setActivities(activitiesWithProfiles);
        } else {
          setActivities(prev => [...prev, ...activitiesWithProfiles]);
        }
      } else {
        if (pageNumber === 1) {
          setActivities([]);
        }
      }

      setTotal(count || 0);
    } catch (error) {
      console.error('Error fetching friends activities:', error);
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

  React.useEffect(() => {
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
