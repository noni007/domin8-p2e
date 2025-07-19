
import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const subscriptionAttemptRef = useRef(false);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      channelRef.current = null;
    }
    setIsSubscribed(false);
    subscriptionAttemptRef.current = false;
  }, [channelName]);

  const createSubscription = useCallback(() => {
    // Prevent multiple subscription attempts
    if (!enabled || !mountedRef.current || subscriptionAttemptRef.current || channelRef.current) {
      return;
    }

    // Mark that we're attempting a subscription
    subscriptionAttemptRef.current = true;

    // Create unique channel name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const uniqueChannelName = `${channelName}-${timestamp}`;
    
    const channel = supabase.channel(uniqueChannelName);
    channelRef.current = channel;

    // Set up subscription with status handler
    channel.subscribe((status, error) => {
      if (!mountedRef.current) return;
      
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true);
        
        // Call the ready callback when subscription is established
        if (onSubscriptionReady && channelRef.current) {
          try {
            onSubscriptionReady(channelRef.current);
          } catch (callbackError) {
            console.error('Error in onSubscriptionReady callback:', callbackError);
          }
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.error(`Channel subscription failed:`, error);
        setIsSubscribed(false);
        subscriptionAttemptRef.current = false;
      }
    });
  }, [channelName, enabled, onSubscriptionReady]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!enabled) {
      cleanup();
      return;
    }

    // Small delay to prevent rapid re-subscriptions
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        createSubscription();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [channelName, enabled, createSubscription, cleanup]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    channel: channelRef.current,
    isSubscribed,
    cleanup
  };
};
