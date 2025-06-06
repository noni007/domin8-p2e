
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { User, Settings, Trophy, Calendar } from "lucide-react";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
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
        .upsert({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await refreshProfile();
      setEditing(false);
      
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-1">
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
              <CardContent>
                <p className="text-gray-300 text-center mb-4">
                  {profile?.bio || "No bio added yet."}
                </p>
                <Button 
                  onClick={() => setEditing(!editing)}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form / Dashboard */}
          <div className="md:col-span-2">
            {editing ? (
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-2xl font-bold text-white">0</h3>
                      <p className="text-gray-400">Tournaments Won</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-2xl font-bold text-white">0</h3>
                      <p className="text-gray-400">Tournaments Joined</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No recent activity</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Join a tournament to see your activity here!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
