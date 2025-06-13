
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";

interface TournamentSearchProps {
  onSearch: (filters: SearchFilters) => void;
  gameOptions: string[];
}

export interface SearchFilters {
  query: string;
  game: string;
  status: string;
  prizeRange: string;
  sortBy: string;
}

export const TournamentSearch = ({ onSearch, gameOptions }: TournamentSearchProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    game: "",
    status: "",
    prizeRange: "",
    sortBy: "start_date"
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: "",
      game: "",
      status: "",
      prizeRange: "",
      sortBy: "start_date"
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const activeFilterCount = Object.values(filters).filter(value => value && value !== "start_date").length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tournaments by name or description..."
          value={filters.query}
          onChange={(e) => handleFilterChange("query", e.target.value)}
          className="pl-10 bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Game</label>
                <Select value={filters.game} onValueChange={(value) => handleFilterChange("game", value)}>
                  <SelectTrigger className="bg-black/20 border-blue-800/50 text-white">
                    <SelectValue placeholder="All games" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All games</SelectItem>
                    {gameOptions.map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="bg-black/20 border-blue-800/50 text-white">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="registration_open">Registration Open</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Prize Pool</label>
                <Select value={filters.prizeRange} onValueChange={(value) => handleFilterChange("prizeRange", value)}>
                  <SelectTrigger className="bg-black/20 border-blue-800/50 text-white">
                    <SelectValue placeholder="Any amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any amount</SelectItem>
                    <SelectItem value="0-500">$0 - $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000+">$5,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Sort by</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="bg-black/20 border-blue-800/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start_date">Start Date</SelectItem>
                    <SelectItem value="prize_pool">Prize Pool</SelectItem>
                    <SelectItem value="created_at">Newest</SelectItem>
                    <SelectItem value="registration_deadline">Registration Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
