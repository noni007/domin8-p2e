
import { useAuth } from "@/hooks/useAuth";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { HeroSection } from "@/components/home/HeroSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { GamesSupportedSection } from "@/components/home/GamesSupportedSection";
import { TournamentShowcaseSection } from "@/components/home/TournamentShowcaseSection";
import { ComingSoonSection } from "@/components/home/ComingSoonSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { CTASection } from "@/components/home/CTASection";
import { CoreFunctionalityTester } from "@/components/testing/CoreFunctionalityTester";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showTester, setShowTester] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (user && !profile) {
      // User exists but no profile - definitely needs onboarding
      console.log('User exists but no profile found - triggering onboarding');
      setShowOnboarding(true);
    } else if (user && profile) {
      // User and profile exist - check if they've completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
      const profileIsComplete = profile.username && profile.username.trim() !== '';
      
      if (!hasCompletedOnboarding && !profileIsComplete) {
        console.log('User has incomplete profile - triggering onboarding');
        setShowOnboarding(true);
      } else if (!hasCompletedOnboarding && profileIsComplete) {
        // Profile exists but onboarding not marked complete - mark it complete
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
        setShowOnboarding(false);
      } else {
        setShowOnboarding(false);
      }
    } else {
      // No user - definitely don't show onboarding
      setShowOnboarding(false);
    }
  }, [user, profile, loading]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Show onboarding flow for authenticated users who need it
  if (user && showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show dashboard for authenticated users who have completed onboarding
  if (user && !showOnboarding) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserDashboard />
      </main>
    );
  }

  // Show enhanced landing page for non-authenticated users
  return (
    <>
      {/* Testing Toggle - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50">
          <Button
            onClick={() => setShowTester(!showTester)}
            variant="outline"
            size="sm"
            className="bg-purple-600/20 border-purple-400 text-purple-300 hover:bg-purple-600/40"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {showTester ? 'Hide Tests' : 'Show Tests'}
          </Button>
        </div>
      )}

      {/* Test Suite - Only visible when toggled */}
      {showTester && (
        <div className="py-16 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CoreFunctionalityTester />
          </div>
        </div>
      )}

      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GamesSupportedSection />
      <TournamentShowcaseSection />
      <ComingSoonSection />
      <CommunitySection />
      <CTASection />
    </>
  );
};

export default Index;
