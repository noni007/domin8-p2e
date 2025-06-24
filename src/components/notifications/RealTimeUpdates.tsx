
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";

interface RealTimeUpdatesProps {
  tournamentId?: string;
  userId?: string;
}

export const RealTimeUpdates = ({ tournamentId, userId }: RealTimeUpdatesProps) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const { channel, isSubscribed } = useRealTimeSubscription({
    channelName: `realtime-updates-${tournamentId || userId || 'anonymous'}`,
    enabled: !!(tournamentId || userId),
    onSubscriptionReady: (channel) => {
      // Add tournament-related subscriptions
      if (tournamentId) {
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tournaments',
              filter: `id=eq.${tournamentId}`
            },
            (payload) => {
              console.log('Tournament update received:', payload);
              setLastUpdate(new Date());
              setUpdateCount(prev => prev + 1);
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'matches',
              filter: `tournament_id=eq.${tournamentId}`
            },
            (payload) => {
              console.log('Match update received:', payload);
              setLastUpdate(new Date());
              setUpdateCount(prev => prev + 1);
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tournament_participants',
              filter: `tournament_id=eq.${tournamentId}`
            },
            (payload) => {
              console.log('Participant update received:', payload);
              setLastUpdate(new Date());
              setUpdateCount(prev => prev + 1);
            }
          );
      }

      // Add notifications subscription if userId is provided
      if (userId) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Notification update received:', payload);
            setLastUpdate(new Date());
            setUpdateCount(prev => prev + 1);
          }
        );
      }
    }
  });

  if (!tournamentId && !userId) return null;

  return (
    <Card className="bg-black/20 border-blue-800/20 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs text-gray-300">
              {isSubscribed ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {updateCount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs">
                <Bell className="h-3 w-3 mr-1" />
                {updateCount} updates
              </Badge>
            )}
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Last: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
