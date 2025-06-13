
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "./ActivityItem";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { Activity, ArrowRight } from "lucide-react";

interface RecentActivitiesProps {
  userId?: string;
  showViewAll?: boolean;
  maxItems?: number;
  title?: string;
}

export const RecentActivities = ({ 
  userId, 
  showViewAll = true, 
  maxItems = 5,
  title = "Recent Activity"
}: RecentActivitiesProps) => {
  const { personalActivities, friendsActivities } = useActivityFeed();
  
  // Show personal activities if userId matches current user, otherwise show friends activities
  const activities = userId ? personalActivities : friendsActivities;
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-white flex items-center text-lg">
          <Activity className="h-4 w-4 mr-2 text-blue-400" />
          {title}
        </CardTitle>
        {showViewAll && activities.length > maxItems && (
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
        {displayActivities.length > 0 ? (
          displayActivities.map((activity) => (
            <ActivityItem 
              key={activity.id} 
              activity={activity} 
              showUserInfo={!userId}
            />
          ))
        ) : (
          <div className="text-center py-4">
            <Activity className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
