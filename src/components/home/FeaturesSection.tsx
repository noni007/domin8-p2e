
import { Trophy, Users, TrendingUp, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useMobileInteractions } from "@/hooks/useMobileInteractions";

export const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { createTouchHandler } = useMobileInteractions();
  const features = [
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
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" ref={ref}>
      <div className={`text-center mb-16 transition-all duration-700 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
      }`}>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Why Choose Domin8?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Built for African gamers, by African gamers. Experience the future of competitive esports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const touchHandlers = createTouchHandler(() => {
            // Optional: Add feature interaction
          }, 'light');

          return (
            <div 
              key={index} 
              className={`relative group transition-all duration-500 ${
                isVisible 
                  ? 'animate-fade-in-up opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
              {...touchHandlers}
            >
              <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 h-full transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60 hover-lift hover-glow">
                <feature.icon className="h-12 w-12 text-blue-400 mb-4 group-hover:text-teal-400 transition-colors duration-300 animate-float" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
