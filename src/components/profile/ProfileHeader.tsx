
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, TrendingUp, Settings } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface UserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  rank: number;
}

interface ProfileHeaderProps {
  profile: Profile;
  stats: UserStats | null;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader = ({ profile, stats, isOwnProfile, onEditProfile }: ProfileHeaderProps) => {
  const getTierBadge = (winRate: number) => {
    if (winRate >= 80) return { name: 'Master', color: 'bg-purple-600' };
    if (winRate >= 70) return { name: 'Diamond', color: 'bg-blue-600' };
    if (winRate >= 60) return { name: 'Platinum', color: 'bg-green-600' };
    if (winRate >= 50) return { name: 'Gold', color: 'bg-yellow-600' };
    if (winRate >= 40) return { name: 'Silver', color: 'bg-gray-500' };
    return { name: 'Bronze', color: 'bg-orange-600' };
  };

  const tier = stats ? getTierBadge(stats.winRate) : { name: 'Unranked', color: 'bg-gray-600' };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.username || 'Anonymous Player'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`${tier.color} text-white`}>
                <Trophy className="h-4 w-4 mr-1" />
                {tier.name}
              </Badge>
              {stats && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Rank #{stats.rank}
                </Badge>
              )}
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </Badge>
            </div>
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}
            {isOwnProfile && onEditProfile && (
              <Button 
                onClick={onEditProfile}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
