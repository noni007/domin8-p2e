
import { supabase } from '@/integrations/supabase/client';

export type EmailNotificationType = 
  | 'tournament_registration'
  | 'match_scheduled'
  | 'tournament_status'
  | 'match_results'
  | 'achievement_unlock';

interface EmailNotificationData {
  userName?: string;
  tournamentTitle?: string;
  opponent?: string;
  matchTime?: string;
  status?: string;
  score?: string;
  result?: 'won' | 'lost';
  achievementName?: string;
  description?: string;
  startDate?: string;
  prizePool?: string;
  maxParticipants?: string;
  [key: string]: any;
}

interface SendEmailParams {
  to: string;
  type: EmailNotificationType;
  data: EmailNotificationData;
}

export const sendEmailNotification = async ({ to, type, data }: SendEmailParams) => {
  try {
    // Check if email notifications are enabled
    const { data: config } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'feature_email_notifications')
      .single();

    if (!config || config.value !== 'true') {
      console.log('Email notifications are disabled');
      return { success: false, message: 'Email notifications disabled' };
    }

    // Check if this specific email type is enabled
    const emailTypeKey = `email_${type}`;
    const { data: emailTypeConfig } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', emailTypeKey)
      .single();

    if (!emailTypeConfig || emailTypeConfig.value !== 'true') {
      console.log(`Email type ${type} is disabled`);
      return { success: false, message: `Email type ${type} disabled` };
    }

    const { data: result, error } = await supabase.functions.invoke('send-notification-email', {
      body: { to, type, data },
    });

    if (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Email notification sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in sendEmailNotification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper functions for specific email types
export const sendTournamentRegistrationEmail = async (userEmail: string, userName: string, tournamentData: any) => {
  return sendEmailNotification({
    to: userEmail,
    type: 'tournament_registration',
    data: {
      userName,
      tournamentTitle: tournamentData.title,
      startDate: tournamentData.start_date,
      prizePool: tournamentData.prize_pool ? `$${tournamentData.prize_pool / 100}` : 'TBD',
      maxParticipants: tournamentData.max_participants?.toString() || 'TBD'
    }
  });
};

export const sendMatchScheduledEmail = async (userEmail: string, userName: string, matchData: any) => {
  return sendEmailNotification({
    to: userEmail,
    type: 'match_scheduled',
    data: {
      userName,
      opponent: matchData.opponent,
      matchTime: new Date(matchData.scheduled_time).toLocaleString(),
      tournamentTitle: matchData.tournament_title
    }
  });
};

export const sendTournamentStatusEmail = async (userEmail: string, userName: string, tournamentTitle: string, status: string) => {
  return sendEmailNotification({
    to: userEmail,
    type: 'tournament_status',
    data: {
      userName,
      tournamentTitle,
      status
    }
  });
};

export const sendMatchResultEmail = async (userEmail: string, userName: string, matchData: any) => {
  return sendEmailNotification({
    to: userEmail,
    type: 'match_results',
    data: {
      userName,
      opponent: matchData.opponent,
      result: matchData.result,
      score: matchData.score
    }
  });
};

export const sendAchievementEmail = async (userEmail: string, userName: string, achievementName: string, description?: string) => {
  return sendEmailNotification({
    to: userEmail,
    type: 'achievement_unlock',
    data: {
      userName,
      achievementName,
      description
    }
  });
};
