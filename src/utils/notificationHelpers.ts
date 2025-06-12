
import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'tournament_registration'
  | 'match_schedule'
  | 'tournament_status'
  | 'match_result'
  | 'achievement'
  | 'friend_request';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  metadata = {}
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper functions for specific notification types
export const notifyTournamentRegistration = async (userId: string, tournamentTitle: string, tournamentId: string) => {
  return createNotification({
    userId,
    type: 'tournament_registration',
    title: 'Tournament Registration Confirmed',
    message: `You have successfully registered for "${tournamentTitle}". Good luck!`,
    metadata: { tournamentId }
  });
};

export const notifyMatchScheduled = async (userId: string, opponent: string, matchTime: string, matchId: string) => {
  return createNotification({
    userId,
    type: 'match_schedule',
    title: 'Match Scheduled',
    message: `Your match against ${opponent} is scheduled for ${matchTime}.`,
    metadata: { matchId, opponent, matchTime }
  });
};

export const notifyTournamentStatusChange = async (userId: string, tournamentTitle: string, status: string, tournamentId: string) => {
  const statusMessages = {
    'live': 'has started! Good luck in your matches.',
    'completed': 'has ended. Check out the final results.',
    'cancelled': 'has been cancelled. You will be notified of any updates.'
  };
  
  return createNotification({
    userId,
    type: 'tournament_status',
    title: 'Tournament Update',
    message: `"${tournamentTitle}" ${statusMessages[status as keyof typeof statusMessages] || 'status has been updated.'}`,
    metadata: { tournamentId, status }
  });
};

export const notifyMatchResult = async (userId: string, result: 'won' | 'lost', opponent: string, score: string, matchId: string) => {
  return createNotification({
    userId,
    type: 'match_result',
    title: `Match ${result === 'won' ? 'Victory' : 'Result'}`,
    message: `You ${result} against ${opponent}. Final score: ${score}`,
    metadata: { matchId, result, opponent, score }
  });
};

export const notifyAchievement = async (userId: string, achievementName: string, description: string) => {
  return createNotification({
    userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `Congratulations! You've earned "${achievementName}": ${description}`,
    metadata: { achievementName }
  });
};

export const notifyFriendRequest = async (userId: string, senderName: string, senderId: string) => {
  return createNotification({
    userId,
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${senderName} wants to be your friend!`,
    metadata: { senderId, senderName }
  });
};
