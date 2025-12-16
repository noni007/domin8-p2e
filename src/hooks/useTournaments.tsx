
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Type matching the RPC return structure
interface PublicTournament {
  id: string;
  title: string;
  description: string;
  game: string;
  status: string;
  prize_pool: number;
  entry_fee: number | null;
  max_participants: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  tournament_type: string;
  bracket_generated: boolean;
  created_at: string;
  organizer_username: string | null;
  participant_count: number;
}

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Use secure RPC function to fetch tournaments
        const { data, error } = await supabase
          .rpc('get_public_tournaments', { p_limit: 50 });

        if (error) throw error;
        setTournaments(data || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  return { tournaments, loading };
};
