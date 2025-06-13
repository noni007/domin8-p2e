
import { useAuth } from "@/hooks/useAuth";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { HeroSection } from "@/components/home/HeroSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { GamesSupportedSection } from "@/components/home/GamesSupportedSection";
import { TournamentShowcaseSection } from "@/components/home/TournamentShowcaseSection";
import { ComingSoonSection } from "@/components/home/ComingSoonSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  const { user } = useAuth();

  // Show dashboard for authenticated users
  if (user) {
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
      <ComingSoonSection />
      <CommunitySection />
      <CTASection />
    </>
  );
};

export default Index;
