
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Target, Award, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Tables } from '@/integrations/supabase/types';

type UserActivity = Tables<'user_activities'>;
type Profile = Tables<'profiles'>;

interface ActivityWithProfile extends UserActivity {
  profile?: Profile;
}

interface ActivityItemProps {
  activity: ActivityWithProfile;
  showUserInfo?: boolean;
}

export const ActivityItem = ({ activity, showUserInfo = true }: ActivityItemProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tournament_join':
        return <Users className="h-4 w-4" />;
      case 'tournament_win':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'match_win':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'achievement_unlock':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'friend_added':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'tournament_win':
        return 'bg-yellow-600';
      case 'match_win':
        return 'bg-green-600';
      case 'achievement_unlock':
        return 'bg-purple-600';
      case 'friend_added':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getUserInitials = () => {
    if (activity.profile?.username) {
      return activity.profile.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {showUserInfo && (
            <Avatar className="h-10 w-10 border-2 border-blue-400">
              <AvatarImage 
                src={activity.profile?.avatar_url || undefined} 
                alt={activity.profile?.username || "User"} 
              />
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge 
                className={`${getActivityColor(activity.activity_type)} text-white`}
                variant="secondary"
              >
                {getActivityIcon(activity.activity_type)}
                <span className="ml-1 text-xs">{activity.title}</span>
              </Badge>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {showUserInfo && activity.profile?.username && (
              <p className="text-sm text-blue-400 mb-1">
                {activity.profile.username}
              </p>
            )}
            
            {activity.description && (
              <p className="text-sm text-gray-300">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
