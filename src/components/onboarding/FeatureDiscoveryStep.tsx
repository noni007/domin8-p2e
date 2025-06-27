
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp, Wallet, Calendar, Shield, Bell, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Tournament System",
    description: "Join competitive tournaments with real prizes and ranking points",
    highlights: ["Multiple game types", "Automated brackets", "Live results"],
    color: "text-yellow-400 bg-yellow-400/10",
    badge: "Core Feature"
  },
  {
    icon: TrendingUp,
    title: "AER Ranking System",
    description: "Our Advanced Esports Ranking tracks your skill across all games",
    highlights: ["Global leaderboards", "Skill progression", "Performance analytics"],
    color: "text-blue-400 bg-blue-400/10",
    badge: "Unique"
  },
  {
    icon: Users,
    title: "Team & Social Features",
    description: "Connect with other players, form teams, and build your network",
    highlights: ["Team management", "Friend system", "Activity feeds"],
    color: "text-green-400 bg-green-400/10",
    badge: "Community"
  },
  {
    icon: Wallet,
    title: "Digital Wallet",
    description: "Manage your earnings, tournament fees, and prize winnings",
    highlights: ["Secure transactions", "Prize distribution", "Payment history"],
    color: "text-purple-400 bg-purple-400/10",
    badge: "Financial"
  },
  {
    icon: Calendar,
    title: "Activity Dashboard",
    description: "Track all your gaming activities and performance metrics",
    highlights: ["Match history", "Statistics", "Achievement tracking"],
    color: "text-teal-400 bg-teal-400/10",
    badge: "Analytics"
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Stay updated with tournament results, friend activities, and more",
    highlights: ["Live updates", "Custom alerts", "Mobile friendly"],
    color: "text-red-400 bg-red-400/10",
    badge: "Live"
  }
];

export const FeatureDiscoveryStep = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-white">Discover What Makes Domin8 Special</h3>
        <p className="text-gray-400">
          Explore the powerful features that will elevate your esports journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="bg-black/40 border-blue-800/30 hover:border-blue-700/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">{feature.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Key Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {feature.highlights.map((highlight, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs border-gray-600 text-gray-300"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-4 pt-6">
        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-lg border border-blue-800/30">
          <Shield className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">Built for African Gamers</h4>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            Domin8 is specifically designed to serve the African esports community with 
            features like local payment methods, optimized performance for various internet speeds, 
            and tournaments that fit your timezone.
          </p>
        </div>
      </div>
    </div>
  );
};
