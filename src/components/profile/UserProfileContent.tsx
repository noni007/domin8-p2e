
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DetailedStatsCard } from "@/components/profile/DetailedStatsCard";
import { TournamentHistory } from "@/components/profile/TournamentHistory";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { Achievements } from "@/components/profile/Achievements";
import { RecentActivities } from "@/components/activity/RecentActivities";
import { RealTimeUpdates } from "@/components/notifications/RealTimeUpdates";
// Safe profile type returned by get_safe_profile RPC
interface SafeProfile {
  id: string;
  username: string | null;
  user_type: string;
  avatar_url: string | null;
  bio: string | null;
  skill_rating: number | null;
  win_rate: number | null;
  games_played: number | null;
  current_streak: number | null;
  best_streak: number | null;
  created_at: string;
  email: string | null;
}

// Tournament type that works with RPC results
interface TournamentBase {
  id: string;
  title: string;
  description: string;
  game: string;
  status: string;
  prize_pool: number;
  entry_fee: number | null;
  max_participants: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  tournament_type: string;
  bracket_generated: boolean;
  created_at: string;
}

interface EnhancedUserStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  averageRoundsReached: number;
  favoriteGame: string;
  recentPerformance: number;
  rank: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  averageMatchesPerDay: number;
  totalPlayTime: number;
  lastActiveDate: string;
}

interface UserProfileContentProps {
  userId: string;
  profile: SafeProfile;
  stats: EnhancedUserStats;
  tournaments: TournamentBase[];
  isOwnProfile: boolean;
}

export const UserProfileContent = ({ 
  userId, 
  profile, 
  stats, 
  tournaments, 
  isOwnProfile 
}: UserProfileContentProps) => {
  const navigate = useNavigate();

  const handleViewTournament = (tournamentId: string) => {
    navigate(`/tournaments?view=${tournamentId}`);
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Real-time Updates */}
        <RealTimeUpdates userId={userId} />

        {/* Profile Header */}
        <ProfileHeader 
          profile={profile}
          stats={stats}
          isOwnProfile={isOwnProfile}
          onEditProfile={isOwnProfile ? handleEditProfile : undefined}
        />

        {/* Detailed Stats Overview */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Detailed Statistics</h2>
          <DetailedStatsCard stats={stats} />
        </div>

        {/* Recent Activity Preview */}
        <RecentActivities 
          userId={userId}
          title={isOwnProfile ? "Your Recent Activity" : `${profile.username}'s Recent Activity`}
          maxItems={5}
          showViewAll={true}
        />

        {/* Detailed Information */}
        <Tabs defaultValue="tournaments" className="space-y-4">
          <TabsList className="bg-black/40 border-blue-800/30">
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
              Tournament History
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-blue-600">
              Match History
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments">
            <TournamentHistory 
              tournaments={tournaments}
              onViewTournament={handleViewTournament}
            />
          </TabsContent>

          <TabsContent value="matches">
            <MatchHistory userId={userId} />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};
