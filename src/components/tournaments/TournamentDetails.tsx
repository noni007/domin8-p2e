
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Trophy, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { TournamentBracket } from "./TournamentBracket";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentDetailsProps {
  tournamentId: string;
  onBack: () => void;
}

export const TournamentDetails = ({ tournamentId, onBack }: TournamentDetailsProps) => {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchTournamentDetails();
    fetchParticipants();
    if (user) {
      checkRegistrationStatus();
    }
  }, [tournamentId, user]);

  const fetchTournamentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'registered');

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for tournaments.",
        variant: "destructive"
      });
      return;
    }

    if (!tournament) return;

    if (participants.length >= tournament.max_participants) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached its maximum capacity.",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Registered",
            description: "You are already registered for this tournament.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setIsRegistered(true);
      await fetchParticipants();
      
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this tournament.",
      });
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament.",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleBracketUpdate = () => {
    fetchTournamentDetails();
    fetchParticipants();
  };

  if (loading || !tournament) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const canRegister = tournament.status === 'registration_open' && 
                     !isRegistered && 
                     user && 
                     participants.length < tournament.max_participants &&
                     new Date(tournament.registration_deadline) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Button>
      </div>

      {/* Tournament Info */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-2xl mb-2">{tournament.title}</CardTitle>
              <div className="flex gap-2">
                <Badge className={`${getStatusColor(tournament.status)} text-white capitalize`}>
                  {tournament.status.replace('_', ' ')}
                </Badge>
                {isRegistered && (
                  <Badge className="bg-green-600 text-white">
                    Registered
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400 text-xl font-bold">
                <DollarSign className="h-6 w-6" />
                {tournament.prize_pool.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Prize Pool</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-6">{tournament.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-white font-semibold">{tournament.game}</div>
                <div className="text-gray-400 text-sm">Game</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-white font-semibold">
                  {participants.length}/{tournament.max_participants}
                </div>
                <div className="text-gray-400 text-sm">Participants</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-white font-semibold text-sm">
                  {formatDate(tournament.start_date)}
                </div>
                <div className="text-gray-400 text-sm">Start Date</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-white font-semibold text-sm">
                  {formatDate(tournament.registration_deadline)}
                </div>
                <div className="text-gray-400 text-sm">Registration Deadline</div>
              </div>
            </div>
          </div>

          {canRegister && (
            <Button 
              onClick={handleRegister}
              disabled={registering}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {registering ? "Registering..." : "Register for Tournament"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tournament Bracket */}
      <TournamentBracket
        tournament={tournament}
        participants={participants}
        bracketGenerated={tournament.bracket_generated}
        onBracketGenerated={handleBracketUpdate}
      />
    </div>
  );
};
