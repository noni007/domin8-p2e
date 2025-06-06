
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RankingsList } from "@/components/rankings/RankingsList";
import { TierDistribution } from "@/components/rankings/TierDistribution";
import { Search, Filter } from "lucide-react";

const Rankings = () => {
  const [gameFilter, setGameFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
              <Button 
                variant="outline" 
                className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black"
                onClick={() => window.location.href = '/tournaments'}
              >
                Tournaments
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
            AER Rankings
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Africa Esports Ranking - The official competitive gaming leaderboard across Africa. 
            Track your progress through Bronze, Silver, Gold, Platinum, Diamond, and Master tiers.
          </p>
          
          <div className="flex justify-center mb-8">
            <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-lg px-6 py-2">
              Season 1 - 2024
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-blue-800/30 text-white placeholder-gray-400"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="md:w-[200px] bg-black/40 border-blue-800/30 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-blue-800/30 text-white">
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="valorant">Valorant</SelectItem>
              <SelectItem value="csgo">CS:GO</SelectItem>
              <SelectItem value="fifa">FIFA</SelectItem>
              <SelectItem value="lol">League of Legends</SelectItem>
              <SelectItem value="apex">Apex Legends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tier Distribution */}
        <div className="mb-12">
          <TierDistribution />
        </div>

        {/* Rankings List */}
        <RankingsList gameFilter={gameFilter} searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Rankings;
