
import { Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

interface ActivityHeaderProps {
  title: string;
  showFilters: boolean;
  showFilterPanel: boolean;
  onToggleFilterPanel: () => void;
}

export const ActivityHeader = ({ 
  title, 
  showFilters, 
  showFilterPanel, 
  onToggleFilterPanel 
}: ActivityHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-white flex items-center text-lg">
        <Activity className="h-4 w-4 mr-2 text-blue-400" />
        {title}
      </CardTitle>
      {showFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFilterPanel}
          className="text-gray-400 hover:text-gray-300"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>
      )}
    </div>
  );
};
