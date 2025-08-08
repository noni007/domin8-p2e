
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";
import { ProfileNavigation } from "@/components/profile/ProfileNavigation";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileForm } from "@/components/profile/ProfileForm";

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const handleViewPublicProfile = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  const handleEditProfile = () => {
    setEditing(!editing);
  };

  const handleProfileUpdated = async () => {
    await refreshProfile();
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Please Sign In</h3>
            <p className="text-gray-400">You need to be signed in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProfileCard
              profile={profile}
              user={user}
              onEditProfile={handleEditProfile}
              onViewPublicProfile={handleViewPublicProfile}
              editing={editing}
            />
          </div>

          <div className="lg:col-span-2">
            <ProfileForm
              profile={profile}
              user={user}
              editing={editing}
              onProfileUpdated={handleProfileUpdated}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
export { ProfilePage as Profile };

