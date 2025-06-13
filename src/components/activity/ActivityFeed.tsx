
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityItem } from "./ActivityItem";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { Loader2, Activity } from "lucide-react";

export const ActivityFeed = () => {
  const { personalActivities, friendsActivities, loading } = useActivityFeed();

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-400" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="bg-black/40 border-blue-800/30 w-full">
            <TabsTrigger value="friends" className="flex-1 data-[state=active]:bg-blue-600">
              Friends ({friendsActivities.length})
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex-1 data-[state=active]:bg-blue-600">
              Your Activity ({personalActivities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-3">
            {friendsActivities.length > 0 ? (
              friendsActivities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  showUserInfo={true}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No friend activities yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Connect with friends to see their gaming activities!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-3">
            {personalActivities.length > 0 ? (
              personalActivities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  showUserInfo={false}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No activities yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Join tournaments and play matches to start building your activity timeline!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
