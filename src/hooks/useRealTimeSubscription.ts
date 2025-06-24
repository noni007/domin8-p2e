
import { useEffect, useRef, useCallback } from 'react';
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
  const subscriptionPromiseRef = useRef<Promise<void> | null>(null);

  const cleanup = useCallback(() => {
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
      subscriptionPromiseRef.current = null;
    }
  }, [channelName]);

  const createSubscription = useCallback(() => {
    if (!enabled || isSubscribedRef.current || subscriptionPromiseRef.current) {
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

    // Create subscription promise to prevent multiple attempts
    subscriptionPromiseRef.current = new Promise<void>((resolve, reject) => {
      let hasResolved = false;
      
      const resolveOnce = () => {
        if (!hasResolved) {
          hasResolved = true;
          resolve();
        }
      };

      const rejectOnce = (error: any) => {
        if (!hasResolved) {
          hasResolved = true;
          reject(error);
        }
      };

      // Set up subscription status handler
      channel.subscribe((status, error) => {
        console.log(`Channel ${uniqueChannelName} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          resolveOnce();
          
          // Call the ready callback when subscription is established
          if (onSubscriptionReady && channelRef.current) {
            try {
              onSubscriptionReady(channelRef.current);
            } catch (callbackError) {
              console.error('Error in onSubscriptionReady callback:', callbackError);
            }
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
          rejectOnce(error || new Error(`Channel subscription failed with status: ${status}`));
        }
      });
    });

    return subscriptionPromiseRef.current;
  }, [channelName, enabled, onSubscriptionReady, cleanup]);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    // Delay subscription to prevent rapid re-subscriptions
    cleanupTimeoutRef.current = setTimeout(() => {
      createSubscription()?.catch((error) => {
        console.error('Subscription failed:', error);
        cleanup();
      });
    }, 100);

    return cleanup;
  }, [channelName, enabled, createSubscription, cleanup]);

  return {
    channel: channelRef.current,
    isSubscribed: isSubscribedRef.current,
    cleanup
  };
};
