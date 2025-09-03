import React from 'react';
// Fallback implementation without react-window for now
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Award } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerRanking {
  profile: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
  stats: {
    tournamentsWon: number;
    matchesWon: number;
    matchesPlayed: number;
    winRate: number;
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  };
  rank: number;
}

interface VirtualizedLeaderboardProps {
  rankings: PlayerRanking[];
  selectedCategory: 'overall' | 'tournaments' | 'winrate';
  height?: number;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    rankings: PlayerRanking[];
    selectedCategory: string;
    isMobile: boolean;
  };
}

const ListItem = ({ index, style, data }: ListItemProps) => {
  const { rankings, selectedCategory, isMobile } = data;
  const player = rankings[index];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-500" />;
    return null;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Master': return 'bg-purple-600';
      case 'Diamond': return 'bg-blue-600';
      case 'Platinum': return 'bg-green-600';
      case 'Gold': return 'bg-yellow-600';
      case 'Silver': return 'bg-gray-500';
      default: return 'bg-orange-600';
    }
  };

  return (
    <div className="p-2">
      <div 
        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
          player.rank <= 3 
            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30' 
            : 'bg-muted/50 hover:bg-muted/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-[50px]">
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
              #{player.rank}
            </span>
            {getRankIcon(player.rank)}
          </div>
          
          <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'}`}>
            <AvatarImage src={player.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {player.profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate text-sm">
              {player.profile.username || 'Anonymous Player'}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getTierColor(player.stats.tier)} text-white text-xs`}>
                {player.stats.tier}
              </Badge>
              {!isMobile && (
                <span className="text-muted-foreground text-xs">
                  {player.stats.matchesPlayed} matches
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-bold text-sm">
            {selectedCategory === 'overall' && `${player.stats.points} pts`}
            {selectedCategory === 'tournaments' && `${player.stats.tournamentsWon} wins`}
            {selectedCategory === 'winrate' && (
              player.stats.matchesPlayed >= 5 
                ? `${player.stats.winRate.toFixed(1)}%`
                : 'N/A'
            )}
          </div>
          {!isMobile && (
            <div className="text-muted-foreground text-xs">
              {selectedCategory === 'overall' && `${player.stats.tournamentsWon} tournaments`}
              {selectedCategory === 'tournaments' && `${player.stats.winRate.toFixed(1)}% WR`}
              {selectedCategory === 'winrate' && `${player.stats.matchesWon}/${player.stats.matchesPlayed}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const VirtualizedLeaderboard = ({ 
  rankings, 
  selectedCategory, 
  height = 600 
}: VirtualizedLeaderboardProps) => {
  const isMobile = useIsMobile();
  
  // Use pagination for performance instead of virtualization for now
  const [visibleCount, setVisibleCount] = React.useState(isMobile ? 20 : 50);
  const visibleRankings = React.useMemo(() => 
    rankings.slice(0, visibleCount), 
    [rankings, visibleCount]
  );

  const itemData = React.useMemo(() => ({
    rankings: visibleRankings,
    selectedCategory,
    isMobile
  }), [visibleRankings, selectedCategory, isMobile]);

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No rankings available yet.</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + (isMobile ? 20 : 50), rankings.length));
  };

  return (
    <div className="w-full space-y-2">
      {visibleRankings.map((_, index) => (
        <ListItem
          key={visibleRankings[index].profile.id}
          index={index}
          style={{}}
          data={itemData}
        />
      ))}
      
      {visibleCount < rankings.length && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity text-sm"
          >
            Load More ({rankings.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};