
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityTypeIcon } from "./ActivityTypeIcon";
import type { ActivityType } from "@/utils/activityHelpers";

interface ActivityFiltersProps {
  selectedFilters: ActivityType[];
  onFilterChange: (filters: ActivityType[]) => void;
  activityCounts: Record<ActivityType, number>;
}

const ACTIVITY_FILTERS: { type: ActivityType; label: string }[] = [
  { type: 'tournament_win', label: 'Tournament Wins' },
  { type: 'tournament_join', label: 'Tournament Joins' },
  { type: 'match_win', label: 'Match Wins' },
  { type: 'achievement_unlock', label: 'Achievements' },
  { type: 'friend_added', label: 'New Friends' },
];

export const ActivityFilters = ({ 
  selectedFilters, 
  onFilterChange, 
  activityCounts 
}: ActivityFiltersProps) => {
  const toggleFilter = (filterType: ActivityType) => {
    if (selectedFilters.includes(filterType)) {
      onFilterChange(selectedFilters.filter(f => f !== filterType));
    } else {
      onFilterChange([...selectedFilters, filterType]);
    }
  };

  const clearAll = () => onFilterChange([]);
  const selectAll = () => onFilterChange(ACTIVITY_FILTERS.map(f => f.type));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Filter by Activity Type</h3>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_FILTERS.map((filter) => {
          const isSelected = selectedFilters.includes(filter.type);
          const count = activityCounts[filter.type] || 0;
          
          return (
            <Button
              key={filter.type}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.type)}
              className={`flex items-center space-x-1 ${
                isSelected 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <ActivityTypeIcon activityType={filter.type} className="h-3 w-3" />
              <span className="text-xs">{filter.label}</span>
              {count > 0 && (
                <Badge className="ml-1 bg-gray-700 text-white text-xs px-1 py-0 h-4">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
