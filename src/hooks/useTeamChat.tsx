
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type TeamMessage = Tables<'team_messages'> & {
  sender_profile: Tables<'profiles'>;
};

export const useTeamChat = (teamId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<TeamMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [teamId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select(`
          *,
          sender_profile:profiles(*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('team-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `team_id=eq.${teamId}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('team_messages')
            .select(`
              *,
              sender_profile:profiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string) => {
    if (!user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          sender_id: user.id,
          message: message
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    user
  };
};
