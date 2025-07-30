
import { Users, Trophy, Globe, DollarSign } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountAnimation } from "@/hooks/useCountAnimation";

export const StatisticsSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const stats = [
    {
      icon: Users,
      value: "50K+",
      animationValue: 50000,
      suffix: "K+",
      label: "Active Players",
      description: "Gamers competing across Africa"
    },
    {
      icon: Trophy,
      value: "2,500+",
      animationValue: 2500,
      suffix: "+",
      label: "Tournaments Held",
      description: "Competitive events completed"
    },
    {
      icon: DollarSign,
      value: "$250K+",
      animationValue: 250,
      prefix: "$",
      suffix: "K+",
      label: "Prize Pools",
      description: "Total prizes distributed"
    },
    {
      icon: Globe,
      value: "30+",
      animationValue: 30,
      suffix: "+",
      label: "Countries",
      description: "African nations represented"
    }
  ];

  const AnimatedStatCard = ({ stat, index }: { stat: typeof stats[0], index: number }) => {
    const count = useCountAnimation({ 
      end: stat.animationValue, 
      duration: 2000, 
      delay: index * 200,
      isVisible 
    });

    const formatValue = () => {
      if (stat.prefix === "$" && stat.suffix === "K+") {
        return `$${count}K+`;
      }
      if (stat.suffix === "K+") {
        return `${count}K+`;
      }
      return `${count}${stat.suffix || ""}`;
    };

    return (
      <div 
        className={`text-center group transition-all duration-500 ${
          isVisible 
            ? 'animate-fade-in-up opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60 hover-lift hover-glow">
          <stat.icon className="h-10 w-10 text-blue-400 mx-auto mb-4 group-hover:text-teal-400 transition-colors duration-300 animate-float" />
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            {isVisible ? formatValue() : stat.value}
          </div>
          <div className="text-lg font-semibold text-blue-400 mb-1">{stat.label}</div>
          <div className="text-sm text-gray-400">{stat.description}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-blue-800/50 backdrop-blur-sm" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powering African Esports
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join the fastest-growing esports community in Africa with real impact and opportunities
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
