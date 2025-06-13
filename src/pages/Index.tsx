
import { useAuth } from "@/hooks/useAuth";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { GamesSupportedSection } from "@/components/home/GamesSupportedSection";
import { TournamentShowcaseSection } from "@/components/home/TournamentShowcaseSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  const { user } = useAuth();

  // Show dashboard for authenticated users
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserDashboard />
        </main>
        <Footer />
      </div>
    );
  }

  // Show enhanced landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GamesSupportedSection />
      <TournamentShowcaseSection />
      <CommunitySection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
