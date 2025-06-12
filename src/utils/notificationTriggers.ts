
import { supabase } from '@/integrations/supabase/client';

interface TournamentNotificationData {
  tournamentId: string;
  tournamentTitle: string;
  organizerId: string;
  participantIds: string[];
}

interface MatchNotificationData {
  matchId: string;
  tournamentId: string;
  player1Id: string;
  player2Id?: string;
  scheduledTime: string;
  matchNumber: number;
}

export const notificationTriggers = {
  // Tournament registration notifications
  onTournamentRegistration: async (userId: string, tournamentTitle: string, tournamentId: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'tournament_registration',
        title: 'Tournament Registration Confirmed',
        message: `You have successfully registered for the "${tournamentTitle}" tournament.`,
        metadata: { tournamentId },
        read: false
      });
    } catch (error) {
      console.error('Error creating tournament registration notification:', error);
    }
  },

  // Tournament status change notifications
  onTournamentStatusChange: async (data: TournamentNotificationData, newStatus: string) => {
    const statusMessages = {
      'active': 'has officially started!',
      'completed': 'has ended. Check the results!',
      'cancelled': 'has been cancelled.',
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || 'status has been updated.';

    try {
      // Notify all participants
      const notifications = data.participantIds.map(participantId => ({
        user_id: participantId,
        type: 'tournament_status',
        title: 'Tournament Update',
        message: `The "${data.tournamentTitle}" tournament ${message}`,
        metadata: { tournamentId: data.tournamentId, status: newStatus },
        read: false
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error creating tournament status notifications:', error);
    }
  },

  // Match scheduling notifications
  onMatchScheduled: async (data: MatchNotificationData) => {
    try {
      const notifications = [];

      // Notify player 1
      notifications.push({
        user_id: data.player1Id,
        type: 'match_schedule',
        title: 'Match Scheduled',
        message: `Your match #${data.matchNumber} is scheduled for ${new Date(data.scheduledTime).toLocaleString()}.`,
        metadata: { 
          matchId: data.matchId, 
          tournamentId: data.tournamentId,
          scheduledTime: data.scheduledTime,
          matchNumber: data.matchNumber
        },
        read: false
      });

      // Notify player 2 if exists
      if (data.player2Id) {
        notifications.push({
          user_id: data.player2Id,
          type: 'match_schedule',
          title: 'Match Scheduled',
          message: `Your match #${data.matchNumber} is scheduled for ${new Date(data.scheduledTime).toLocaleString()}.`,
          metadata: { 
            matchId: data.matchId, 
            tournamentId: data.tournamentId,
            scheduledTime: data.scheduledTime,
            matchNumber: data.matchNumber
          },
          read: false
        });
      }

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error creating match schedule notifications:', error);
    }
  },

  // Match result notifications
  onMatchCompleted: async (matchId: string, winnerId: string, loserId: string, score1: number, score2: number) => {
    try {
      const notifications = [
        {
          user_id: winnerId,
          type: 'match_result',
          title: 'Match Victory!',
          message: `Congratulations! You won your match with a score of ${score1}-${score2}.`,
          metadata: { matchId, result: 'victory', score: `${score1}-${score2}` },
          read: false
        },
        {
          user_id: loserId,
          type: 'match_result',
          title: 'Match Result',
          message: `Your match has ended with a score of ${score1}-${score2}. Better luck next time!`,
          metadata: { matchId, result: 'defeat', score: `${score1}-${score2}` },
          read: false
        }
      ];

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error creating match result notifications:', error);
    }
  },

  // Achievement notifications
  onAchievementUnlocked: async (userId: string, achievementTitle: string, achievementDescription: string, achievementId: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'achievement',
        title: 'New Achievement Unlocked!',
        message: `You've earned the "${achievementTitle}" badge! ${achievementDescription}`,
        metadata: { achievementId, achievementTitle },
        read: false
      });
    } catch (error) {
      console.error('Error creating achievement notification:', error);
    }
  }
};
