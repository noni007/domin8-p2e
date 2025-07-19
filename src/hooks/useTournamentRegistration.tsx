
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logTournamentJoin } from '@/utils/activityHelpers';
import { useSimpleToast } from '@/hooks/useSimpleToast';

export const useTournamentRegistration = () => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [loading, setLoading] = useState(false);

  const registerForTournament = async (tournamentId: string, tournamentTitle: string, prizePool?: number) => {
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
      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You're already registered for this tournament",
          variant: "destructive"
        });
        return false;
      }

      // Register for tournament
      const { error: registrationError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id
        });

      if (registrationError) throw registrationError;

      // Log activity if the helper function exists
      try {
        await logTournamentJoin(user.id, tournamentTitle, tournamentId, prizePool);
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
        // Don't fail registration if activity logging fails
      }

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
