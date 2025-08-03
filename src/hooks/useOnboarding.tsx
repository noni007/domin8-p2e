
import React from 'react';
import { useAuth } from './useAuth';

export const useOnboarding = () => {
  const { user, profile, loading } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (loading || !user) {
      setShouldShowOnboarding(false);
      return;
    }

    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
    const profileIsComplete = profile?.username && profile.username.trim() !== '';

    if (!profile) {
      // No profile exists - definitely needs onboarding
      setShouldShowOnboarding(true);
    } else if (!hasCompletedOnboarding && !profileIsComplete) {
      // Profile exists but incomplete
      setShouldShowOnboarding(true);
    } else if (!hasCompletedOnboarding && profileIsComplete) {
      // Profile complete but onboarding not marked - mark it and don't show
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      setShouldShowOnboarding(false);
    } else {
      setShouldShowOnboarding(false);
    }
  }, [user, profile, loading]);

  const markOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShouldShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarding_completed_${user.id}`);
    }
    setShouldShowOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    markOnboardingComplete,
    resetOnboarding,
    isLoading: loading
  };
};
