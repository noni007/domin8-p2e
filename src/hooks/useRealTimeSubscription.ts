
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealTimeSubscriptionProps {
  channelName: string;
  enabled?: boolean;
  onSubscriptionReady?: (channel: RealtimeChannel) => void;
}

export const useRealTimeSubscription = ({ 
  channelName, 
  enabled = true, 
  onSubscriptionReady 
}: UseRealTimeSubscriptionProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }

    if (channelRef.current && isSubscribedRef.current) {
      console.log('Cleaning up real-time subscription:', channelName);
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  };

  const createSubscription = () => {
    if (!enabled || isSubscribedRef.current) {
      return null;
    }

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name with timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const uniqueChannelName = `${channelName}-${timestamp}-${random}`;
    
    console.log('Creating real-time subscription:', uniqueChannelName);
    
    const channel = supabase.channel(uniqueChannelName);
    channelRef.current = channel;

    // Set up subscription status handler
    const subscribePromise = new Promise<RealtimeChannel>((resolve) => {
      channel.subscribe((status) => {
        console.log(`Channel ${uniqueChannelName} status:`, status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          resolve(channel);
        }
      });
    });

    // Call the ready callback when subscription is established
    if (onSubscriptionReady) {
      subscribePromise.then(onSubscriptionReady);
    }

    return channel;
  };

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    // Delay subscription to prevent rapid re-subscriptions
    cleanupTimeoutRef.current = setTimeout(() => {
      createSubscription();
    }, 100);

    return cleanup;
  }, [channelName, enabled]);

  return {
    channel: channelRef.current,
    isSubscribed: isSubscribedRef.current,
    cleanup
  };
};
