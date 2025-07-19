import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMembers } from "./TeamMembers";
import { TeamChat } from "./TeamChat";
import { TeamTournaments } from "./TeamTournaments";
import { Users, Trophy, MessageSquare, Settings, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleToast } from "@/hooks/useSimpleToast";

interface TeamManagementProps {
  teamId: string;
  teamName: string;
  onBack: () => void;
}

export const TeamManagement = ({ teamId, teamName, onBack }: TeamManagementProps) => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [activeTab, setActiveTab] = useState("members");
  const [userRole, setUserRole] = useState<string | null>(null);

  React.useEffect(() => {
    fetchUserRole();
  }, [teamId]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || userRole === 'owner') {
      toast({ 
        title: "Cannot Leave Team", 
        description: "Team owners cannot leave. Transfer ownership first.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Left Team", description: "You have left the team successfully." });
      onBack();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({ title: "Error", description: "Failed to leave team.", variant: "destructive" });
    }
  };

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{teamName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-600 text-white">
                {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        {userRole && userRole !== 'owner' && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLeaveTeam}
          >
            Leave Team
          </Button>
        )}
      </div>

      {/* Team Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border-blue-800/30">
          <TabsTrigger 
            value="members"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger 
            value="chat"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Chat
          </TabsTrigger>
          <TabsTrigger 
            value="tournaments"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Tournaments
          </TabsTrigger>
          {isOwnerOrAdmin && (
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <TeamMembers teamId={teamId} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <TeamChat teamId={teamId} />
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6">
          <TeamTournaments teamId={teamId} canCreateTournaments={isOwnerOrAdmin} />
        </TabsContent>

        {isOwnerOrAdmin && (
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Team Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-400">Team settings and administration tools coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};