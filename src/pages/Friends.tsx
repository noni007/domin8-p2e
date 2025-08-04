
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsList } from "@/components/friends/FriendsList";
import { UserDiscovery } from "@/components/friends/UserDiscovery";
import { FriendRequestsPanel } from "@/components/friends/FriendRequestsPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Users, UserPlus, Clock } from "lucide-react";

export const Friends = () => {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-sm sm:text-base text-gray-400">Connect with other players and build your gaming network.</p>
        </div>
        
        <ErrorBoundary fallback={
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6 text-center">
            <p className="text-red-400">Unable to load friends system</p>
          </div>
        }>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border-blue-800/30">
              <TabsTrigger 
                value="friends" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                My Friends
              </TabsTrigger>
              <TabsTrigger 
                value="requests"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Requests
              </TabsTrigger>
              <TabsTrigger 
                value="discover"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="mt-6">
              <FriendsList />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <FriendRequestsPanel />
            </TabsContent>
            
            <TabsContent value="discover" className="mt-6">
              <UserDiscovery />
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </div>
  );
};


