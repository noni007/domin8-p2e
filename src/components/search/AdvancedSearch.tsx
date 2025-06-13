
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface SearchFilter {
  id: string;
  label: string;
  type: 'select' | 'range' | 'checkbox';
  options?: string[];
  value?: any;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void;
  placeholder?: string;
  filters?: SearchFilter[];
}

export const AdvancedSearch = ({ 
  onSearch, 
  placeholder = "Search...", 
  filters = [] 
}: AdvancedSearchProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-black/40 border-blue-800/30 text-white placeholder:text-gray-400"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-blue-800/30 text-blue-400 hover:bg-blue-800/20 relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button 
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          Search
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400">Active filters:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find(f => f.id === filterId);
            return (
              <Badge 
                key={filterId}
                variant="secondary"
                className="bg-blue-800/20 text-blue-400 hover:bg-blue-800/30"
              >
                {filter?.label}: {Array.isArray(value) ? value.join(', ') : value}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-red-400" 
                  onClick={() => removeFilter(filterId)}
                />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-black/40 border-blue-800/30 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options && (
                  <select
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full p-2 rounded-md bg-black/40 border border-blue-800/30 text-white"
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-1">
                    {filter.options.map((option) => (
                      <label key={option} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(activeFilters[filter.id] || []).includes(option)}
                          onChange={(e) => {
                            const current = activeFilters[filter.id] || [];
                            const updated = e.target.checked
                              ? [...current, option]
                              : current.filter((item: string) => item !== option);
                            handleFilterChange(filter.id, updated);
                          }}
                          className="rounded border-blue-800/30"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
