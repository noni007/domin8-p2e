
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const ActivityEmptyState = ({ hasFilters, onClearFilters }: ActivityEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-gray-500 mx-auto mb-2" />
      <p className="text-gray-400">
        {hasFilters ? "No activities match your filters" : "No activities yet"}
      </p>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="mt-2 text-blue-400 hover:text-blue-300"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};
