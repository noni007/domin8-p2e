import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { logFriendAdded } from '@/utils/activityHelpers';
import type { Tables } from '@/integrations/supabase/types';

type Friendship = Tables<'friendships'>;
type FriendRequest = Tables<'friend_requests'>;

// Public profile shape returned by get_public_profiles RPC (no email, bio, updated_at)
interface PublicProfile {
  id: string;
  username: string | null;
  user_type: string;
  avatar_url: string | null;
  skill_rating: number | null;
  win_rate: number | null;
  games_played: number | null;
  current_streak: number | null;
  best_streak: number | null;
  created_at: string;
}

interface FriendWithProfile extends Friendship {
  friend_profile?: PublicProfile;
}

interface FriendRequestWithProfile extends FriendRequest {
  sender_profile?: PublicProfile;
  receiver_profile?: PublicProfile;
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [friends, setFriends] = React.useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = React.useState<FriendRequestWithProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = React.useState<FriendRequestWithProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // First get friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      // Then get profiles for friends using secure RPC
      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map(f => f.friend_id);
        // Use get_public_profiles RPC and filter by friend IDs
        const { data: profiles, error: profilesError } = await supabase
          .rpc('get_public_profiles');

        if (profilesError) throw profilesError;

        // Filter to only include friend profiles
        const friendProfiles = (profiles || []).filter((p: any) => friendIds.includes(p.id));

        // Combine friendships with profiles
        const friendsWithProfiles = friendships.map(friendship => ({
          ...friendship,
          friend_profile: friendProfiles?.find((p: any) => p.id === friendship.friend_id)
        }));

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      // Get all public profiles once for efficiency
      const { data: allProfiles, error: profilesError } = await supabase
        .rpc('get_public_profiles');

      if (profilesError) throw profilesError;

      // Get receiver profiles for sent requests
      if (sent && sent.length > 0) {
        const receiverIds = sent.map(r => r.receiver_id);
        const receiverProfiles = (allProfiles || []).filter((p: any) => receiverIds.includes(p.id));

        const sentWithProfiles = sent.map(request => ({
          ...request,
          receiver_profile: receiverProfiles?.find((p: any) => p.id === request.receiver_id)
        }));

        setSentRequests(sentWithProfiles);
      } else {
        setSentRequests([]);
      }

      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Get sender profiles for received requests
      if (received && received.length > 0) {
        const senderIds = received.map(r => r.sender_id);
        const senderProfiles = (allProfiles || []).filter((p: any) => senderIds.includes(p.id));

        const receivedWithProfiles = received.map(request => ({
          ...request,
          sender_profile: senderProfiles?.find((p: any) => p.id === request.sender_id)
        }));

        setReceivedRequests(receivedWithProfiles);
      } else {
        setReceivedRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setSentRequests([]);
      setReceivedRequests([]);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({ title: "Friend Request Sent", description: "Your friend request has been sent successfully." });

      await fetchFriendRequests();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({ title: "Error", description: "Failed to send friend request. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return false;

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
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

      // Get friend's profile for activity logging using secure RPC
      const { data: friendProfiles } = await supabase
        .rpc('get_safe_profile', { target_user_id: senderId });

      // Log activity for both users
      const friendProfile = friendProfiles?.[0];
      if (friendProfile) {
        await Promise.all([
          logFriendAdded(user.id, friendProfile.username || 'Unknown', senderId),
          logFriendAdded(senderId, user.email || 'Unknown', user.id)
        ]);
      }

      toast({ title: "Friend Request Accepted", description: "You are now friends!" });

      await Promise.all([fetchFriends(), fetchFriendRequests()]);
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({ title: "Error", description: "Failed to accept friend request. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: "Friend Request Declined", description: "The friend request has been declined." });

      await fetchFriendRequests();
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({ title: "Error", description: "Failed to decline friend request. Please try again.", variant: "destructive" });
      return false;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;

      toast({ title: "Friend Removed", description: "You are no longer friends." });

      await fetchFriends();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({ title: "Error", description: "Failed to remove friend. Please try again.", variant: "destructive" });
      return false;
    }
  };

  React.useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([fetchFriends(), fetchFriendRequests()]);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    friends,
    sentRequests,
    receivedRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()])
  };
};