
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Shield, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import { TeamDetails } from "./TeamDetails";

type Team = Tables<'teams'> & {
  team_members: { count: number }[];
  is_member: boolean;
  user_role?: string;
};

interface TeamsListProps {
  onTeamSelect?: (teamId: string, teamName: string) => void;
}

export const TeamsList = ({ onTeamSelect }: TeamsListProps) => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          team_members!inner(count)
        `);

      if (user) {
        // Get teams with member info for authenticated users
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select(`
            *,
            team_members(count, user_id, role)
          `);

        if (teamsError) throw teamsError;

        const teamsWithMemberInfo = teamsData?.map(team => ({
          ...team,
          team_members: [{ count: team.team_members?.length || 0 }],
          is_member: team.team_members?.some(member => member.user_id === user.id) || false,
          user_role: team.team_members?.find(member => member.user_id === user.id)?.role
        })) || [];

        setTeams(teamsWithMemberInfo);
      } else {
        // Public teams only for non-authenticated users
        const { data, error } = await query.eq('is_public', true);
        if (error) throw error;
        
        const publicTeams = data?.map(team => ({
          ...team,
          is_member: false
        })) || [];
        
        setTeams(publicTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({ title: "Error", description: "Failed to load teams.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to join a team.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({ title: "Success", description: "Successfully joined the team!" });

      fetchTeams();
    } catch (error) {
      console.error('Error joining team:', error);
      toast({ title: "Error", description: "Failed to join team.", variant: "destructive" });
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  if (selectedTeam) {
    return (
      <TeamDetails 
        teamId={selectedTeam} 
        onBack={() => setSelectedTeam(null)}
        onTeamUpdate={fetchTeams}
      />
    );
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading teams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Active Teams</h2>
        <Badge className="bg-blue-600 text-white">
          {teams.length} Team{teams.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      {teams.length === 0 ? (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Teams Yet</h3>
            <p className="text-gray-400">Be the first to create a team!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {team.avatar_url ? (
                      <img src={team.avatar_url} alt={team.name} className="h-12 w-12 rounded-lg" />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-sm text-blue-400">[{team.tag}]</p>
                    </div>
                  </div>
                  {team.is_member && (
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(team.user_role)}
                      <span className="text-xs text-gray-400 capitalize">{team.user_role}</span>
                    </div>
                  )}
                </div>

                {team.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{team.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {team.team_members[0]?.count || 0}/{team.max_members}
                      </span>
                    </div>
                    {!team.is_public && (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTeamSelect ? onTeamSelect(team.id, team.name) : setSelectedTeam(team.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {!team.is_member && team.is_public && user && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinTeam(team.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Join
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
