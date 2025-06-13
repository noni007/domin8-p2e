
import { supabase } from '@/integrations/supabase/client';
import { createActivityBasedNotifications, shouldNotifyFriends } from '@/utils/notificationActivityTriggers';

export type ActivityType = 
  | 'tournament_join'
  | 'tournament_win'
  | 'match_win'
  | 'achievement_unlock'
  | 'friend_added';

interface CreateActivityParams {
  userId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const createActivity = async ({
  userId,
  activityType,
  title,
  description,
  metadata = {}
}: CreateActivityParams) => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        title,
        description,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return null;
    }

    // Create friend notifications for significant activities
    if (shouldNotifyFriends(activityType, metadata)) {
      await createActivityBasedNotifications({
        activityUserId: userId,
        activityType,
        title,
        description: description || '',
        metadata
      });
    }

    return data;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// Helper functions for specific activity types
export const logTournamentJoin = async (userId: string, tournamentTitle: string, tournamentId: string, prizePool?: number) => {
  return createActivity({
    userId,
    activityType: 'tournament_join',
    title: 'Joined Tournament',
    description: `Joined "${tournamentTitle}"`,
    metadata: { tournamentId, tournamentTitle, prizePool }
  });
};

export const logTournamentWin = async (userId: string, tournamentTitle: string, tournamentId: string, prizePool?: number) => {
  return createActivity({
    userId,
    activityType: 'tournament_win',
    title: 'Tournament Victory!',
    description: `Won "${tournamentTitle}"`,
    metadata: { tournamentId, tournamentTitle, prizePool }
  });
};

export const logMatchWin = async (userId: string, opponent: string, score: string, matchId: string, winStreak?: number) => {
  return createActivity({
    userId,
    activityType: 'match_win',
    title: 'Match Victory',
    description: `Defeated ${opponent} (${score})`,
    metadata: { matchId, opponent, score, streak: winStreak }
  });
};

export const logAchievementUnlock = async (userId: string, achievementName: string, description: string) => {
  return createActivity({
    userId,
    activityType: 'achievement_unlock',
    title: 'Achievement Unlocked!',
    description: `Earned "${achievementName}": ${description}`,
    metadata: { achievementName }
  });
};

export const logFriendAdded = async (userId: string, friendName: string, friendId: string) => {
  return createActivity({
    userId,
    activityType: 'friend_added',
    title: 'New Friend',
    description: `Connected with ${friendName}`,
    metadata: { friendId, friendName }
  });
};
