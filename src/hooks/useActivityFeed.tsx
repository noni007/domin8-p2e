
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

      // Get user profile using secure RPC
      const { data: profiles, error: profileError } = await supabase
        .rpc('get_public_profiles');

      if (profileError) throw profileError;

      const profile = profiles?.find((p: PublicProfile) => p.id === user.id);

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

      // Get profiles for all friends using secure RPC
      if (activities && activities.length > 0) {
        const { data: allProfiles, error: profilesError } = await supabase
          .rpc('get_public_profiles');

        if (profilesError) throw profilesError;

        const userIds = [...new Set(activities.map(a => a.user_id))];
        const profiles = (allProfiles || []).filter((p: PublicProfile) => userIds.includes(p.id));

        const activitiesWithProfiles = activities.map(activity => ({
          ...activity,
          profile: profiles?.find((p: PublicProfile) => p.id === activity.user_id)
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
