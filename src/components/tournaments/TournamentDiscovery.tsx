
import { useState } from "react";
import { TournamentList } from "./TournamentList";
import { TournamentSearch, SearchFilters } from "./TournamentSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign } from "lucide-react";

export const TournamentDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const gameOptions = ['FIFA 24', 'Call of Duty', 'Fortnite', 'Valorant', 'League of Legends', 'Apex Legends'];

  const handleSearch = (filters: SearchFilters) => {
    // TODO: Implement search functionality
    console.log('Search filters:', filters);
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
                <p className="text-lg font-semibold text-white">12</p>
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
                <p className="text-lg font-semibold text-white">1,247</p>
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
                <p className="text-lg font-semibold text-white">₦450,000</p>
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
                <p className="text-lg font-semibold text-white">8 Events</p>
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
          {['FIFA 24', 'Call of Duty', 'Fortnite', 'Valorant', 'League of Legends', 'Apex Legends'].map((game) => (
            <Badge
              key={game}
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black cursor-pointer transition-colors"
              onClick={() => setSelectedGame(game)}
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
        <TournamentList />
      </div>
    </div>
  );
};
