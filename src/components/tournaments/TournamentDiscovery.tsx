
import { useState, useEffect } from "react";
import { TournamentList } from "./TournamentList";
import { TournamentSearch, SearchFilters } from "./TournamentSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TournamentStats {
  activeTournaments: number;
  totalPlayers: number;
  totalPrizePool: number;
  weeklyEvents: number;
}

export const TournamentDiscovery = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    game: "",
    status: "",
    prizeRange: "",
    sortBy: "start_date"
  });
  const [stats, setStats] = useState<TournamentStats>({
    activeTournaments: 0,
    totalPlayers: 0,
    totalPrizePool: 0,
    weeklyEvents: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const gameOptions = ['FIFA 24', 'Call of Duty', 'Fortnite', 'Valorant', 'League of Legends', 'Apex Legends'];

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Get active tournaments count
      const { count: activeTournaments } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['registration_open', 'upcoming', 'in_progress']);

      // Get total players (participants)
      const { count: totalPlayers } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'registered');

      // Get total prize pool
      const { data: prizeData } = await supabase
        .from('tournaments')
        .select('prize_pool');
      
      const totalPrizePool = prizeData?.reduce((sum, t) => sum + t.prize_pool, 0) || 0;

      // Get weekly events (tournaments starting this week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const { count: weeklyEvents } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', weekStart.toISOString())
        .lte('start_date', weekEnd.toISOString());

      setStats({
        activeTournaments: activeTournaments || 0,
        totalPlayers: totalPlayers || 0,
        totalPrizePool: totalPrizePool,
        weeklyEvents: weeklyEvents || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleGameClick = (game: string) => {
    const newFilters = { ...searchFilters, game: searchFilters.game === game ? "" : game };
    setSearchFilters(newFilters);
  };

  const formatPrize = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Active Tournaments</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8 bg-gray-700" />
                ) : (
                  <p className="text-lg font-semibold text-white">{stats.activeTournaments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Players</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-12 bg-gray-700" />
                ) : (
                  <p className="text-lg font-semibold text-white">{stats.totalPlayers.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Total Prize Pool</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-16 bg-gray-700" />
                ) : (
                  <p className="text-lg font-semibold text-white">{formatPrize(stats.totalPrizePool)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">This Week</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8 bg-gray-700" />
                ) : (
                  <p className="text-lg font-semibold text-white">{stats.weeklyEvents} Events</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Find Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <TournamentSearch
            onSearch={handleSearch}
            gameOptions={gameOptions}
          />
        </CardContent>
      </Card>

      {/* Popular Games */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Popular Games</h3>
        <div className="flex flex-wrap gap-2">
          {gameOptions.map((game) => (
            <Badge
              key={game}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                searchFilters.game === game
                  ? 'bg-blue-400 text-black border-blue-400'
                  : 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black'
              }`}
              onClick={() => handleGameClick(game)}
            >
              {game}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tournament List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Available Tournaments</h3>
          <Badge variant="outline" className="border-green-400 text-green-400">
            Live Updates
          </Badge>
        </div>
        <TournamentList filters={searchFilters} />
      </div>
    </div>
  );
};
