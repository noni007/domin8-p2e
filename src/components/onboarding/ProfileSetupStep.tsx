
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, User, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ProfileSetupStepProps {
  profileData: {
    username: string;
    favoriteGames: string[];
    experienceLevel: string;
    bio: string;
  };
  setProfileData: (data: any) => void;
  userEmail: string;
}

const popularGames = [
  'FIFA', 'Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 
  'Call of Duty', 'Apex Legends', 'Fortnite', 'Rocket League', 'Overwatch'
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to competitive gaming' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some tournament experience' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced competitor' },
  { id: 'professional', label: 'Professional', description: 'Pro-level player' }
];

export const ProfileSetupStep = ({ profileData, setProfileData, userEmail }: ProfileSetupStepProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleGameToggle = (game: string) => {
    const currentGames = profileData.favoriteGames;
    if (currentGames.includes(game)) {
      setProfileData({
        ...profileData,
        favoriteGames: currentGames.filter(g => g !== game)
      });
    } else if (currentGames.length < 5) {
      setProfileData({
        ...profileData,
        favoriteGames: [...currentGames, game]
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profileData.username.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profileData.username.trim(),
          email: userEmail,
          bio: profileData.bio || null,
          user_type: 'player',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Saved!",
        description: "Your gaming profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Let's Set Up Your Gaming Profile</h3>
        <p className="text-gray-400">This helps other players get to know you better</p>
      </div>

      <div className="space-y-6">
        {/* Username */}
        <Card className="bg-black/40 border-blue-800/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <User className="h-5 w-5" />
              <Label className="text-base font-medium">Choose Your Gaming Handle</Label>
            </div>
            <Input
              placeholder="Enter your username (e.g., ProGamer123)"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
              maxLength={20}
            />
            <p className="text-sm text-gray-400">
              This will be displayed on leaderboards and tournaments
            </p>
          </CardContent>
        </Card>

        {/* Favorite Games */}
        <Card className="bg-black/40 border-blue-800/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-green-400">
              <Gamepad2 className="h-5 w-5" />
              <Label className="text-base font-medium">Favorite Games (up to 5)</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {popularGames.map((game) => (
                <Button
                  key={game}
                  variant={profileData.favoriteGames.includes(game) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGameToggle(game)}
                  className={`justify-start ${
                    profileData.favoriteGames.includes(game)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  disabled={!profileData.favoriteGames.includes(game) && profileData.favoriteGames.length >= 5}
                >
                  {game}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Selected: {profileData.favoriteGames.length}/5 games
            </p>
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card className="bg-black/40 border-blue-800/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Star className="h-5 w-5" />
              <Label className="text-base font-medium">Experience Level</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <Button
                  key={level.id}
                  variant={profileData.experienceLevel === level.id ? "default" : "outline"}
                  className={`p-4 h-auto flex-col items-start ${
                    profileData.experienceLevel === level.id
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setProfileData({ ...profileData, experienceLevel: level.id })}
                >
                  <span className="font-medium">{level.label}</span>
                  <span className="text-xs opacity-80">{level.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="bg-black/40 border-blue-800/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-2 text-purple-400">
              <MessageSquare className="h-5 w-5" />
              <Label className="text-base font-medium">Tell Us About Yourself (Optional)</Label>
            </div>
            <Textarea
              placeholder="Share your gaming journey, favorite moments, or what drives you to compete..."
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-sm text-gray-400">
              {profileData.bio.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        {profileData.username && (
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </Button>
        )}
      </div>
    </div>
  );
};
