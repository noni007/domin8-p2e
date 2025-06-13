
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Crown, Shield, MessageSquare, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TeamMembers } from "./TeamMembers";
import { TeamChat } from "./TeamChat";
import { TeamTournaments } from "./TeamTournaments";

type Team = Tables<'teams'>;

interface TeamDetailsProps {
  teamId: string;
  onBack: () => void;
  onTeamUpdate: () => void;
}

export const TeamDetails = ({ teamId, onBack, onTeamUpdate }: TeamDetailsProps) => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId, user]);

  const fetchTeamDetails = async () => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      if (user) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .single();

        setUserRole(memberData?.role || null);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      toast({
        title: "Error",
        description: "Failed to load team details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !userRole) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully left the team.",
      });

      onTeamUpdate();
      onBack();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: "Error",
        description: "Failed to leave team.",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading team details...</div>;
  }

  if (!team) {
    return <div className="text-center text-gray-400">Team not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>

        {userRole && userRole !== 'owner' && (
          <Button
            variant="destructive"
            onClick={handleLeaveTeam}
          >
            Leave Team
          </Button>
        )}
      </div>

      {/* Team Info */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {team.avatar_url ? (
                <img src={team.avatar_url} alt={team.name} className="h-16 w-16 rounded-lg" />
              ) : (
                <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>{team.name}</span>
                  <Badge variant="outline">[{team.tag}]</Badge>
                </CardTitle>
                {team.description && (
                  <p className="text-gray-300 mt-2">{team.description}</p>
                )}
              </div>
            </div>
            {userRole && (
              <div className="flex items-center space-x-2">
                {getRoleIcon(userRole)}
                <span className="text-gray-300 capitalize">{userRole}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-black/40 border-blue-800/30">
          <TabsTrigger value="members" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          {userRole && (
            <>
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Team Chat
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
                <Trophy className="h-4 w-4 mr-2" />
                Tournaments
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="members">
          <TeamMembers teamId={teamId} />
        </TabsContent>

        {userRole && (
          <>
            <TabsContent value="chat">
              <TeamChat teamId={teamId} />
            </TabsContent>
            <TabsContent value="tournaments">
              <TeamTournaments teamId={teamId} userRole={userRole} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};
