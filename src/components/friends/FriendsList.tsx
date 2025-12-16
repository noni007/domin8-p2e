
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Search, UserPlus, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleToast } from "@/hooks/useSimpleToast";

interface UserProfile {
  id: string;
  username: string;
  user_type: string;
  avatar_url?: string;
  skill_rating?: number;
  win_rate?: number;
  games_played?: number;
  current_streak?: number;
  best_streak?: number;
  created_at: string;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: UserProfile;
}

export const FriendsList = () => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [friends, setFriends] = React.useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // Fetch friendships and manually join with profiles
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      if (friendships && friendships.length > 0) {
        // Get friend profiles using the secure RPC
        const friendIds = friendships.map(f => f.friend_id);
        const { data: allProfiles, error: profilesError } = await supabase
          .rpc('get_public_profiles');

        if (profilesError) throw profilesError;
        
        // Filter to only include friend profiles
        const profiles = (allProfiles || []).filter((p: any) => friendIds.includes(p.id));

        // Combine friendships with profiles
        const friendsWithProfiles = friendships.map(friendship => ({
          ...friendship,
          friend_profile: profiles?.find(p => p.id === friendship.friend_id)
        })).filter(f => f.friend_profile);

        setFriends(friendsWithProfiles as Friendship[]);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({ title: "Error", description: "Failed to load friends list.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Use the secure RPC function instead of direct profile queries
      const { data, error } = await supabase
        .rpc('get_public_profiles', { search_term: searchQuery });

      if (error) throw error;

      // Filter out current user and existing friends
      const friendIds = friends.map(f => f.friend_id);
      const filtered = (data || [])
        .filter((profile: UserProfile) => 
          profile.id !== user?.id && !friendIds.includes(profile.id)
        )
        .slice(0, 10);

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({ title: "Error", description: "Failed to search users.", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const addFriend = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert([
          { user_id: user.id, friend_id: friendId }
        ]);

      if (error) throw error;

      toast({ title: "Success", description: "Friend added successfully!" });

      fetchFriends();
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({ title: "Error", description: "Failed to add friend.", variant: "destructive" });
    }
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5" />
            Find Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          {searching && (
            <div className="text-center text-gray-400">Searching...</div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((userProfile) => (
                <div key={userProfile.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {userProfile.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{userProfile.username || "Unknown User"}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {userProfile.user_type}
                        </Badge>
                        {userProfile.skill_rating && (
                          <span className="text-gray-400 text-sm">
                            Rating: {userProfile.skill_rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addFriend(userProfile.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-400">No users found matching "{searchQuery}"</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            My Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No friends yet. Start by searching for other players!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friendship) => {
                const friend = friendship.friend_profile;
                if (!friend) return null;

                return (
                  <div key={friendship.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {friend.username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{friend.username || "Unknown User"}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {friend.user_type}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            Friends since {new Date(friendship.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {friend.skill_rating && (
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-gray-400 text-sm">Rating: {friend.skill_rating}</span>
                            {friend.games_played && (
                              <span className="text-gray-400 text-sm">Games: {friend.games_played}</span>
                            )}
                            {friend.win_rate && (
                              <span className="text-gray-400 text-sm">Win Rate: {(friend.win_rate * 100).toFixed(1)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
