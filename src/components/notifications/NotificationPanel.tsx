
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Check, Settings, Bell } from 'lucide-react';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  );

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="bg-black/95 border-blue-800/30 text-white">
      {/* Header */}
      <div className="p-4 border-b border-blue-800/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={() => window.location.href = '/profile?tab=notifications'}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="h-7 text-xs"
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 text-xs p-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs text-blue-400 hover:text-blue-300"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-96">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem notification={notification} />
                {index < filteredNotifications.length - 1 && (
                  <Separator className="my-2 bg-blue-800/30" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-blue-800/30">
          <Button
            variant="ghost"
            className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/50"
            onClick={() => window.location.href = '/profile?tab=notifications'}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};
