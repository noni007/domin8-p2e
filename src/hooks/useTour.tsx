
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface TourStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (tourId: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  currentTourId: string | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Dashboard tour steps
export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="welcome"]',
    title: 'Welcome to Domin8! 🎮',
    content: 'This is your personalized dashboard where you can track your progress, join tournaments, and connect with other gamers.',
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: 'Your Gaming Stats 📊',
    content: 'Track your skill rating, win rate, global rank, and current streak. Compete in tournaments to improve your stats!',
    position: 'bottom',
  },
  {
    id: 'tournaments',
    target: '[data-tour="tournaments"]',
    title: 'Discover Tournaments 🏆',
    content: 'Browse and register for tournaments here. Compete against other players and win prizes!',
    position: 'top',
  },
  {
    id: 'activity',
    target: '[data-tour="activity"]',
    title: 'Your Activity Feed 📋',
    content: 'See your recent activities, match results, and achievements. Stay updated on your gaming journey!',
    position: 'top',
  },
  {
    id: 'social',
    target: '[data-tour="social"]',
    title: 'Community Feed 👥',
    content: 'Connect with friends and see what the community is up to. Follow other gamers and share your achievements!',
    position: 'left',
  },
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);

  const getCompletedTours = useCallback((): string[] => {
    if (!user) return [];
    const stored = localStorage.getItem(`completed_tours_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  }, [user]);

  const markTourComplete = useCallback((tourId: string) => {
    if (!user) return;
    const completed = getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(`completed_tours_${user.id}`, JSON.stringify(completed));
    }
  }, [user, getCompletedTours]);

  const startTour = useCallback((tourId: string) => {
    let tourSteps: TourStep[] = [];
    
    switch (tourId) {
      case 'dashboard':
        tourSteps = dashboardTourSteps;
        break;
      default:
        tourSteps = dashboardTourSteps;
    }

    setSteps(tourSteps);
    setCurrentStep(0);
    setCurrentTourId(tourId);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    if (currentTourId) {
      markTourComplete(currentTourId);
    }
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setCurrentTourId(null);
  }, [currentTourId, markTourComplete]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  // Auto-start tour for first-time users on dashboard
  useEffect(() => {
    if (user) {
      const hasSeenDashboardTour = localStorage.getItem(`tour_dashboard_${user.id}`);
      const onboardingComplete = localStorage.getItem(`onboarding_completed_${user.id}`);
      
      // Start tour if onboarding is complete but tour hasn't been seen
      if (onboardingComplete && !hasSeenDashboardTour && !isActive) {
        // Delay to ensure dashboard is rendered
        const timer = setTimeout(() => {
          localStorage.setItem(`tour_dashboard_${user.id}`, 'true');
          startTour('dashboard');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isActive, startTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        currentTourId,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
