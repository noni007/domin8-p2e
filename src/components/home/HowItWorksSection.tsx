
import { UserPlus, Calendar, Trophy, Medal } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up and complete your gamer profile to get started on your esports journey"
    },
    {
      icon: Calendar,
      title: "Join Tournaments",
      description: "Browse and register for tournaments in your favorite games and skill level"
    },
    {
      icon: Trophy,
      title: "Compete & Win",
      description: "Battle against other players in structured tournaments with live brackets"
    },
    {
      icon: Medal,
      title: "Climb Rankings",
      description: "Earn AER points, unlock achievements, and rise through the ranking tiers"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          How Domin8 Works
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Your path to esports glory starts here. Follow these simple steps to begin competing in Africa's premier gaming platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 h-full transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              
              <step.icon className="h-12 w-12 text-blue-400 mb-4 group-hover:text-teal-400 transition-colors" />
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-300 leading-relaxed">{step.description}</p>
            </div>
            
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-teal-600 transform -translate-y-1/2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
