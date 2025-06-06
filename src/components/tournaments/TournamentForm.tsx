
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const TournamentForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game: "",
    prize_pool: "",
    max_participants: "",
    start_date: "",
    end_date: "",
    registration_deadline: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a tournament.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('tournaments')
        .insert([{
          title: formData.title,
          description: formData.description,
          game: formData.game,
          prize_pool: parseFloat(formData.prize_pool),
          max_participants: parseInt(formData.max_participants),
          start_date: formData.start_date,
          end_date: formData.end_date,
          registration_deadline: formData.registration_deadline,
          organizer_id: user.id,
          status: 'upcoming'
        }]);

      if (error) throw error;

      toast({
        title: "Tournament Created!",
        description: "Your tournament has been successfully created.",
      });

      setFormData({
        title: "",
        description: "",
        game: "",
        prize_pool: "",
        max_participants: "",
        start_date: "",
        end_date: "",
        registration_deadline: ""
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Create New Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Tournament Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter tournament title"
              required
              className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your tournament"
              className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="game" className="text-gray-300">Game</Label>
              <Input
                id="game"
                name="game"
                value={formData.game}
                onChange={handleChange}
                placeholder="e.g. FIFA 24, CS2"
                required
                className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="prize_pool" className="text-gray-300">Prize Pool ($)</Label>
              <Input
                id="prize_pool"
                name="prize_pool"
                type="number"
                value={formData.prize_pool}
                onChange={handleChange}
                placeholder="0"
                required
                className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="max_participants" className="text-gray-300">Max Participants</Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={handleChange}
              placeholder="32"
              required
              className="bg-black/20 border-blue-800/50 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="registration_deadline" className="text-gray-300">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                name="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={handleChange}
                required
                className="bg-black/20 border-blue-800/50 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="start_date" className="text-gray-300">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="bg-black/20 border-blue-800/50 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="end_date" className="text-gray-300">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="bg-black/20 border-blue-800/50 text-white"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Tournament"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
