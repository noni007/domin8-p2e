
import React from 'react';
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

      // Get profiles for all friends using secure RPC
      if (activitiesData && activitiesData.length > 0) {
        const { data: allProfiles, error: profilesError } = await supabase
          .rpc('get_public_profiles');

        if (profilesError) throw profilesError;

        const userIds = [...new Set(activitiesData.map(a => a.user_id))];
        const profiles = (allProfiles || []).filter((p: PublicProfile) => userIds.includes(p.id));

        const activitiesWithProfiles = activitiesData.map(activity => ({
          ...activity,
          profile: profiles?.find((p: PublicProfile) => p.id === activity.user_id)
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
