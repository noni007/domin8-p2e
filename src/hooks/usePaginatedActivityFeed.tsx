
import { useMemo } from 'react';
import { usePersonalActivities } from './usePersonalActivities';
import { useFriendsActivities } from './useFriendsActivities';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
}

interface UsePaginatedActivityFeedProps {
  pageSize?: number;
  activityTypes?: string[];
  userId?: string;
}

export const usePaginatedActivityFeed = ({
  pageSize = 10,
  activityTypes = [],
  userId
}: UsePaginatedActivityFeedProps = {}) => {
  const {
    activities: personalActivities,
    loading: personalLoading,
    total: personalTotal,
    hasMore: hasMorePersonal,
    loadMore: loadMorePersonal,
    refetch: refetchPersonal
  } = usePersonalActivities({ pageSize, activityTypes, userId });

  const {
    activities: friendsActivities,
    loading: friendsLoading,
    total: friendsTotal,
    hasMore: hasMoreFriends,
    loadMore: loadMoreFriends,
    refetch: refetchFriends
  } = useFriendsActivities({ pageSize, activityTypes, userId });

  const loading = personalLoading || friendsLoading;

  const refetch = () => {
    refetchPersonal();
    refetchFriends();
  };

  return {
    personalActivities,
    friendsActivities,
    loading,
    personalTotal,
    friendsTotal,
    hasMorePersonal,
    hasMoreFriends,
    loadMorePersonal,
    loadMoreFriends,
    refetch
  };
};
