
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePrizeDistribution = () => {
  const [distributing, setDistributing] = useState(false);
  const { toast } = useToast();

  const distributePrizes = async (tournamentId: string) => {
    setDistributing(true);
    try {
      const { error } = await supabase.rpc('distribute_tournament_prizes', {
        tournament_id_param: tournamentId
      });

      if (error) throw error;

      toast({
        title: "Prizes Distributed",
        description: "Tournament prizes have been distributed successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error distributing prizes:', error);
      toast({
        title: "Distribution Failed",
        description: "Failed to distribute tournament prizes.",
        variant: "destructive"
      });
      return false;
    } finally {
      setDistributing(false);
    }
  };

  const getPlatformCommission = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'platform_commission_rate')
        .single();

      if (error) throw error;
      return parseFloat(data.value as string) || 0.10;
    } catch (error) {
      console.error('Error fetching commission rate:', error);
      return 0.10; // Default 10%
    }
  };

  return {
    distributePrizes,
    distributing,
    getPlatformCommission
  };
};
