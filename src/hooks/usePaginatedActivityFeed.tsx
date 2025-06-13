
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
}

interface UsePaginatedActivityFeedProps {
  pageSize?: number;
  activityTypes?: string[];
  userId?: string; // For viewing specific user's activities
}

export const usePaginatedActivityFeed = ({
  pageSize = 10,
  activityTypes = [],
  userId
}: UsePaginatedActivityFeedProps = {}) => {
  const { user } = useAuth();
  const [personalActivities, setPersonalActivities] = useState<ActivityWithProfile[]>([]);
  const [friendsActivities, setFriendsActivities] = useState<ActivityWithProfile[]>([]);
  const [personalPage, setPersonalPage] = useState(1);
  const [friendsPage, setFriendsPage] = useState(1);
  const [personalTotal, setPersonalTotal] = useState(0);
  const [friendsTotal, setFriendsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPersonalActivities = async (page: number = 1) => {
    if (!user) return;

    try {
      const targetUserId = userId || user.id;
      const from = (page - 1) * pageSize;
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

      const { data: activities, error: activitiesError, count } = await query;

      if (activitiesError) throw activitiesError;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      const activitiesWithProfile = activities?.map(activity => ({
        ...activity,
        profile
      })) || [];

      if (page === 1) {
        setPersonalActivities(activitiesWithProfile);
      } else {
        setPersonalActivities(prev => [...prev, ...activitiesWithProfile]);
      }

      setPersonalTotal(count || 0);
    } catch (error) {
      console.error('Error fetching personal activities:', error);
      setPersonalActivities([]);
    }
  };

  const fetchFriendsActivities = async (page: number = 1) => {
    if (!user || userId) return; // Don't fetch friends activities when viewing specific user

    try {
      // First get user's friends
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriendsActivities([]);
        setFriendsTotal(0);
        return;
      }

      const friendIds = friendships.map(f => f.friend_id);
      const from = (page - 1) * pageSize;
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

      const { data: activities, error: activitiesError, count } = await query;

      if (activitiesError) throw activitiesError;

      // Get profiles for all friends who have activities
      if (activities && activities.length > 0) {
        const userIds = [...new Set(activities.map(a => a.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const activitiesWithProfiles = activities.map(activity => ({
          ...activity,
          profile: profiles?.find(p => p.id === activity.user_id)
        }));

        if (page === 1) {
          setFriendsActivities(activitiesWithProfiles);
        } else {
          setFriendsActivities(prev => [...prev, ...activitiesWithProfiles]);
        }
      } else {
        if (page === 1) {
          setFriendsActivities([]);
        }
      }

      setFriendsTotal(count || 0);
    } catch (error) {
      console.error('Error fetching friends activities:', error);
      setFriendsActivities([]);
    }
  };

  const loadMorePersonal = () => {
    const nextPage = personalPage + 1;
    setPersonalPage(nextPage);
    fetchPersonalActivities(nextPage);
  };

  const loadMoreFriends = () => {
    const nextPage = friendsPage + 1;
    setFriendsPage(nextPage);
    fetchFriendsActivities(nextPage);
  };

  const refetch = () => {
    setPersonalPage(1);
    setFriendsPage(1);
    setLoading(true);
    Promise.all([
      fetchPersonalActivities(1),
      fetchFriendsActivities(1)
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    const loadActivities = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([
          fetchPersonalActivities(1),
          fetchFriendsActivities(1)
        ]);
        setLoading(false);
      }
    };

    loadActivities();
  }, [user, userId, activityTypes.join(',')]);

  const hasMorePersonal = personalActivities.length < personalTotal;
  const hasMoreFriends = friendsActivities.length < friendsTotal;

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
