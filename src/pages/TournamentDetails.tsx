
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TournamentRegistration } from "@/components/tournaments/TournamentRegistration";
import { TournamentBracket } from "@/components/tournaments/TournamentBracket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, DollarSign, ArrowLeft } from "lucide-react";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useSimpleToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTournamentDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', id);

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Check if current user is registered
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userRegistration = participantsData?.find(p => p.user_id === user.id);
        setIsRegistered(!!userRegistration);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails();
  }, [id]);

  const handleRegistrationChange = () => {
    fetchTournamentDetails(); // Refresh tournament data
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrize = (amount: number) => {
    return `₦${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h1>
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
          className="mb-6 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>

        {/* Tournament Header */}
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{tournament.title}</h1>
                  <Badge className="bg-blue-600 text-white">{tournament.game}</Badge>
                </div>
                <p className="text-gray-300 text-lg max-w-3xl">{tournament.description}</p>
              </div>
              {tournament.prize_pool > 0 && (
                <div className="text-center lg:text-right">
                  <div className="text-yellow-400 text-3xl font-bold">
                    {formatPrize(tournament.prize_pool)}
                  </div>
                  <div className="text-gray-400">Total Prize Pool</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-gray-400 text-sm">Start Date</div>
                  <div className="text-white font-semibold">{formatDate(tournament.start_date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-gray-400 text-sm">Participants</div>
                  <div className="text-white font-semibold">{participants.length}/{tournament.max_participants}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-gray-400 text-sm">Tournament Type</div>
                  <div className="text-white font-semibold capitalize">{tournament.tournament_type}</div>
                </div>
              </div>
              {tournament.entry_fee > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Entry Fee</div>
                    <div className="text-white font-semibold">{formatPrize(tournament.entry_fee)}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tournament Bracket */}
          <div className="lg:col-span-2">
            <TournamentBracket
              tournament={tournament}
              participants={participants}
              bracketGenerated={tournament.bracket_generated}
              onBracketGenerated={handleRegistrationChange}
            />
          </div>

          {/* Registration Panel */}
          <div>
            <TournamentRegistration
              tournament={tournament}
              participants={participants}
              isRegistered={isRegistered}
              onRegistrationChange={handleRegistrationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
