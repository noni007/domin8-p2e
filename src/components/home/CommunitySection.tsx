
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
    <div className="py-16 sm:py-24 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            More Than Just Competition
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Domin8 is building Africa's strongest gaming community. Connect with players, form lasting friendships, and be part of something bigger than yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {communityFeatures.map((feature, index) => (
            <div key={index} className="text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 mx-4 sm:mx-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 text-center">Community Highlights</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">12,847</div>
              <div className="text-gray-300 text-xs sm:text-sm">Active Players Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">1,243</div>
              <div className="text-gray-300 text-xs sm:text-sm">Teams Formed This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-300 text-xs sm:text-sm">Friendships Made</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">30+</div>
              <div className="text-gray-300 text-xs sm:text-sm">Countries Represented</div>
            </div>
          </div>
        </div>

        <div className="text-center px-4">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
            onClick={() => window.location.href = '/friends'}
          >
            Join the Community
          </Button>
        </div>
      </div>
    </div>
  );
};
