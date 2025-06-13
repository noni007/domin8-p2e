
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityItem } from "./ActivityItem";
import { ActivityFilters } from "./ActivityFilters";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { Activity, Search, Filter } from "lucide-react";
import type { ActivityType } from "@/utils/activityHelpers";

interface EnhancedActivityFeedProps {
  showFilters?: boolean;
  maxItems?: number;
  title?: string;
}

export const EnhancedActivityFeed = ({ 
  showFilters = true, 
  maxItems,
  title = "Activity Feed"
}: EnhancedActivityFeedProps) => {
  const { personalActivities, friendsActivities, loading } = useActivityFeed();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<ActivityType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const allActivities = useMemo(() => {
    return [...personalActivities, ...friendsActivities].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [personalActivities, friendsActivities]);

  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply activity type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(activity =>
        selectedFilters.includes(activity.activity_type as ActivityType)
      );
    }

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [allActivities, searchQuery, selectedFilters, maxItems]);

  const activityCounts = useMemo(() => {
    const counts: Record<ActivityType, number> = {
      tournament_join: 0,
      tournament_win: 0,
      match_win: 0,
      achievement_unlock: 0,
      friend_added: 0,
    };

    allActivities.forEach(activity => {
      const type = activity.activity_type as ActivityType;
      if (counts.hasOwnProperty(type)) {
        counts[type]++;
      }
    });

    return counts;
  }, [allActivities]);

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center text-lg">
            <Activity className="h-4 w-4 mr-2 text-blue-400" />
            {title}
          </CardTitle>
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="text-gray-400 hover:text-gray-300"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && showFilterPanel && (
          <ActivityFilters
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            activityCounts={activityCounts}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredActivities.length > 0 ? (
          <>
            {filteredActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                showUserInfo={true}
              />
            ))}
            {maxItems && allActivities.length > maxItems && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-400">
                  Showing {Math.min(filteredActivities.length, maxItems)} of {allActivities.length} activities
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">
              {searchQuery || selectedFilters.length > 0 
                ? "No activities match your filters" 
                : "No activities yet"
              }
            </p>
            {(searchQuery || selectedFilters.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilters([]);
                }}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
