import { supabase } from '@/integrations/supabase/client';

export interface DiscordWebhookData {
  content?: string;
  embeds?: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    thumbnail?: {
      url: string;
    };
    footer?: {
      text: string;
    };
  }>;
}

export class SocialIntegrationService {
  private static DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  // Discord Integration
  static async sendDiscordNotification(data: DiscordWebhookData): Promise<boolean> {
    if (!this.DISCORD_WEBHOOK_URL) {
      console.warn('Discord webhook URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification failed:', error);
      return false;
    }
  }

  // Tournament Updates
  static async notifyTournamentStart(tournament: any): Promise<void> {
    const embed = {
      title: '🏆 Tournament Starting!',
      description: tournament.title,
      color: 0x00ff00, // Green
      fields: [
        {
          name: 'Game',
          value: tournament.game,
          inline: true,
        },
        {
          name: 'Prize Pool',
          value: `$${(tournament.prize_pool / 100).toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Participants',
          value: `${tournament.participant_count}/${tournament.max_participants}`,
          inline: true,
        },
      ],
      footer: {
        text: 'Join at domin8.app',
      },
    };

    await this.sendDiscordNotification({ embeds: [embed] });
  }

  static async notifyTournamentWin(tournament: any, winner: any): Promise<void> {
    const embed = {
      title: '🎉 Tournament Winner!',
      description: `${winner.username} has won ${tournament.title}!`,
      color: 0xffd700, // Gold
      fields: [
        {
          name: 'Champion',
          value: winner.username,
          inline: true,
        },
        {
          name: 'Prize Won',
          value: `$${(tournament.prize_pool / 100).toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Game',
          value: tournament.game,
          inline: true,
        },
      ],
      footer: {
        text: 'Powered by Domin8',
      },
    };

    await this.sendDiscordNotification({ embeds: [embed] });
  }

  // Achievement Notifications
  static async notifyAchievementUnlock(user: any, achievement: any): Promise<void> {
    const embed = {
      title: '⚡ Achievement Unlocked!',
      description: `${user.username} unlocked: ${achievement.name}`,
      color: 0xff6b6b, // Red
      fields: [
        {
          name: 'Description',
          value: achievement.description,
          inline: false,
        },
        {
          name: 'Reward',
          value: achievement.reward_amount > 0 
            ? `$${(achievement.reward_amount / 100).toFixed(2)}` 
            : 'Badge',
          inline: true,
        },
        {
          name: 'Category',
          value: achievement.category,
          inline: true,
        },
      ],
      footer: {
        text: 'Unlock yours at domin8.app',
      },
    };

    await this.sendDiscordNotification({ embeds: [embed] });
  }

  // Social Sharing Utilities
  static generateShareableContent(type: string, data: any): {
    title: string;
    description: string;
    hashtags: string[];
  } {
    switch (type) {
      case 'tournament_win':
        return {
          title: `🏆 Victory in ${data.tournament.title}!`,
          description: `Just won ${data.tournament.title} and earned $${(data.tournament.prize_pool / 100).toFixed(2)}! The competition was fierce but victory is sweet! 🎮`,
          hashtags: ['Domin8', 'TournamentWin', 'Gaming', 'Esports', data.tournament.game.replace(/\s+/g, '')],
        };
      
      case 'achievement_unlock':
        return {
          title: `⚡ Achievement Unlocked: ${data.achievement.name}!`,
          description: `${data.achievement.description} Another milestone reached on my gaming journey! 🎯`,
          hashtags: ['Domin8', 'Achievement', 'Gaming', 'Progress', data.achievement.category],
        };
      
      case 'tournament_join':
        return {
          title: `🎮 Joined ${data.tournament.title}!`,
          description: `Ready to compete in ${data.tournament.title}! Prize pool: $${(data.tournament.prize_pool / 100).toFixed(2)}. Wish me luck! 🍀`,
          hashtags: ['Domin8', 'Tournament', 'Gaming', 'Competition', data.tournament.game.replace(/\s+/g, '')],
        };
      
      default:
        return {
          title: '🎮 Gaming Update from Domin8!',
          description: 'Check out my latest gaming achievement!',
          hashtags: ['Domin8', 'Gaming'],
        };
    }
  }

  // Track Social Shares
  static async trackSocialShare(userId: string, platform: string, contentType: string, contentId: string): Promise<void> {
    try {
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: 'social_share',
        title: `Shared on ${platform}`,
        description: `Shared ${contentType} content`,
        metadata: {
          platform,
          content_type: contentType,
          content_id: contentId,
          shared_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to track social share:', error);
    }
  }

  // Auto-posting utilities (would require server-side implementation)
  static async scheduleAutoPost(content: any, platforms: string[], scheduleTime?: Date): Promise<void> {
    // This would typically be handled by a background job or edge function
    console.log('Auto-post scheduled:', { content, platforms, scheduleTime });
    
    // For now, just log the intent - actual implementation would require:
    // 1. Server-side scheduling system
    // 2. Platform API credentials
    // 3. User consent and permissions
  }

  // Influencer/Streamer Integration
  static async createStreamerIntegration(streamerId: string, platform: string, channelInfo: any): Promise<void> {
    try {
      // Store streamer integration data
      await supabase.from('user_activities').insert({
        user_id: streamerId,
        activity_type: 'streamer_integration',
        title: `Connected ${platform} channel`,
        description: `Streaming channel integrated: ${channelInfo.channel_name}`,
        metadata: {
          platform,
          channel_info: channelInfo,
          integrated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to create streamer integration:', error);
    }
  }
}