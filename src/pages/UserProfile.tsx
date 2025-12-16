
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { UserProfileContent } from "@/components/profile/UserProfileContent";
import { useEnhancedUserStats } from "@/hooks/useEnhancedUserStats";

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

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, tournaments, loading: statsLoading } = useEnhancedUserStats(userId);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Use secure RPC function to fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_safe_profile', { target_user_id: userId });

      if (profileError) throw profileError;
      // RPC returns an array, get the first item
      setProfile(profileData?.[0] || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-4">The requested profile could not be found.</p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <UserProfileContent
        userId={userId!}
        profile={profile}
        stats={stats}
        tournaments={tournaments}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
};


