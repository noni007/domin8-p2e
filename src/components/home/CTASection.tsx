
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const CTASection = () => {
  return (
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
            className="bg-lime-500 hover:bg-lime-600 text-black font-bold text-lg px-8 py-4"
            onClick={() => window.location.href = '/tournaments'}
          >
            Start Your Journey
            <Calendar className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
