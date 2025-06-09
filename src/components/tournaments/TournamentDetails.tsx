
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, DollarSign, Clock, ArrowLeft, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TournamentBracket } from "./TournamentBracket";

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
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

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
      console.error('Error fetching tournament details:', error);
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
        .eq('tournament_id', tournamentId);

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
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      setIsRegistered(!!data);
    } catch (error) {
      // No registration found, which is fine
    }
  };

  const handleRegister = async () => {
    if (!user || !tournament) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for tournaments.",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: tournamentId,
          user_id: user.id,
          registration_date: new Date().toISOString(),
          status: 'registered'
        }]);

      if (error) throw error;

      setIsRegistered(true);
      fetchParticipants();
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this tournament.",
      });
    } catch (error) {
      console.error('Error registering for tournament:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleBracketGenerated = () => {
    fetchTournamentDetails(); // Refresh tournament data
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm animate-pulse">
          <CardContent className="p-8">
            <div className="h-8 bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Tournament Not Found</h3>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canRegister = tournament.status === 'registration_open' && !isRegistered;
  const registrationClosed = new Date(tournament.registration_deadline) < new Date();
  const spotsRemaining = tournament.max_participants - participants.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white">{tournament.title}</h1>
      </div>

      {/* Tournament Overview */}
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
                    <UserCheck className="h-3 w-3 mr-1" />
                    Registered
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400 text-2xl font-bold">
                <DollarSign className="h-6 w-6" />
                {tournament.prize_pool.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">Prize Pool</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-lg mb-6">{tournament.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-semibold">{tournament.game}</p>
              <p className="text-gray-400 text-sm">Game</p>
            </div>
            
            <div className="text-center">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold">{participants.length}/{tournament.max_participants}</p>
              <p className="text-gray-400 text-sm">Participants</p>
            </div>
            
            <div className="text-center">
              <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold">{formatDate(tournament.start_date).split(',')[0]}</p>
              <p className="text-gray-400 text-sm">Start Date</p>
            </div>
            
            <div className="text-center">
              <Clock className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-white font-semibold">{formatDate(tournament.registration_deadline).split(',')[0]}</p>
              <p className="text-gray-400 text-sm">Registration Deadline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details/Bracket */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-black/40 border-blue-800/30">
          <TabsTrigger value="details" className="data-[state=active]:bg-blue-600">
            Tournament Details
          </TabsTrigger>
          <TabsTrigger value="bracket" className="data-[state=active]:bg-blue-600">
            Bracket & Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule */}
            <div className="lg:col-span-2">
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Tournament Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Registration Deadline:</span>
                      <span className="text-white">{formatDate(tournament.registration_deadline)}</span>
                    </div>
                    <Separator className="bg-gray-600" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tournament Start:</span>
                      <span className="text-white">{formatDate(tournament.start_date)}</span>
                    </div>
                    <Separator className="bg-gray-600" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tournament End:</span>
                      <span className="text-white">{formatDate(tournament.end_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Registration & Participants */}
            <div className="space-y-6">
              {/* Registration */}
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  {canRegister && !registrationClosed && spotsRemaining > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-green-400 font-semibold">Registration Open</p>
                        <p className="text-gray-400 text-sm">{spotsRemaining} spots remaining</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        onClick={handleRegister}
                        disabled={registering}
                      >
                        {registering ? "Registering..." : "Register Now"}
                      </Button>
                    </div>
                  ) : isRegistered ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                        <UserCheck className="h-5 w-5" />
                        <span className="font-semibold">You're Registered!</span>
                      </div>
                      <p className="text-gray-400 text-sm">Good luck in the tournament!</p>
                    </div>
                  ) : registrationClosed ? (
                    <div className="text-center">
                      <p className="text-red-400 font-semibold">Registration Closed</p>
                      <p className="text-gray-400 text-sm">Registration deadline has passed</p>
                    </div>
                  ) : spotsRemaining <= 0 ? (
                    <div className="text-center">
                      <p className="text-yellow-400 font-semibold">Tournament Full</p>
                      <p className="text-gray-400 text-sm">All spots have been taken</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 font-semibold">Registration Unavailable</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {participants.map((participant, index) => (
                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                          <span className="text-gray-300">Player {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">No participants yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bracket">
          <TournamentBracket 
            tournamentId={tournamentId}
            participants={participants}
            bracketGenerated={tournament.bracket_generated}
            onBracketGenerated={handleBracketGenerated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
