
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent leading-tight">
            Africa Esports
            <br />
            Ranking Platform
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            The definitive platform for competitive gaming across Africa. Track rankings, join tournaments, 
            and dominate the esports scene with AER - Africa Esports Ranking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              onClick={() => window.location.href = '/tournaments'}
            >
              Join Tournament
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              onClick={() => window.location.href = '/leaderboards'}
            >
              View Leaderboards
              <TrendingUp className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
