
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, DollarSign } from "lucide-react";
import { supabase, Tournament } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const TournamentList = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600';
      case 'registration_open': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/40 border-blue-800/30 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Active Tournaments</h2>
        <Badge className="bg-blue-600 text-white">
          {tournaments.length} Tournament{tournaments.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      {tournaments.length === 0 ? (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-gray-400">Be the first to create a tournament!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl mb-2">{tournament.title}</CardTitle>
                    <Badge className={`${getStatusColor(tournament.status)} text-white capitalize`}>
                      {tournament.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400 text-lg font-semibold">
                      <DollarSign className="h-5 w-5" />
                      {tournament.prize_pool.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{tournament.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Trophy className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{tournament.game}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Max {tournament.max_participants} players</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{formatDate(tournament.start_date)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Registration closes: {formatDate(tournament.registration_deadline)}
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
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
