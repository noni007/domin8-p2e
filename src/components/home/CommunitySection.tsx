
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Flag, Heart } from "lucide-react";

export const CommunitySection = () => {
  const communityFeatures = [
    {
      icon: Users,
      title: "Join Teams",
      description: "Form or join competitive teams with players from your region or across Africa"
    },
    {
      icon: MessageCircle,
      title: "Connect & Chat",
      description: "Build friendships, share strategies, and celebrate victories together"
    },
    {
      icon: Flag,
      title: "Represent Your Country",
      description: "Compete in regional tournaments and bring glory to your nation"
    },
    {
      icon: Heart,
      title: "Mentorship Program",
      description: "Learn from pro players and help newcomers discover their potential"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-blue-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              More Than Just Competition
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Domin8 is building Africa's strongest gaming community. Connect with players, form lasting friendships, and be part of something bigger than yourself.
            </p>
            
            <div className="space-y-6 mb-8">
              {communityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={() => window.location.href = '/friends'}
            >
              Join the Community
            </Button>
          </div>
          
          <div className="relative">
            <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Community Highlights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active Players Online</span>
                  <span className="text-green-400 font-semibold">12,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Teams Formed This Month</span>
                  <span className="text-blue-400 font-semibold">1,243</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Friendships Made</span>
                  <span className="text-purple-400 font-semibold">50K+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Countries Represented</span>
                  <span className="text-yellow-400 font-semibold">30+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
