import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, UserPlus } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";

export const FriendRequestsPanel = () => {
  const { receivedRequests, sentRequests, acceptFriendRequest, declineFriendRequest, loading } = useFriends();

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
      {/* Received Friend Requests */}
      {receivedRequests.length > 0 && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5" />
              Friend Requests ({receivedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {receivedRequests.map((request) => {
              const sender = request.sender_profile;
              if (!sender) return null;

              return (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-blue-800/20">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={sender.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {sender.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{sender.username}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {sender.user_type}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineFriendRequest(request.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Sent Friend Requests */}
      {sentRequests.length > 0 && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Pending Requests ({sentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentRequests.map((request) => {
              const receiver = request.receiver_profile;
              if (!receiver) return null;

              return (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-yellow-600/20">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={receiver.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {receiver.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{receiver.username}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {receiver.user_type}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {receivedRequests.length === 0 && sentRequests.length === 0 && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No pending friend requests</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};