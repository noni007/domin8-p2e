
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Trophy, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TournamentBracket } from "./TournamentBracket";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeTournament } from "@/hooks/useRealTimeTournament";

interface TournamentDetailsProps {
  tournamentId: string;
  onBack: () => void;
}

export const TournamentDetails = ({ tournamentId, onBack }: TournamentDetailsProps) => {
  const { user } = useAuth();
  
  // Use real-time tournament hook
  const { tournament, participants, loading } = useRealTimeTournament({
    tournamentId,
    onTournamentUpdate: () => {
      console.log('Tournament updated via real-time');
    }
  });

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

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered'
        });

      if (error) {
        if (error.code === '23505') {
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
    }
  };

  const handleBracketUpdate = () => {
    // Real-time hooks will automatically update the data
    console.log('Bracket update triggered');
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

  const isRegistered = participants.some(p => p.user_id === user?.id);

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
                <Badge className="bg-purple-600 text-white text-xs">
                  Live Updates
                </Badge>
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
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              Register for Tournament
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
