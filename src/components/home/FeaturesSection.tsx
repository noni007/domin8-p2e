
import { Trophy, Users, TrendingUp, Star } from "lucide-react";

export const FeaturesSection = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Why Choose Domin8?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Built for African gamers, by African gamers. Experience the future of competitive esports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => (
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
  );
};
