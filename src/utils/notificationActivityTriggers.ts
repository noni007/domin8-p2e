
import { supabase } from '@/integrations/supabase/client';
import type { ActivityType } from '@/utils/activityHelpers';

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

interface ActivityNotificationParams {
  activityUserId: string;
  activityType: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export const createActivityBasedNotifications = async ({
  activityUserId,
  activityType,
  title,
  description,
  metadata = {}
}: ActivityNotificationParams) => {
  try {
    // Get user's friends to notify them about the activity
    const { data: friendships, error: friendshipError } = await supabase
      .from('friendships')
      .select('user_id')
      .eq('friend_id', activityUserId);

    if (friendshipError) {
      console.error('Error fetching friendships:', friendshipError);
      return;
    }

    if (!friendships || friendships.length === 0) {
      return; // No friends to notify
    }

    // Get the activity user's profile using secure RPC
    const { data: allProfiles, error: profileError } = await supabase
      .rpc('get_public_profiles');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    const activityUserProfile = (allProfiles || []).find((p: PublicProfile) => p.id === activityUserId);
    const username = activityUserProfile?.username || 'A friend';

    // Create notifications for friends based on activity type
    const notifications = friendships.map(friendship => {
      let notificationTitle = '';
      let notificationMessage = '';

      switch (activityType) {
        case 'tournament_win':
          notificationTitle = '🏆 Friend Tournament Victory!';
          notificationMessage = `${username} just won a tournament! ${description}`;
          break;
        case 'achievement_unlock':
          notificationTitle = '🎖️ Friend Achievement!';
          notificationMessage = `${username} unlocked a new achievement: ${description}`;
          break;
        case 'match_win':
          // Only notify on significant win streaks or impressive victories
          if (metadata?.streak && metadata.streak >= 5) {
            notificationTitle = '🔥 Friend on Fire!';
            notificationMessage = `${username} is on a ${metadata.streak}-game win streak!`;
          } else {
            return null; // Don't notify for regular match wins
          }
          break;
        case 'tournament_join':
          // Only notify for high-stakes tournaments
          if (metadata?.prizePool && metadata.prizePool > 1000) {
            notificationTitle = '🎯 Friend Joined Big Tournament!';
            notificationMessage = `${username} joined a tournament with $${metadata.prizePool} prize pool!`;
          } else {
            return null; // Don't notify for regular tournament joins
          }
          break;
        default:
          return null; // Don't create notifications for other activity types
      }

      return {
        user_id: friendship.user_id,
        type: 'friend_activity',
        title: notificationTitle,
        message: notificationMessage,
        metadata: {
          ...metadata,
          friendId: activityUserId,
          activityType,
          originalActivity: { title, description }
        }
      };
    }).filter(Boolean); // Remove null entries

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating activity notifications:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in createActivityBasedNotifications:', error);
  }
};

// Helper function to check if activity should trigger notifications
export const shouldNotifyFriends = (activityType: ActivityType, metadata?: Record<string, any>) => {
  switch (activityType) {
    case 'tournament_win':
    case 'achievement_unlock':
      return true;
    case 'match_win':
      return metadata?.streak && metadata.streak >= 5;
    case 'tournament_join':
      return metadata?.prizePool && metadata.prizePool > 1000;
    default:
      return false;
  }
};
