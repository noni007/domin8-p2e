
import { UserPlus, Calendar, Trophy, Medal } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useMobileInteractions } from "@/hooks/useMobileInteractions";

export const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { createTouchHandler } = useMobileInteractions();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" ref={ref}>
      <div className={`text-center mb-16 transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
      }`}>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          How Domin8 Works
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Your path to esports glory starts here. Follow these simple steps to begin competing in Africa's premier gaming platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const touchHandlers = createTouchHandler(() => {
            // Optional: Add action on step click
          }, 'light');

          return (
            <div 
              key={index} 
              className={`relative group transition-all duration-500 ${
                isVisible 
                  ? 'animate-fade-in-up opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              {...touchHandlers}
            >
              <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 h-full transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60 hover-lift hover-glow">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm animate-glow">
                  {index + 1}
                </div>
                
                <step.icon className="h-12 w-12 text-blue-400 mb-4 group-hover:text-teal-400 transition-colors duration-300 animate-float" />
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-teal-600 transform -translate-y-1/2 transition-all duration-500 ${
                  isVisible ? 'scale-x-100' : 'scale-x-0'
                }`} style={{ transitionDelay: `${(index + 1) * 150}ms` }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
