
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ActivityTypeIcon } from "./ActivityTypeIcon";
import type { ActivityType } from "@/utils/activityHelpers";

interface ActivityItemProps {
  activity: {
    id: string;
    activity_type: string;
    title: string;
    description?: string;
    created_at: string;
    metadata?: any; // Changed from Record<string, any> to any to handle Json type
    profile?: {
      id: string;
      username?: string;
      avatar_url?: string;
    };
  };
  showUserInfo?: boolean;
}

export const ActivityItem = ({ activity, showUserInfo = false }: ActivityItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'tournament_win':
        return 'bg-yellow-600';
      case 'tournament_join':
        return 'bg-blue-600';
      case 'match_win':
        return 'bg-green-600';
      case 'achievement_unlock':
        return 'bg-purple-600';
      case 'friend_added':
        return 'bg-cyan-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Safely parse metadata if it's a string, otherwise use as-is
  const parseMetadata = (metadata: any) => {
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    return metadata || {};
  };

  const parsedMetadata = parseMetadata(activity.metadata);

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        <ActivityTypeIcon 
          activityType={activity.activity_type as ActivityType} 
          className="h-5 w-5" 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {showUserInfo && activity.profile && (
            <span className="text-sm font-medium text-blue-400">
              {activity.profile.username || 'Unknown User'}
            </span>
          )}
          <Badge className={`${getActivityColor(activity.activity_type)} text-white text-xs`}>
            {formatActivityType(activity.activity_type)}
          </Badge>
        </div>
        
        <h4 className="text-white font-medium text-sm">{activity.title}</h4>
        
        {activity.description && (
          <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
        )}
        
        {/* Enhanced metadata display */}
        {parsedMetadata && Object.keys(parsedMetadata).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {parsedMetadata.streak && (
              <Badge className="bg-orange-600 text-white text-xs">
                🔥 {parsedMetadata.streak} streak
              </Badge>
            )}
            {parsedMetadata.prizePool && (
              <Badge className="bg-green-600 text-white text-xs">
                💰 ${parsedMetadata.prizePool}
              </Badge>
            )}
            {parsedMetadata.achievementName && (
              <Badge className="bg-purple-600 text-white text-xs">
                🏆 {parsedMetadata.achievementName}
              </Badge>
            )}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
      </div>
    </div>
  );
};
