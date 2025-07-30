
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
}

export const useActivityFeed = () => {
  const { user } = useAuth();
  const [personalActivities, setPersonalActivities] = React.useState<ActivityWithProfile[]>([]);
  const [friendsActivities, setFriendsActivities] = React.useState<ActivityWithProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPersonalActivities = async () => {
    if (!user) return;

    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activitiesError) throw activitiesError;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const activitiesWithProfile = activities?.map(activity => ({
        ...activity,
        profile
      })) || [];

      setPersonalActivities(activitiesWithProfile);
    } catch (error) {
      console.error('Error fetching personal activities:', error);
      setPersonalActivities([]);
    }
  };

  const fetchFriendsActivities = async () => {
    if (!user) return;

    try {
      // First get user's friends
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriendsActivities([]);
        return;
      }

      const friendIds = friendships.map(f => f.friend_id);

      // Get friends' activities
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(50);

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

        setFriendsActivities(activitiesWithProfiles);
      } else {
        setFriendsActivities([]);
      }
    } catch (error) {
      console.error('Error fetching friends activities:', error);
      setFriendsActivities([]);
    }
  };

  const subscribeToRealTimeUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('activity-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities'
        },
        (payload) => {
          console.log('New activity:', payload);
          // Refresh activities when new ones are added
          if (payload.new.user_id === user.id) {
            fetchPersonalActivities();
          } else {
            fetchFriendsActivities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  React.useEffect(() => {
    const loadActivities = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([fetchPersonalActivities(), fetchFriendsActivities()]);
        setLoading(false);
      }
    };

    loadActivities();
    const unsubscribe = subscribeToRealTimeUpdates();

    return unsubscribe;
  }, [user]);

  return {
    personalActivities,
    friendsActivities,
    loading,
    refetch: () => Promise.all([fetchPersonalActivities(), fetchFriendsActivities()])
  };
};
