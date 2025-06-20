
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
import { CoreFunctionalityTester } from "@/components/testing/CoreFunctionalityTester";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [showTester, setShowTester] = useState(false);

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
