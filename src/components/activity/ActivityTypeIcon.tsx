
import { 
  Trophy, 
  Zap, 
  Award, 
  Users, 
  Target,
  Crown,
  Flame,
  Star
} from "lucide-react";
import type { ActivityType } from "@/utils/activityHelpers";

interface ActivityTypeIconProps {
  activityType: ActivityType;
  className?: string;
}

export const ActivityTypeIcon = ({ activityType, className = "h-4 w-4" }: ActivityTypeIconProps) => {
  const getIcon = () => {
    switch (activityType) {
      case 'tournament_join':
        return <Target className={`${className} text-blue-400`} />;
      case 'tournament_win':
        return <Crown className={`${className} text-yellow-400`} />;
      case 'match_win':
        return <Zap className={`${className} text-green-400`} />;
      case 'achievement_unlock':
        return <Award className={`${className} text-purple-400`} />;
      case 'friend_added':
        return <Users className={`${className} text-cyan-400`} />;
      default:
        return <Star className={`${className} text-gray-400`} />;
    }
  };

  return getIcon();
};
