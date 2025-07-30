
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logFriendAdded } from '@/utils/activityHelpers';
import { useToast } from '@/hooks/use-toast';

export const useFriendSystem = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Check if friendship already exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFriendship) {
        toast({
          title: "Already Friends",
          description: "You're already friends with this user",
          variant: "destructive"
        });
        return false;
      }

      // Send friend request
      const { error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId
        });

      if (requestError) throw requestError;

      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent!"
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Accept the friend request
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create friendship entries (bidirectional)
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([
          { user_id: user.id, friend_id: senderId },
          { user_id: senderId, friend_id: user.id }
        ]);

      if (friendshipError) throw friendshipError;

      // Get friend's profile for activity logging
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', senderId)
        .single();

      if (profileError) {
        console.error('Error fetching friend profile:', profileError);
      }

      // Log activity for both users
      const friendName = friendProfile?.username || 'Unknown User';
      const currentUserName = profile?.username || 'Unknown User';
      
      await Promise.all([
        logFriendAdded(user.id, friendName, senderId),
        logFriendAdded(senderId, currentUserName, user.id)
      ]);

      toast({
        title: "Friend Request Accepted",
        description: `You're now friends with ${friendName}!`
      });

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendFriendRequest,
    acceptFriendRequest,
    loading
  };
};
