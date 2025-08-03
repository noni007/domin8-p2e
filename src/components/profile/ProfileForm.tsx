
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface ProfileFormProps {
  profile: Profile | null;
  user: any;
  editing: boolean;
  onProfileUpdated: () => void;
}

export const ProfileForm = ({ profile, user, editing, onProfileUpdated }: ProfileFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: profile?.username || "",
    bio: profile?.bio || "",
    user_type: profile?.user_type || "player"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      onProfileUpdated();
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">
          {editing ? 'Edit Profile' : 'Profile Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="user_type" className="text-gray-300">User Type</Label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="w-full bg-black/20 border border-blue-800/50 text-white rounded-md px-3 py-2"
              >
                <option value="player">Player</option>
                <option value="creator">Creator</option>
                <option value="organizer">Organizer</option>
                <option value="brand">Brand</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="bio" className="text-gray-300">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                Click "Edit Profile" to update your information or "View Public Profile" to see how others see your profile.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
