
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Settings, ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface ProfileCardProps {
  profile: Profile | null;
  user: any;
  onEditProfile: () => void;
  onViewPublicProfile: () => void;
  editing: boolean;
}

export const ProfileCard = ({ 
  profile, 
  user, 
  onEditProfile, 
  onViewPublicProfile, 
  editing 
}: ProfileCardProps) => {
  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="h-12 w-12 text-white" />
        </div>
        <CardTitle className="text-white">{profile?.username || user.email}</CardTitle>
        <Badge className={`mx-auto ${
          profile?.user_type === 'player' ? 'bg-blue-600' :
          profile?.user_type === 'creator' ? 'bg-purple-600' :
          profile?.user_type === 'organizer' ? 'bg-green-600' :
          'bg-orange-600'
        } text-white capitalize`}>
          {profile?.user_type || 'Player'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-300 text-center mb-4">
          {profile?.bio || "No bio added yet."}
        </p>
        <Button 
          onClick={onEditProfile}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          <Settings className="h-4 w-4 mr-2" />
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
        <Button 
          onClick={onViewPublicProfile}
          variant="outline"
          className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Public Profile
        </Button>
      </CardContent>
    </Card>
  );
};
