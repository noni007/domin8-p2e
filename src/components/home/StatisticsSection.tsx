
import { Users, Trophy, Globe, DollarSign } from "lucide-react";

export const StatisticsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Active Players",
      description: "Gamers competing across Africa"
    },
    {
      icon: Trophy,
      value: "2,500+",
      label: "Tournaments Held",
      description: "Competitive events completed"
    },
    {
      icon: DollarSign,
      value: "$250K+",
      label: "Prize Pools",
      description: "Total prizes distributed"
    },
    {
      icon: Globe,
      value: "30+",
      label: "Countries",
      description: "African nations represented"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-blue-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powering African Esports
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join the fastest-growing esports community in Africa with real impact and opportunities
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 transition-all duration-300 group-hover:border-blue-600/50 group-hover:bg-black/60">
                <stat.icon className="h-10 w-10 text-blue-400 mx-auto mb-4 group-hover:text-teal-400 transition-colors" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-blue-400 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
