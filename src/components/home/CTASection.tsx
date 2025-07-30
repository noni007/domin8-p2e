import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useMobileInteractions } from "@/hooks/useMobileInteractions";

export const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const { createTouchHandler } = useMobileInteractions();
  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 backdrop-blur-sm" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center transition-all duration-700 ${
          isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Dominate?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of African gamers competing for glory, prizes, and recognition in the AER system.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 hover-lift animate-glow transition-all duration-300"
            onClick={() => window.location.href = '/tournaments'}
            {...createTouchHandler(() => window.location.href = '/tournaments', 'heavy')}
          >
            Start Your Journey
            <Calendar className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};