
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
const Index = () => {
  const { user, loading } = useAuth();
  const { shouldShowOnboarding, markOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();

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
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GamesSupportedSection />
      <TournamentShowcaseSection />
      {/* <ComingSoonSection /> */}
      <CommunitySection />
      <CTASection />
      <ComplianceSection />
    </>
  );
};

export default Index;
