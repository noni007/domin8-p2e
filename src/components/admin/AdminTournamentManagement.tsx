
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";

export const AdminTournamentManagement = () => {
  const { tournaments, loading } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading tournaments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Tournament Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No tournaments found</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div key={tournament.id} className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{tournament.title}</h3>
                  <Badge className={`${
                    tournament.status === 'live' ? 'bg-green-600' :
                    tournament.status === 'upcoming' ? 'bg-blue-600' :
                    'bg-gray-600'
                  } text-white`}>
                    {tournament.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Users className="h-4 w-4 mr-1" />
                    {tournament.max_participants} max
                  </div>
                  <div className="flex items-center text-gray-300">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${(tournament.prize_pool / 100).toFixed(2)}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-blue-400 text-blue-400">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-400">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
