
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logTournamentJoin } from '@/utils/activityHelpers';
import { useToast } from '@/hooks/use-toast';

export const useTournamentRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const registerForTournament = async (tournamentId: string, tournamentTitle: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for tournaments",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Register for tournament
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id
        });

      if (registrationError) throw registrationError;

      // Log activity
      await logTournamentJoin(user.id, tournamentTitle, tournamentId);

      toast({
        title: "Registration Successful",
        description: `You've registered for ${tournamentTitle}!`
      });

      return true;
    } catch (error) {
      console.error('Tournament registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unregisterFromTournament = async (tournamentId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Unregistered",
        description: "You've been removed from the tournament"
      });

      return true;
    } catch (error) {
      console.error('Tournament unregistration error:', error);
      toast({
        title: "Error",
        description: "Failed to unregister from tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerForTournament,
    unregisterFromTournament,
    loading
  };
};
