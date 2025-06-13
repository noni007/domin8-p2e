
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ActivitySearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ActivitySearchBar = ({ searchQuery, onSearchChange }: ActivitySearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search activities..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
      />
    </div>
  );
};
