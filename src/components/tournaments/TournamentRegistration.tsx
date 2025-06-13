
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Tournament = Tables<'tournaments'>;
type TournamentParticipant = Tables<'tournament_participants'>;

interface TournamentRegistrationProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isRegistered: boolean;
  onRegistrationChange: () => void;
}

export const TournamentRegistration = ({ 
  tournament, 
  participants, 
  isRegistered, 
  onRegistrationChange 
}: TournamentRegistrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const spotsRemaining = tournament.max_participants - participants.length;
  const registrationDeadlinePassed = new Date(tournament.registration_deadline) < new Date();
  const tournamentStarted = new Date(tournament.start_date) < new Date();

  const canRegister = user && 
    tournament.status === 'registration_open' && 
    !isRegistered && 
    spotsRemaining > 0 && 
    !registrationDeadlinePassed && 
    !tournamentStarted;

  const canUnregister = user && 
    isRegistered && 
    tournament.status === 'registration_open' && 
    !tournamentStarted;

  const handleRegister = async () => {
    if (!user || !canRegister) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournament.id,
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
        description: `You have been registered for ${tournament.title}.`,
      });

      onRegistrationChange();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for tournament.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !canUnregister) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournament.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Unregistered Successfully",
        description: `You have been removed from ${tournament.title}.`,
      });

      onRegistrationChange();
    } catch (error) {
      console.error('Unregistration error:', error);
      toast({
        title: "Unregistration Failed",
        description: "Failed to unregister from tournament.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationStatus = () => {
    if (tournamentStarted) return { text: "Tournament Started", color: "bg-red-600", icon: XCircle };
    if (registrationDeadlinePassed) return { text: "Registration Closed", color: "bg-red-600", icon: XCircle };
    if (spotsRemaining === 0) return { text: "Tournament Full", color: "bg-yellow-600", icon: XCircle };
    if (tournament.status !== 'registration_open') return { text: "Registration Closed", color: "bg-gray-600", icon: XCircle };
    return { text: "Registration Open", color: "bg-green-600", icon: CheckCircle };
  };

  const status = getRegistrationStatus();

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg">Registration Status</CardTitle>
          <Badge className={`${status.color} text-white flex items-center gap-1`}>
            <status.icon className="h-3 w-3" />
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-white font-semibold">{participants.length}/{tournament.max_participants}</div>
              <div className="text-gray-400 text-sm">Participants</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-white font-semibold">{spotsRemaining}</div>
              <div className="text-gray-400 text-sm">Spots Left</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p>Registration closes: {new Date(tournament.registration_deadline).toLocaleDateString()}</p>
          <p>Tournament starts: {new Date(tournament.start_date).toLocaleDateString()}</p>
        </div>

        {user ? (
          <div className="flex gap-2">
            {canRegister && (
              <Button 
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {loading ? "Registering..." : "Register Now"}
              </Button>
            )}
            
            {canUnregister && (
              <Button 
                onClick={handleUnregister}
                disabled={loading}
                variant="outline"
                className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                {loading ? "Unregistering..." : "Unregister"}
              </Button>
            )}

            {isRegistered && !canUnregister && (
              <Badge className="flex-1 bg-green-600 text-white justify-center py-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                Registered
              </Badge>
            )}
          </div>
        ) : (
          <Button 
            variant="outline"
            className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            onClick={() => toast({
              title: "Sign in Required",
              description: "Please sign in to register for tournaments."
            })}
          >
            Sign in to Register
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
