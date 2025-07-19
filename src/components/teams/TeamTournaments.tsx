import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Trophy, Plus, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;

interface TeamTournamentsProps {
  teamId: string;
  canCreateTournaments: boolean;
}

export const TeamTournaments = ({ teamId, canCreateTournaments }: TeamTournamentsProps) => {
  const { toast } = useSimpleToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState<any>(null);

  useEffect(() => {
    fetchTeamTournaments();
    fetchTeamInfo();
  }, [teamId]);

  const fetchTeamInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('name, tag')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      setTeamInfo(data);
    } catch (error) {
      console.error('Error fetching team info:', error);
    }
  };

  const fetchTeamTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching team tournaments:', error);
      toast({ title: "Error", description: "Failed to load team tournaments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createTeamTournament = async () => {
    if (!teamInfo) return;

    try {
      const newTournament = {
        title: `${teamInfo.name} Team Tournament`,
        description: `Exclusive tournament for ${teamInfo.name} [${teamInfo.tag}] team members`,
        game: 'Team Event',
        tournament_type: 'team',
        team_id: teamId,
        max_participants: 16,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        entry_fee: 0,
        prize_pool: 0,
        status: 'upcoming',
        organizer_id: teamId // Using team ID as organizer for team tournaments
      };

      const { error } = await supabase
        .from('tournaments')
        .insert(newTournament);

      if (error) throw error;

      toast({ title: "Success", description: "Team tournament created successfully!" });
      fetchTeamTournaments();
    } catch (error) {
      console.error('Error creating team tournament:', error);
      toast({ title: "Error", description: "Failed to create team tournament.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Team Tournaments</h2>
          <Badge className="bg-blue-600 text-white">
            {tournaments.length} Tournament{tournaments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {canCreateTournaments && (
          <Button 
            onClick={createTeamTournament}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team Tournament
          </Button>
        )}
      </div>

      {/* Tournament Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Total Tournaments</p>
                <p className="text-2xl font-bold text-white">{tournaments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Active Tournaments</p>
                <p className="text-2xl font-bold text-white">
                  {tournaments.filter(t => t.status === 'in_progress' || t.status === 'registration_open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {tournaments.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments List */}
      {tournaments.length === 0 ? (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Team Tournaments Yet</h3>
            <p className="text-gray-400 mb-4">Create your first team tournament to get started!</p>
            {canCreateTournaments && (
              <Button 
                onClick={createTeamTournament}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team Tournament
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              participantCount={0}
              isRegistered={false}
              onRegistrationChange={() => fetchTeamTournaments()}
            />
          ))}
        </div>
      )}
    </div>
  );
};