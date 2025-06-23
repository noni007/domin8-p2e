
import { useEffect, useState, useRef } from "react";
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
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Cleanup function
  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up real-time updates channel');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (!tournamentId && !userId) {
      cleanup();
      return;
    }

    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    // Clean up any existing channel first
    cleanup();

    console.log('Setting up real-time updates for:', { tournamentId, userId });

    // Create unique channel name
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const channelName = `realtime-updates-${tournamentId || userId}-${timestamp}-${random}`;
    
    console.log('Creating real-time updates channel:', channelName);
    channelRef.current = supabase.channel(channelName);

    // Add tournament-related subscriptions
    if (tournamentId) {
      channelRef.current
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
      channelRef.current.on(
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

    channelRef.current.subscribe((status) => {
      console.log('RealTimeUpdates channel status:', status);
      const connected = status === 'SUBSCRIBED';
      setIsConnected(connected);
      isSubscribedRef.current = connected;
    });

    return cleanup;
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
