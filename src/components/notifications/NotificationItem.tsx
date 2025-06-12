
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Trophy, Calendar, Users, Award, UserPlus, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tournament_registration':
        return <Trophy className="h-4 w-4 text-blue-400" />;
      case 'match_schedule':
        return <Calendar className="h-4 w-4 text-green-400" />;
      case 'tournament_status':
        return <Users className="h-4 w-4 text-yellow-400" />;
      case 'match_result':
        return <Award className="h-4 w-4 text-purple-400" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-orange-400" />;
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-pink-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type and metadata
    const metadata = notification.metadata as any;
    if (metadata?.tournamentId) {
      window.location.href = `/tournaments?id=${metadata.tournamentId}`;
    } else if (metadata?.matchId) {
      window.location.href = `/tournaments?match=${metadata.matchId}`;
    } else if (metadata?.profileId) {
      window.location.href = `/profile/${metadata.profileId}`;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-blue-900/30 ${
        !notification.read ? 'bg-blue-900/20 border border-blue-800/50' : 'hover:bg-gray-800/30'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-white truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge variant="default" className="bg-blue-600 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                New
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
