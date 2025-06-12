
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type NotificationInsert = Omit<Tables<'notifications'>, 'id' | 'created_at' | 'updated_at'>;

export const createSampleNotifications = async (userId: string) => {
  const sampleNotifications: NotificationInsert[] = [
    {
      user_id: userId,
      type: 'tournament_registration',
      title: 'Tournament Registration Confirmed',
      message: 'You have successfully registered for the "Summer Championship 2024" tournament.',
      metadata: { tournamentId: 'sample-tournament-1' },
      read: false
    },
    {
      user_id: userId,
      type: 'match_schedule',
      title: 'Match Scheduled',
      message: 'Your first round match is scheduled for tomorrow at 3:00 PM.',
      metadata: { matchId: 'sample-match-1', scheduledTime: '2024-06-13T15:00:00Z' },
      read: false
    },
    {
      user_id: userId,
      type: 'tournament_status',
      title: 'Tournament Started',
      message: 'The "Summer Championship 2024" tournament has officially begun!',
      metadata: { tournamentId: 'sample-tournament-1' },
      read: true
    },
    {
      user_id: userId,
      type: 'match_result',
      title: 'Match Victory!',
      message: 'Congratulations! You won your match against PlayerX with a score of 2-1.',
      metadata: { matchId: 'sample-match-2', result: 'victory', score: '2-1' },
      read: false
    },
    {
      user_id: userId,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You\'ve earned the "First Victory" badge for winning your first tournament match.',
      metadata: { achievementId: 'first-victory', badgeType: 'victory' },
      read: false
    },
    {
      user_id: userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'GamerBuddy wants to connect with you.',
      metadata: { fromUserId: 'sample-user-1', fromUsername: 'GamerBuddy' },
      read: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (error) {
      console.error('Error creating sample notifications:', error);
      throw error;
    }

    console.log('Sample notifications created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create sample notifications:', error);
    throw error;
  }
};

export const clearUserNotifications = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }

    console.log('User notifications cleared');
  } catch (error) {
    console.error('Failed to clear notifications:', error);
    throw error;
  }
};
