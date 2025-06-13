
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WaitlistStats {
  total_count: number;
  progress_to_next_milestone: number;
  next_milestone_target: number;
  next_milestone_title: string;
}

interface Milestone {
  id: string;
  milestone_count: number;
  title: string;
  description: string;
  reward_type: string;
  unlocked_at: string | null;
}

export const useFeatureWaitlist = (feature: string = 'historical_stats_upload') => {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_waitlist_stats', { feature });

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching waitlist stats:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist_milestones')
        .select('*')
        .eq('feature_name', feature)
        .order('milestone_count', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const joinWaitlist = async (email: string, referralCode?: string) => {
    setJoining(true);
    try {
      // Get current count for position
      const { data: countData } = await supabase
        .from('feature_waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('feature_name', feature);

      const position = (countData?.length || 0) + 1;

      const { data, error } = await supabase
        .from('feature_waitlist')
        .insert([{
          email,
          feature_name: feature,
          join_position: position,
          referred_by: referralCode || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎉 You're on the waitlist!",
        description: `You're #${position} in line. We'll notify you when the feature is ready!`,
      });

      // Refresh stats
      await fetchStats();
      return data;
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already registered!",
          description: "You're already on the waitlist for this feature.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error joining waitlist",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMilestones()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('waitlist-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feature_waitlist'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [feature]);

  return {
    stats,
    milestones,
    loading,
    joining,
    joinWaitlist,
    refetch: () => Promise.all([fetchStats(), fetchMilestones()])
  };
};
