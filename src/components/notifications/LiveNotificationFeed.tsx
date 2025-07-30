import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Trophy, Users, Calendar, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Notification = Tables<'notifications'>;

export const LiveNotificationFeed = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  // Real-time subscription for notifications
  const { isSubscribed } = useRealTimeSubscription({
    channelName: `notifications-${user?.id}`,
    enabled: !!user,
    onSubscriptionReady: (channel) => {
      if (!user) return;

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        }
      );

      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification updated:', payload);
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          
          // Update unread count if notification was marked as read
          if (updatedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      );
    }
  });

  // Fetch initial notifications
  React.useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);

  // Request notification permission
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tournament_update':
      case 'tournament_start':
        return <Trophy className="h-4 w-4" />;
      case 'match_result':
      case 'match_start':
        return <Calendar className="h-4 w-4" />;
      case 'friend_request':
      case 'team_invite':
        return <Users className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="relative p-2"
      >
        {isVisible ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-600 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isVisible && (
        <Card className="absolute right-0 top-full mt-2 w-80 bg-black/90 border-blue-800/30 backdrop-blur-sm z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">
                Live Notifications
                {isSubscribed && (
                  <Badge className="ml-2 bg-green-600 text-white text-xs">
                    Live
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-gray-800/30 text-gray-300' 
                        : 'bg-blue-600/20 text-white border border-blue-500/30'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs opacity-75 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs opacity-50 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};