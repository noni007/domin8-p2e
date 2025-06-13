
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Tournament = Tables<'tournaments'>;

interface TeamTournamentsProps {
  teamId: string;
  userRole: string | null;
}

export const TeamTournaments = ({ teamId, userRole }: TeamTournamentsProps) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamTournaments();
  }, [teamId]);

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
      toast({
        title: "Error",
        description: "Failed to load team tournaments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canCreateTournaments = userRole && ['owner', 'admin'].includes(userRole);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-600';
      case 'active':
        return 'bg-green-600';
      case 'completed':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading tournaments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Team Tournaments</h3>
        {canCreateTournaments && (
          <Button
            onClick={() => window.location.href = '/tournaments'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>

      {/* Tournaments List */}
      {tournaments.length === 0 ? (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Team Tournaments</h3>
            <p className="text-gray-400 mb-4">
              {canCreateTournaments 
                ? "Create your first team tournament to get started!"
                : "Your team hasn't organized any tournaments yet."
              }
            </p>
            {canCreateTournaments && (
              <Button
                onClick={() => window.location.href = '/tournaments'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">{tournament.title}</h4>
                    <p className="text-gray-300 text-sm mb-3">{tournament.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{tournament.game}</Badge>
                      <Badge variant="outline">{tournament.tournament_type}</Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(tournament.start_date), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Max {tournament.max_participants} players</span>
                      </div>
                      {tournament.prize_pool > 0 && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span>${tournament.prize_pool}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/tournaments'}
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
