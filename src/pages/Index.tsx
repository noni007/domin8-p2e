
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Calendar, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

const Index = () => {
  const { user } = useAuth();

  // Show dashboard for authenticated users
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Navigation */}
        <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Domin8
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  onClick={() => window.location.href = '/tournaments'}
                >
                  Tournaments
                </Button>
                <Button 
                  variant="outline" 
                  className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black"
                  onClick={() => window.location.href = '/profile'}
                >
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserDashboard />
        </main>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        {/* Navigation */}
        <nav className="relative border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Domin8
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  onClick={() => window.location.href = '/tournaments'}
                >
                  View Tournaments
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
              Africa Esports
              <br />
              Ranking Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              The definitive platform for competitive gaming across Africa. Track rankings, join tournaments, 
              and dominate the esports scene with AER - Africa Esports Ranking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-4"
                onClick={() => window.location.href = '/tournaments'}
              >
                Join Tournament
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black text-lg px-8 py-4"
              >
                Explore Rankings
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Why Choose Domin8?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built for African gamers, by African gamers. Experience the future of competitive esports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Trophy,
              title: "AER Rankings",
              description: "Official Africa Esports Ranking system with Bronze, Silver, Gold, Platinum, Diamond, and Master tiers."
            },
            {
              icon: Users,
              title: "Tournaments",
              description: "Join or organize professional esports tournaments with prize pools and recognition."
            },
            {
              icon: TrendingUp,
              title: "Creator Hub",
              description: "Platform for content creators to showcase skills and build their gaming community."
            },
            {
              icon: Star,
              title: "Brand Partnerships",
              description: "Connect with leading gaming brands and unlock sponsorship opportunities."
            }
          ].map((feature, index) => (
            <div key={index} className="relative group">
              <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 h-full transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60">
                <feature.icon className="h-12 w-12 text-blue-400 mb-4 group-hover:text-teal-400 transition-colors" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Dominate?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of African gamers competing for glory, prizes, and recognition in the AER system.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-4"
              onClick={() => window.location.href = '/tournaments'}
            >
              Start Your Journey
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
