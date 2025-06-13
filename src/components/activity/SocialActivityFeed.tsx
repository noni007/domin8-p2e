
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "./ActivityItem";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { Activity, Users, TrendingUp, ArrowRight } from "lucide-react";

export const SocialActivityFeed = () => {
  const { friendsActivities, loading } = useActivityFeed();

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading social feed...</p>
        </CardContent>
      </Card>
    );
  }

  const recentActivities = friendsActivities.slice(0, 8);
  const majorActivities = friendsActivities.filter(activity => 
    ['tournament_win', 'achievement_unlock'].includes(activity.activity_type)
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Social Highlights */}
      {majorActivities.length > 0 && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-white flex items-center text-lg">
              <TrendingUp className="h-4 w-4 mr-2 text-yellow-400" />
              Friend Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {majorActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                showUserInfo={true}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Social Activity */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-white flex items-center text-lg">
            <Users className="h-4 w-4 mr-2 text-blue-400" />
            Friends Activity Feed
          </CardTitle>
          {friendsActivities.length > 8 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-400 hover:text-blue-300"
              onClick={() => window.location.href = '/friends'}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                showUserInfo={true}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No friend activities yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Connect with friends to see their gaming activities!
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600"
                onClick={() => window.location.href = '/friends'}
              >
                Find Friends
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
