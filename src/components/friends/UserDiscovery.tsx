
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/hooks/useAuth";
import { Search, UserPlus, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

export const UserDiscovery = () => {
  const { user } = useAuth();
  const { friends, sentRequests, sendFriendRequest } = useFriends();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Profile[]>([]);
  const [searching, setSearching] = React.useState(false);

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const getUserStatus = (userId: string) => {
    const isFriend = friends.some(f => f.friend_id === userId);
    const hasSentRequest = sentRequests.some(r => r.receiver_id === userId);
    
    if (isFriend) return 'friend';
    if (hasSentRequest) return 'pending';
    return 'none';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Find Friends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
          />
          <Button
            onClick={searchUsers}
            disabled={searching || !searchTerm.trim()}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searching && (
          <div className="text-center py-4">
            <div className="text-gray-400">Searching...</div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((profile) => {
              const status = getUserStatus(profile.id);
              
              return (
                <div key={profile.id} className="bg-black/20 rounded-lg p-3 border border-blue-800/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {profile.username || "Unknown User"}
                        </p>
                        <Badge className={`text-xs ${
                          profile.user_type === 'player' ? 'bg-blue-600' :
                          profile.user_type === 'creator' ? 'bg-purple-600' :
                          profile.user_type === 'organizer' ? 'bg-green-600' :
                          'bg-orange-600'
                        } text-white capitalize`}>
                          {profile.user_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      {status === 'friend' && (
                        <Badge className="bg-green-600 text-white">
                          Friends
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge className="bg-yellow-600 text-white">
                          Request Sent
                        </Badge>
                      )}
                      {status === 'none' && (
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(profile.id)}
                          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {searchTerm && !searching && searchResults.length === 0 && (
          <div className="text-center py-4">
            <div className="text-gray-400">No users found matching "{searchTerm}"</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
