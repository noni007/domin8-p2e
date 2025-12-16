
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink } from "lucide-react";

// Flexible tournament type that works with both direct queries and RPC results
interface TournamentBase {
  id: string;
  title: string;
  description: string;
  game: string;
  status: string;
  prize_pool: number;
  entry_fee: number | null;
  max_participants: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  tournament_type: string;
  bracket_generated: boolean;
  created_at: string;
}

interface TournamentHistoryProps {
  tournaments: TournamentBase[];
  onViewTournament?: (tournamentId: string) => void;
}

export const TournamentHistory = ({ tournaments, onViewTournament }: TournamentHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'upcoming': return 'bg-blue-600';
      case 'registration_open': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Tournament History</CardTitle>
      </CardHeader>
      <CardContent>
        {tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-blue-600/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{tournament.title}</h3>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{tournament.game}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">
                    ${tournament.prize_pool.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  {onViewTournament && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                      onClick={() => onViewTournament(tournament.id)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No tournament history yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Join a tournament to start building your history!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
