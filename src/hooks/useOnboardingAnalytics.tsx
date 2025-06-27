
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingEvent {
  step: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export const useOnboardingAnalytics = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<OnboardingEvent[]>([]);

  const trackEvent = async (step: string, action: string, metadata?: Record<string, any>) => {
    if (!user) return;

    const event: OnboardingEvent = {
      step,
      action,
      timestamp: new Date(),
      metadata
    };

    setEvents(prev => [...prev, event]);

    // Log analytics event to user activities
    try {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'onboarding_analytics',
        title: `Onboarding: ${action}`,
        description: `User ${action} on step ${step}`,
        metadata: {
          step,
          action,
          ...metadata
        }
      });
    } catch (error) {
      console.error('Failed to track onboarding event:', error);
    }
  };

  const trackStepStart = (step: string) => {
    trackEvent(step, 'step_started');
  };

  const trackStepComplete = (step: string, timeSpent?: number) => {
    trackEvent(step, 'step_completed', { timeSpent });
  };

  const trackStepSkipped = (step: string) => {
    trackEvent(step, 'step_skipped');
  };

  const trackOnboardingComplete = (totalTime: number, stepsCompleted: string[]) => {
    trackEvent('completion', 'onboarding_completed', {
      totalTime,
      stepsCompleted,
      completionRate: stepsCompleted.length
    });
  };

  const trackProfileSetup = (profileData: any) => {
    trackEvent('profile', 'profile_saved', {
      hasUsername: !!profileData.username,
      gameCount: profileData.favoriteGames?.length || 0,
      hasExperienceLevel: !!profileData.experienceLevel,
      hasBio: !!profileData.bio
    });
  };

  const trackTournamentRegistration = (tournamentId: string) => {
    trackEvent('tournament', 'tournament_registered', { tournamentId });
  };

  return {
    events,
    trackStepStart,
    trackStepComplete,
    trackStepSkipped,
    trackOnboardingComplete,
    trackProfileSetup,
    trackTournamentRegistration
  };
};
