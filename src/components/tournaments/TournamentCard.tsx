
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, DollarSign, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (tournamentId: string) => void;
  onViewDetails: (tournamentId: string) => void;
  isRegistered?: boolean;
  loading?: boolean;
}

export const TournamentCard = ({ 
  tournament, 
  onRegister, 
  onViewDetails, 
  isRegistered = false,
  loading = false 
}: TournamentCardProps) => {
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

  const canRegister = tournament.status === 'registration_open' && !isRegistered;
  const registrationClosed = new Date(tournament.registration_deadline) < new Date();

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-xl mb-2">{tournament.title}</CardTitle>
            <Badge className={`${getStatusColor(tournament.status)} text-white capitalize`}>
              {tournament.status.replace('_', ' ')}
            </Badge>
            {isRegistered && (
              <Badge className="ml-2 bg-green-600 text-white">
                Registered
              </Badge>
            )}
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
        
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Registration closes: {formatDate(tournament.registration_deadline)}
          </span>
          {registrationClosed && (
            <Badge variant="destructive" className="ml-2">
              Closed
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center gap-4">
          <Button 
            variant="outline" 
            className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
            onClick={() => onViewDetails(tournament.id)}
          >
            View Details
          </Button>
          
          {canRegister && !registrationClosed && (
            <Button 
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              onClick={() => onRegister(tournament.id)}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
