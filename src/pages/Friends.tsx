import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { ProfileNavigation } from "@/components/profile/ProfileNavigation";
import { UserDiscovery } from "@/components/friends/UserDiscovery";
import { Users, UserPlus, Search, Check, X } from "lucide-react";

const Friends = () => {
  const { user } = useAuth();
  const { friends, sentRequests, receivedRequests, loading, acceptFriendRequest, declineFriendRequest, removeFriend } = useFriends();
  const [searchTerm, setSearchTerm] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Please Sign In</h3>
            <p className="text-gray-400">You need to be signed in to view your friends.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredFriends = friends.filter(friend =>
    friend.friend_profile?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.friend_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <ProfileNavigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Manage your friends and friend requests</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="friends" className="space-y-6">
              <TabsList className="bg-black/40 border-blue-800/30">
                <TabsTrigger value="friends" className="data-[state=active]:bg-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="data-[state=active]:bg-blue-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Requests ({receivedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-blue-600">
                  Sent ({sentRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="friends">
                <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Your Friends
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search friends..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64 bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400">Loading friends...</div>
                      </div>
                    ) : filteredFriends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {searchTerm ? "No friends found" : "No friends yet"}
                        </h3>
                        <p className="text-gray-400">
                          {searchTerm ? "Try adjusting your search terms" : "Start connecting with other players!"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {filteredFriends.map((friendship) => (
                          <div key={friendship.id} className="bg-black/20 rounded-lg p-4 border border-blue-800/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {friendship.friend_profile?.username || "Unknown User"}
                                  </p>
                                  <Badge className="bg-green-600 text-white text-xs">
                                    Friend
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFriend(friendship.friend_id)}
                                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests">
                <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Friend Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400">Loading requests...</div>
                      </div>
                    ) : receivedRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No friend requests</h3>
                        <p className="text-gray-400">You don't have any pending friend requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receivedRequests.map((request) => (
                          <div key={request.id} className="bg-black/20 rounded-lg p-4 border border-blue-800/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {request.sender_profile?.username || "Unknown User"}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    Sent {new Date(request.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => declineFriendRequest(request.id)}
                                  className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sent">
                <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Sent Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400">Loading sent requests...</div>
                      </div>
                    ) : sentRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No sent requests</h3>
                        <p className="text-gray-400">You haven't sent any friend requests yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentRequests.map((request) => (
                          <div key={request.id} className="bg-black/20 rounded-lg p-4 border border-blue-800/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {request.receiver_profile?.username || "Unknown User"}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    Sent {new Date(request.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-yellow-600 text-white">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <UserDiscovery />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Friends;
