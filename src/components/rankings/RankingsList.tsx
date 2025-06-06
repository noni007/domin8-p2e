
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Player {
  id: string;
  rank: number;
  username: string;
  country: string;
  tier: string;
  aerPoints: number;
  winRate: number;
  gamesPlayed: number;
  change: number;
  avatar?: string;
  primaryGame: string;
}

interface RankingsListProps {
  gameFilter: string;
  searchQuery: string;
}

// Mock data for rankings
const mockRankings: Player[] = [
  {
    id: "1",
    rank: 1,
    username: "AfroPro_ZA",
    country: "South Africa",
    tier: "Master",
    aerPoints: 2847,
    winRate: 87.5,
    gamesPlayed: 156,
    change: 2,
    primaryGame: "valorant"
  },
  {
    id: "2",
    rank: 2,
    username: "EagleEye_NG",
    country: "Nigeria",
    tier: "Master",
    aerPoints: 2756,
    winRate: 84.2,
    gamesPlayed: 143,
    change: -1,
    primaryGame: "csgo"
  },
  {
    id: "3",
    rank: 3,
    username: "SavannaKing_KE",
    country: "Kenya",
    tier: "Diamond",
    aerPoints: 2634,
    winRate: 82.1,
    gamesPlayed: 134,
    change: 1,
    primaryGame: "valorant"
  },
  {
    id: "4",
    rank: 4,
    username: "DesertStorm_EG",
    country: "Egypt",
    tier: "Diamond",
    aerPoints: 2521,
    winRate: 79.8,
    gamesPlayed: 127,
    change: 0,
    primaryGame: "fifa"
  },
  {
    id: "5",
    rank: 5,
    username: "LionHeart_GH",
    country: "Ghana",
    tier: "Diamond",
    aerPoints: 2487,
    winRate: 78.9,
    gamesPlayed: 125,
    change: 3,
    primaryGame: "lol"
  }
];

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'master': return 'bg-gradient-to-r from-purple-600 to-pink-600';
    case 'diamond': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
    case 'platinum': return 'bg-gradient-to-r from-teal-400 to-green-400';
    case 'gold': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500';
    case 'bronze': return 'bg-gradient-to-r from-orange-600 to-red-600';
    default: return 'bg-gray-600';
  }
};

const getChangeIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

const getCountryFlag = (country: string) => {
  const countryFlags: { [key: string]: string } = {
    "South Africa": "🇿🇦",
    "Nigeria": "🇳🇬",
    "Kenya": "🇰🇪",
    "Egypt": "🇪🇬",
    "Ghana": "🇬🇭"
  };
  return countryFlags[country] || "🌍";
};

export const RankingsList = ({ gameFilter, searchQuery }: RankingsListProps) => {
  const filteredRankings = mockRankings.filter(player => {
    const matchesGame = gameFilter === 'all' || player.primaryGame === gameFilter;
    const matchesSearch = searchQuery === '' || 
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGame && matchesSearch;
  });

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-blue-800/30">
              <TableHead className="text-gray-300">Rank</TableHead>
              <TableHead className="text-gray-300">Player</TableHead>
              <TableHead className="text-gray-300">Tier</TableHead>
              <TableHead className="text-gray-300">AER Points</TableHead>
              <TableHead className="text-gray-300">Win Rate</TableHead>
              <TableHead className="text-gray-300">Games</TableHead>
              <TableHead className="text-gray-300">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRankings.map((player) => (
              <TableRow key={player.id} className="border-blue-800/30 hover:bg-blue-900/20">
                <TableCell className="font-semibold text-white">
                  #{player.rank}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatar} alt={player.username} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {player.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-medium">{player.username}</div>
                      <div className="text-gray-400 text-sm flex items-center gap-1">
                        <span>{getCountryFlag(player.country)}</span>
                        {player.country}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getTierColor(player.tier)} text-white`}>
                    {player.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-white font-semibold">
                  {player.aerPoints.toLocaleString()}
                </TableCell>
                <TableCell className="text-white">
                  {player.winRate}%
                </TableCell>
                <TableCell className="text-gray-300">
                  {player.gamesPlayed}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(player.change)}
                    <span className={`text-sm ${
                      player.change > 0 ? 'text-green-400' : 
                      player.change < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {player.change > 0 ? `+${player.change}` : player.change}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
