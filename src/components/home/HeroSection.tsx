import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-20 pb-8 sm:pb-12 md:pb-16">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent leading-tight px-2">
            Africa Esports
            <br />
            Ranking Platform
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-12 leading-relaxed px-4">
            The definitive platform for competitive gaming across Africa. Track rankings, join tournaments, 
            and dominate the esports scene with AER - Africa Esports Ranking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 max-w-md sm:max-w-none mx-auto">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-manipulation w-full sm:w-auto"
              onClick={() => window.location.href = '/tournaments'}
            >
              Join Tournament
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-manipulation w-full sm:w-auto"
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