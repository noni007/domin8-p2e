
import { useState } from 'react';
import { TournamentLifecycleService } from '@/services/tournamentLifecycleService';
import { usePrizeDistribution } from '@/hooks/usePrizeDistribution';
import { toast } from '@/hooks/use-toast';

export const useTournamentLifecycle = () => {
  const [loading, setLoading] = useState(false);
  const { distributePrizes } = usePrizeDistribution();

  const startTournament = async (tournamentId: string) => {
    setLoading(true);
    try {
      await TournamentLifecycleService.startTournament(tournamentId);
      toast({
        title: "Tournament Started",
        description: "The tournament is now in progress!"
      });
      return true;
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast({
        title: "Error",
        description: "Failed to start tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async (tournamentId: string) => {
    setLoading(true);
    try {
      await TournamentLifecycleService.generateBracket(tournamentId);
      toast({
        title: "Bracket Generated",
        description: "Tournament bracket has been created successfully!"
      });
      return true;
    } catch (error) {
      console.error('Error generating bracket:', error);
      toast({
        title: "Error",
        description: "Failed to generate tournament bracket",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeTournament = async (tournamentId: string, winnerId: string, shouldDistributePrizes: boolean = true) => {
    setLoading(true);
    try {
      await TournamentLifecycleService.completeTournament(tournamentId, winnerId);
      
      if (shouldDistributePrizes) {
        await distributePrizes(tournamentId);
      }
      
      toast({
        title: "Tournament Completed",
        description: "Tournament has been completed and prizes distributed!"
      });
      return true;
    } catch (error) {
      console.error('Error completing tournament:', error);
      toast({
        title: "Error",
        description: "Failed to complete tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelTournament = async (tournamentId: string) => {
    setLoading(true);
    try {
      await TournamentLifecycleService.cancelTournament(tournamentId);
      toast({
        title: "Tournament Cancelled",
        description: "Tournament has been cancelled and refunds processed"
      });
      return true;
    } catch (error) {
      console.error('Error cancelling tournament:', error);
      toast({
        title: "Error",
        description: "Failed to cancel tournament",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    startTournament,
    generateBracket,
    completeTournament,
    cancelTournament,
    loading
  };
};
