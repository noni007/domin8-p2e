
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityItem } from "./ActivityItem";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityPagination } from "./ActivityPagination";
import { ActivitySearchBar } from "./ActivitySearchBar";
import { ActivityStats } from "./ActivityStats";
import { ActivityLoadMore } from "./ActivityLoadMore";
import { ActivityEmptyState } from "./ActivityEmptyState";
import { ActivityHeader } from "./ActivityHeader";
import { usePaginatedActivityFeed } from "@/hooks/usePaginatedActivityFeed";
import { Loader2 } from "lucide-react";
import type { ActivityType } from "@/utils/activityHelpers";

interface EnhancedActivityFeedProps {
  showFilters?: boolean;
  maxItems?: number;
  title?: string;
  userId?: string;
  showPagination?: boolean;
}

export const EnhancedActivityFeed = ({ 
  showFilters = true, 
  maxItems,
  title = "Activity Feed",
  userId,
  showPagination = true
}: EnhancedActivityFeedProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<ActivityType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { 
    personalActivities, 
    friendsActivities, 
    loading,
    personalTotal,
    friendsTotal,
    hasMorePersonal,
    hasMoreFriends,
    loadMorePersonal,
    loadMoreFriends,
    refetch
  } = usePaginatedActivityFeed({
    pageSize,
    activityTypes: selectedFilters,
    userId
  });

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

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [allActivities, searchQuery, maxItems]);

  const paginatedActivities = useMemo(() => {
    if (!showPagination) return filteredActivities;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredActivities.slice(startIndex, endIndex);
  }, [filteredActivities, currentPage, pageSize, showPagination]);

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFilters([]);
  };

  const hasFilters = Boolean(searchQuery || selectedFilters.length > 0);
  const totalItems = filteredActivities.length;

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
      <CardHeader className="space-y-4">
        <ActivityHeader
          title={title}
          showFilters={showFilters}
          showFilterPanel={showFilterPanel}
          onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
        />

        <ActivitySearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {showFilters && showFilterPanel && (
          <ActivityFilters
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            activityCounts={activityCounts}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {paginatedActivities.length > 0 ? (
          <>
            {paginatedActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                showUserInfo={!userId}
              />
            ))}
            
            {!showPagination && !maxItems && (
              <ActivityLoadMore
                hasMorePersonal={hasMorePersonal}
                hasMoreFriends={hasMoreFriends}
                onLoadMorePersonal={loadMorePersonal}
                onLoadMoreFriends={loadMoreFriends}
              />
            )}

            {showPagination && !maxItems && (
              <ActivityPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
                loading={loading}
              />
            )}

            <ActivityStats
              totalItems={allActivities.length}
              displayedItems={filteredActivities.length}
              maxItems={maxItems}
            />
          </>
        ) : (
          <ActivityEmptyState
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </CardContent>
    </Card>
  );
};
