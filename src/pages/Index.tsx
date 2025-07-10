
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
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
import { ComplianceSection } from "@/components/home/ComplianceSection";
import { CoreFunctionalityTester } from "@/components/testing/CoreFunctionalityTester";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const { shouldShowOnboarding, markOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();
  const [showTester, setShowTester] = useState(false);

  // Show loading state while auth or onboarding is initializing
  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Show onboarding flow for authenticated users who need it
  if (user && shouldShowOnboarding) {
    return <OnboardingFlow onComplete={markOnboardingComplete} />;
  }

  // Show dashboard for authenticated users who have completed onboarding
  if (user && !shouldShowOnboarding) {
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
      <ComplianceSection />
    </>
  );
};

export default Index;
