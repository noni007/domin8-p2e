
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RealTimeUpdatesProps {
  tournamentId?: string;
  userId?: string;
}

export const RealTimeUpdates = ({ tournamentId, userId }: RealTimeUpdatesProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!tournamentId && !userId) return;

    console.log('Setting up real-time updates for:', { tournamentId, userId });

    // Create unique channel name to prevent conflicts
    const channelName = `realtime-updates-${tournamentId || userId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: tournamentId ? `id=eq.${tournamentId}` : undefined
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
          filter: tournamentId ? `tournament_id=eq.${tournamentId}` : undefined
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
          filter: tournamentId ? `tournament_id=eq.${tournamentId}` : undefined
        },
        (payload) => {
          console.log('Participant update received:', payload);
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      );

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

    channel.subscribe((status) => {
      console.log('RealTimeUpdates channel status:', status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      console.log('Cleaning up real-time updates subscription');
      supabase.removeChannel(channel);
    };
  }, [tournamentId, userId]);

  if (!tournamentId && !userId) return null;

  return (
    <Card className="bg-black/20 border-blue-800/20 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs text-gray-300">
              {isConnected ? 'Connected' : 'Connecting...'}
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
