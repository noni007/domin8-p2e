
import { useAuth } from "@/hooks/useAuth";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  const { user } = useAuth();

  // Show dashboard for authenticated users
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation isAuthenticated={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserDashboard />
        </main>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation isAuthenticated={false} />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default Index;
