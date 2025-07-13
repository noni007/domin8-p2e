
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Star, Users, Target, Zap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { MediaGenerator } from "@/components/social/MediaGenerator";

type Achievement = Tables<'achievements'>;

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export const AchievementCard = ({ achievement, isUnlocked, progress }: AchievementCardProps) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'victory':
        return Trophy;
      case 'social':
        return Users;
      case 'performance':
        return Target;
      case 'participation':
        return Star;
      default:
        return Zap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'victory':
        return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
      case 'social':
        return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
      case 'performance':
        return 'border-red-600/30 bg-red-600/10 text-red-400';
      case 'participation':
        return 'border-green-600/30 bg-green-600/10 text-green-400';
      default:
        return 'border-purple-600/30 bg-purple-600/10 text-purple-400';
    }
  };

  const Icon = getIcon(achievement.category);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      isUnlocked 
        ? 'bg-black/40 border-2 border-yellow-600/50 shadow-lg shadow-yellow-600/20' 
        : 'bg-black/20 border border-gray-600/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-lg border ${getCategoryColor(achievement.category)} ${
            !isUnlocked && 'opacity-50 grayscale'
          }`}>
            {isUnlocked ? (
              <Icon className="h-6 w-6" />
            ) : (
              <Lock className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${
                isUnlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {achievement.name}
              </h3>
              {isUnlocked && (
                <Badge className="bg-yellow-600 text-black text-xs">
                  Unlocked
                </Badge>
              )}
            </div>
            
            <p className={`text-sm ${
              isUnlocked ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {achievement.description}
            </p>
            
            {achievement.reward_amount > 0 && (
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">
                  ${(achievement.reward_amount / 100).toFixed(2)} reward
                </span>
              </div>
            )}
            
            {!isUnlocked && progress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-400">
                    {progress.current}/{progress.target}
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>
            )}
          </div>
        </div>
        
        {/* Social Share for Unlocked Achievements */}
        {isUnlocked && (
          <div className="mt-4 pt-4 border-t border-gray-600/30 space-y-3">
            <MediaGenerator 
              type="achievement_unlock" 
              data={achievement}
            />
            <div className="flex justify-center">
              <SocialShareButton
                title={`Achievement Unlocked: ${achievement.name}!`}
                description={`${achievement.description}${achievement.reward_amount > 0 ? ` Earned $${(achievement.reward_amount / 100).toFixed(2)}!` : ''}`}
                type="achievement"
                url={`${window.location.origin}/profile?tab=achievements`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
