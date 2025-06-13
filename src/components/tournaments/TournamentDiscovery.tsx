
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TournamentSearch, SearchFilters } from "./TournamentSearch";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Clock, Trophy, Calendar, DollarSign } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { TournamentCardSkeleton } from "./TournamentCardSkeleton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { VirtualizedList } from "@/components/common/VirtualizedList";
import { useDebounce } from "@/hooks/useDebounce";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";

type Tournament = Tables<'tournaments'>;

export const TournamentDiscovery = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    game: "",
    status: "",
    prizeRange: "",
    sortBy: "start_date"
  });
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Debounce search query for better performance
  const debouncedQuery = useDebounce(searchFilters.query, 300);

  // Optimized query with better caching
  const { data: tournaments = [], isLoading, error } = useOptimizedQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache for tournaments
  });

  // Extract unique games for filter options (memoized)
  const gameOptions = useMemo(() => {
    return [...new Set(tournaments.map(t => t.game))];
  }, [tournaments]);

  // Memoized filtered tournaments with debounced search
  const filteredTournaments = useMemo(() => {
    let filtered = [...tournaments];

    // Text search with debounced query
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.game.toLowerCase().includes(query)
      );
    }

    // Game filter
    if (searchFilters.game) {
      filtered = filtered.filter(t => t.game === searchFilters.game);
    }

    // Status filter
    if (searchFilters.status) {
      filtered = filtered.filter(t => t.status === searchFilters.status);
    }

    // Prize range filter
    if (searchFilters.prizeRange) {
      const [min, max] = searchFilters.prizeRange.split('-').map(v => 
        v.includes('+') ? Infinity : parseInt(v)
      );
      filtered = filtered.filter(t => {
        if (max === undefined) return t.prize_pool >= min;
        return t.prize_pool >= min && t.prize_pool <= max;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'prize_pool':
          return b.prize_pool - a.prize_pool;
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'registration_deadline':
          return new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime();
        default: // start_date
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }
    });

    return filtered;
  }, [tournaments, debouncedQuery, searchFilters.game, searchFilters.status, searchFilters.prizeRange, searchFilters.sortBy]);

  const handleSearch = useCallback(async (filters: SearchFilters) => {
    setSearchLoading(true);
    setSearchFilters(filters);
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 150));
    setSearchLoading(false);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'registration_open': return 'bg-green-600';
      case 'upcoming': return 'bg-blue-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Memoized tournament card component to prevent unnecessary re-renders
  const TournamentCard = useCallback(({ tournament }: { tournament: Tournament }) => (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-white">{tournament.title}</h3>
              <Badge className={`${getStatusColor(tournament.status)} text-white text-xs`}>
                {tournament.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-gray-300 mb-3 line-clamp-2">{tournament.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-400">
                <Trophy className="h-4 w-4" />
                {tournament.game}
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <DollarSign className="h-4 w-4" />
                ${tournament.prize_pool.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <Users className="h-4 w-4" />
                Max {tournament.max_participants} players
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Calendar className="h-4 w-4" />
                {formatDate(tournament.start_date)}
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <Clock className="h-4 w-4" />
                Register by {formatDate(tournament.registration_deadline)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
              onClick={() => window.location.href = `/tournaments?view=${tournament.id}`}
            >
              View Details
            </Button>
            {tournament.status === 'registration_open' && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                onClick={() => window.location.href = `/tournaments?view=${tournament.id}`}
              >
                Join Tournament
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [getStatusColor, formatDate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-20 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner text="Loading tournaments..." />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load tournaments</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <TournamentSearch onSearch={handleSearch} gameOptions={gameOptions} />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-300">
          {searchLoading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Searching tournaments...
            </span>
          ) : (
            `${filteredTournaments.length} tournament${filteredTournaments.length !== 1 ? 's' : ''} found`
          )}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="h-4 w-4" />
          Updated in real-time
        </div>
      </div>

      {/* Tournament Grid - Virtualized for better performance with large lists */}
      {searchLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTournaments.length > 20 ? (
        <VirtualizedList
          items={filteredTournaments}
          itemHeight={200}
          containerHeight={800}
          className="space-y-4"
          renderItem={(tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          )}
        />
      ) : (
        <div className="grid gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

      {!searchLoading && filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or check back later for new tournaments.</p>
        </div>
      )}
    </div>
  );
};
