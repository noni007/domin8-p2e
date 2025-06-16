
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trophy, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const TournamentForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game: "",
    prize_pool: "",
    entry_fee: "",
    max_participants: "",
    tournament_type: "individual",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    registration_deadline: undefined as Date | undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .insert({
          title: formData.title,
          description: formData.description,
          game: formData.game,
          prize_pool: parseInt(formData.prize_pool) * 100, // Convert to cents
          entry_fee: parseInt(formData.entry_fee || "0") * 100, // Convert to cents
          max_participants: parseInt(formData.max_participants),
          tournament_type: formData.tournament_type as any,
          start_date: formData.start_date?.toISOString(),
          end_date: formData.end_date?.toISOString(),
          registration_deadline: formData.registration_deadline?.toISOString(),
          organizer_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        game: "",
        prize_pool: "",
        entry_fee: "",
        max_participants: "",
        tournament_type: "individual",
        start_date: undefined,
        end_date: undefined,
        registration_deadline: undefined,
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-blue-400" />
          Create Tournament
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Tournament Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-black/20 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="game" className="text-gray-300">Game</Label>
              <Select
                value={formData.game}
                onValueChange={(value) => setFormData({ ...formData, game: value })}
              >
                <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="valorant" className="text-white">Valorant</SelectItem>
                  <SelectItem value="csgo" className="text-white">CS:GO</SelectItem>
                  <SelectItem value="league-of-legends" className="text-white">League of Legends</SelectItem>
                  <SelectItem value="dota2" className="text-white">Dota 2</SelectItem>
                  <SelectItem value="fifa" className="text-white">FIFA</SelectItem>
                  <SelectItem value="rocket-league" className="text-white">Rocket League</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <div className="flex items-center gap-2 mb-2 col-span-full">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Monetization Settings</span>
            </div>
            <div>
              <Label htmlFor="entry_fee" className="text-gray-300">Entry Fee (USD)</Label>
              <Input
                id="entry_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.entry_fee}
                onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                className="bg-black/20 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank or 0 for free tournaments
              </p>
            </div>
            <div>
              <Label htmlFor="prize_pool" className="text-gray-300">Base Prize Pool (USD)</Label>
              <Input
                id="prize_pool"
                type="number"
                step="0.01"
                min="0"
                value={formData.prize_pool}
                onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                className="bg-black/20 border-gray-600 text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Entry fees will be added to this amount
              </p>
            </div>
          </div>

          {/* Tournament Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants" className="text-gray-300">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                min="2"
                max="128"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className="bg-black/20 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="tournament_type" className="text-gray-300">Tournament Type</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="individual" className="text-white">Individual</SelectItem>
                  <SelectItem value="team" className="text-white">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300">Registration Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-black/20 border-gray-600 text-white",
                      !formData.registration_deadline && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.registration_deadline ? format(formData.registration_deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.registration_deadline}
                    onSelect={(date) => setFormData({ ...formData, registration_deadline: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-gray-300">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-black/20 border-gray-600 text-white",
                      !formData.start_date && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-gray-300">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-black/20 border-gray-600 text-white",
                      !formData.end_date && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/20 border-gray-600 text-white"
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
