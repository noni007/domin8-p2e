
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleToast } from "@/hooks/useSimpleToast";

interface TeamFormProps {
  onSuccess: () => void;
}

export const TeamForm = ({ onSuccess }: TeamFormProps) => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    maxMembers: 10,
    isPublic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          tag: formData.tag,
          description: formData.description || null,
          max_members: formData.maxMembers,
          is_public: formData.isPublic,
          created_by: user.id
        });

      if (error) throw error;

      toast({ title: "Success", description: "Team created successfully!" });

      onSuccess();
      setFormData({
        name: '',
        tag: '',
        description: '',
        maxMembers: 10,
        isPublic: true
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({ title: "Error", description: "Failed to create team.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Create New Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                required
                className="bg-black/20 border-blue-800/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-white">Team Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                placeholder="TAG"
                maxLength={6}
                required
                className="bg-black/20 border-blue-800/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your team's goals and playstyle..."
              className="bg-black/20 border-blue-800/30 text-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="text-white">Max Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                min={2}
                max={50}
                className="bg-black/20 border-blue-800/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isPublic" className="text-white">Team Visibility</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic" className="text-gray-300">
                  {formData.isPublic ? 'Public' : 'Private'}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
